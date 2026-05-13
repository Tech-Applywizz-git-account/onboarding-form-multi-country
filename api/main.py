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

# ─── App setup ───────────────────────────────────────────────────────────────
app = FastAPI()

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
            region_name=aws_region,
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
        )

        now = datetime.datetime.now()
        date_part = now.strftime("%d%m%Y")
        time_part = now.strftime("%H%M")

        clean_file_name = re.sub(r"[^a-zA-Z0-9\-_.]", "-", fileName)
        clean_file_name = re.sub(r"-+", "-", clean_file_name).lower()

        key = f"CRM/{leadId}-{date_part}-{time_part}-{clean_file_name}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": bucket_name, "Key": key, "ContentType": contentType},
            ExpiresIn=3600,
        )
        public_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{quote(key)}"

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
        if bucket_name and aws_region and f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/" in video_url:
            from urllib.parse import unquote
            key = unquote(video_url.split(f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/")[1])
            s3_client = boto3.client(
                "s3",
                region_name=aws_region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            video_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": key},
                ExpiresIn=3600,
            )

        config = aai.TranscriptionConfig(speech_models=['universal-3-pro'])  # type: ignore
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(video_url)

        if transcript.status == aai.TranscriptStatus.error:
            raise HTTPException(status_code=500, detail=f"Transcription error: {transcript.error}")

        # Build a flat list of every word the user actually said (cleaned)
        actual_cleaned: list[str] = []
        if transcript.words:
            for w in transcript.words:
                actual_cleaned.append(clean(w.text))
        else:
            # Fallback: split the raw transcript text
            actual_cleaned = [clean(w) for w in (transcript.text or "").split()]

        print(f"[validate] transcript: {transcript.text}")
        print(f"[validate] actual words: {actual_cleaned}")

        # Compare each expected word against the full actual word list
        expected_words = req.expectedText.split()
        comparison = []

        for expected_word in expected_words:
            cleaned_exp = clean(expected_word)
            # Match if the cleaned expected word appears ANYWHERE in the spoken words
            matched = cleaned_exp in actual_cleaned
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
