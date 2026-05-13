from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import boto3
import os
import datetime
import re
import string
from urllib.parse import quote
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import assemblyai as aai

# ─── Load .env (works both locally and on Vercel) ────────────────────────────
# Walk up from /api to the repo root to find the .env file
_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_dir, "..", ".env"))  # repo-root .env
load_dotenv(os.path.join(_dir, ".env"))        # api/.env fallback

# Initialize AssemblyAI
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

# ─── App setup ───────────────────────────────────────────────────────────────
app = FastAPI()

# S3 Configuration for SigV4
from botocore.config import Config
s3_config = Config(
    region_name=os.getenv("AWS_REGION", "us-east-2"),
    signature_version='s3v4',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidateRequest(BaseModel):
    videoUrl: str
    expectedText: str


# ─── Helper: strip punctuation and lowercase ─────────────────────────────────
def clean(word: str) -> str:
    return word.lower().translate(str.maketrans("", "", string.punctuation)).strip()


# ─── Presigned URL endpoint ───────────────────────────────────────────────────
@app.get("/api/presigned-url")
def get_presigned_url(fileName: str, contentType: str, leadId: str = "unknown"):
    aws_region = os.getenv("AWS_REGION")
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bucket_name = os.getenv("AWS_S3_BUCKET")

    if not all([aws_region, aws_key, aws_secret, bucket_name]):
        missing = [k for k, v in {
            "AWS_REGION": aws_region,
            "AWS_ACCESS_KEY_ID": aws_key,
            "AWS_SECRET_ACCESS_KEY": aws_secret,
            "AWS_S3_BUCKET": bucket_name,
        }.items() if not v]
        raise HTTPException(status_code=500, detail=f"Missing env vars: {missing}")

    try:
        s3_client = boto3.client(
            "s3",
            config=s3_config,
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
        )

        # Use a fixed key structure per leadId to allow overwriting on re-records
        # We sanitize the filename but exclude timestamps to keep the path constant
        clean_file_name = re.sub(r"[^a-zA-Z0-9\-_.]", "-", fileName)
        clean_file_name = re.sub(r"-+", "-", clean_file_name).lower()
        
        # Remove any existing timestamp patterns from the filename if they were sent by frontend
        # This is a safety measure to ensure 'video-auth-123-timestamp.webm' becomes 'video-auth-123.webm'
        clean_file_name = re.sub(r"-\d{10,13}", "", clean_file_name)

        key = f"CRM/{leadId}/{clean_file_name}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": bucket_name, "Key": key, "ContentType": contentType},
            ExpiresIn=3600,
        )
        public_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{quote(key, safe='/')}"

        return {"presignedUrl": presigned_url, "publicUrl": public_url, "key": key}

    except Exception as e:
        print(f"[presigned-url] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Validate endpoint ────────────────────────────────────────────────────────
@app.post("/api/validate")
def validate_video(req: ValidateRequest):
    api_key = os.getenv("ASSEMBLYAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ASSEMBLYAI_API_KEY not configured in .env")

    aai.settings.api_key = api_key

    try:
        video_url = req.videoUrl
        bucket_name = os.getenv("AWS_S3_BUCKET")
        aws_region = os.getenv("AWS_REGION")
        
        print(f"[validate] Input URL: {video_url}")
        print(f"[validate] Env: Bucket={bucket_name}, Region={aws_region}")

        # If it's an S3 URL from our bucket, generate a temporary presigned GET URL
        if bucket_name and bucket_name in video_url:
            from urllib.parse import unquote, urlparse
            parsed = urlparse(video_url)
            path = unquote(parsed.path)
            
            # Key extraction logic
            if path.startswith(f"/{bucket_name}/"):
                key = path[len(f"/{bucket_name}/"):]
            else:
                key = path.lstrip('/')

            print(f"[validate] Extracted Key: {key}")

            s3_client = boto3.client(
                "s3",
                config=s3_config,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            video_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": key},
                ExpiresIn=3600,
            )
            print(f"[validate] Generated Presigned URL: {video_url}")

        # Use the expected text as a prompt for universal-3-pro context boosting
        config = aai.TranscriptionConfig(
            speech_models=['universal-3-pro'], 
            prompt=req.expectedText
        )
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(video_url)

        if transcript.status == aai.TranscriptStatus.error:
            raise HTTPException(status_code=500, detail=f"Transcription error: {transcript.error}")

        def clean(w: str) -> str:
            return re.sub(r"[^\w]", "", w).lower()

        # Get full transcript text cleaned as one string to check for composite words
        full_transcript_cleaned = clean(transcript.text or "")
        actual_cleaned = [clean(w) for w in (transcript.text or "").split()]

        print(f"[validate] transcript: {transcript.text}")
        print(f"[validate] actual words: {actual_cleaned}")

        # Compare each expected word against the full actual word list
        expected_words = req.expectedText.split()
        comparison = []

        for expected_word in expected_words:
            cleaned_exp = clean(expected_word)
            
            # 1. Direct match (word exists in transcript)
            matched = cleaned_exp in actual_cleaned
            
            # 2. Composite match (e.g. "applywizz" matched against "apply whizz" in the full cleaned transcript)
            if not matched:
                matched = cleaned_exp in full_transcript_cleaned
                
            comparison.append({"word": expected_word, "match": matched})

        print(f"[validate] comparison: {comparison}")

        return {
            "success": True,
            "transcript": transcript.text,
            "comparison": comparison,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[validate] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
