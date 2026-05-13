import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Loader2, Mic, StopCircle, Video, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WordComparison {
  word: string;
  match: boolean;
}

type Stage = 'idle' | 'recording' | 'validating' | 'validated' | 'uploading' | 'done';

interface VideoValidatorProps {
  leadId: string;
  onSuccess?: () => void;
}

export function VideoValidator({ leadId, onSuccess }: VideoValidatorProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [comparison, setComparison] = useState<WordComparison[] | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [processingMessage, setProcessingMessage] = useState('');

  const expectedText = "Hello, I am John Doe, and I authorize this payment";

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const allGreen = comparison != null && comparison.every(w => w.match);

  // ── Step 1: Start Recording ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = handleValidate;

      mediaRecorder.start();
      setStage('recording');
      setComparison(null);
      setRecordedBlob(null);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      toast.error('Could not access camera or microphone. Please grant permissions.');
    }
  };

  // ── Step 2: Stop Recording ───────────────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current && stage === 'recording') {
      mediaRecorderRef.current.stop();
      // Stop all camera/mic tracks so the recording indicator turns off
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  // ── Step 3: Validate via AssemblyAI (no upload yet) ─────────────────────
  const handleValidate = async () => {
    setStage('validating');

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    setRecordedBlob(blob);

    try {
      // 3a. Get presigned URL to temporarily put the video for transcription
      setProcessingMessage('Preparing secure upload...');
      const fileName = `video-auth-temp-${Date.now()}.webm`;
      const presignedRes = await fetch(
        `/api/presigned-url?fileName=${encodeURIComponent(fileName)}&contentType=video%2Fwebm&leadId=${leadId}`
      );
      if (!presignedRes.ok) {
        const errText = await presignedRes.text();
        throw new Error(`Presigned URL failed: ${errText.slice(0, 200)}`);
      }
      const { presignedUrl, publicUrl } = await presignedRes.json();

      // 3b. Upload video to S3 so AssemblyAI can access it
      setProcessingMessage('Uploading for analysis...');
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'video/webm' },
      });
      if (!uploadRes.ok) throw new Error('Failed to upload video for analysis');

      // 3c. Validate with AssemblyAI
      setProcessingMessage('Analyzing speech...');
      const validateRes = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: publicUrl, expectedText }),
      });
      if (!validateRes.ok) {
        const errText = await validateRes.text();
        throw new Error(`Validation failed: ${errText.slice(0, 200)}`);
      }

      const result = await validateRes.json();
      setComparison(result.comparison);
      setStage('validated');

      const matchCount = result.comparison.filter((c: WordComparison) => c.match).length;
      const total = result.comparison.length;

      if (matchCount === total) {
        toast.success('Perfect! All words matched. Click Upload to proceed.');
      } else {
        toast.warning(`${matchCount}/${total} words matched. Re-record for a better result.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred. Please try again.');
      setStage('idle');
    }
  };

  // ── Step 4: Upload confirmed video to S3 ────────────────────────────────
  const handleUpload = async () => {
    if (!recordedBlob) return;
    setStage('uploading');

    try {
      setProcessingMessage('Uploading your video securely...');
      const fileName = `video-auth-${leadId}-${Date.now()}.webm`;
      const presignedRes = await fetch(
        `/api/presigned-url?fileName=${encodeURIComponent(fileName)}&contentType=video%2Fwebm&leadId=${leadId}`
      );
      if (!presignedRes.ok) throw new Error('Failed to get upload URL');
      const { presignedUrl } = await presignedRes.json();

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: recordedBlob,
        headers: { 'Content-Type': 'video/webm' },
      });
      if (!uploadRes.ok) throw new Error('Upload to S3 failed');

      setStage('done');
      toast.success('Video saved successfully!');
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed. Please try again.');
      setStage('validated');
    }
  };

  // ── Reset everything ─────────────────────────────────────────────────────
  const handleReset = () => {
    setStage('idle');
    setComparison(null);
    setRecordedBlob(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isProcessing = stage === 'validating' || stage === 'uploading';

  const processingOverlayMessage =
    stage === 'validating' ? processingMessage :
    stage === 'uploading' ? processingMessage :
    '';

  return (
    <div className="w-full flex flex-col gap-5">

      {/* ── Sentence Display ─────────────────────────────────────── */}
      <div className="p-4 bg-[#E8EBF4] rounded-lg text-center text-base font-semibold leading-relaxed border border-[#B5C0E0]">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Read this sentence clearly</p>
        {comparison ? (
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            {comparison.map((item, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded text-sm font-bold transition-colors duration-300 ${
                  item.match
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-600 border border-red-300'
                }`}
              >
                {item.word}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-800 text-base">"{expectedText}"</p>
        )}
      </div>

      {/* ── Video Preview with Overlay ───────────────────────────── */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Idle: no camera */}
        {stage === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-3">
            <Video className="w-12 h-12 text-white/40" />
            <p className="text-white/50 text-sm font-medium">Camera preview will appear here</p>
          </div>
        )}

        {/* Recording indicator */}
        {stage === 'recording' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">Recording</span>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
            <div className="h-12 w-12 rounded-full border-[3px] border-white/20 border-t-[#1F4096] animate-spin" />
            <p className="text-white text-sm font-semibold animate-pulse">{processingOverlayMessage}</p>
          </div>
        )}

        {/* Done overlay */}
        {stage === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <CheckCircle2 className="w-14 h-14 text-green-400" />
            <p className="text-white font-bold text-sm">Video Saved!</p>
          </div>
        )}
      </div>

      {/* ── Action Buttons ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">

        {/* Start Recording */}
        {(stage === 'idle') && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 h-11 px-10 text-xs font-black uppercase tracking-wider rounded-md bg-[#1F4096] text-white hover:bg-[#163075] active:scale-[0.98] shadow-md transition-all"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </button>
        )}

        {/* Stop Recording */}
        {stage === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 h-11 px-10 text-xs font-black uppercase tracking-wider rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-md transition-all animate-pulse"
          >
            <StopCircle className="w-4 h-4" />
            Stop Recording
          </button>
        )}

        {/* After validation: re-record or upload */}
        {stage === 'validated' && (
          <>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 h-11 px-6 text-xs font-black uppercase tracking-wider rounded-md border-2 border-[#1F4096] text-[#1F4096] hover:bg-[#1F4096] hover:text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Re-Record
            </button>

            <button
              onClick={handleUpload}
              disabled={!allGreen}
              title={!allGreen ? 'All words must be green to upload' : 'Upload video to proceed'}
              className={`flex items-center gap-2 h-11 px-10 text-xs font-black uppercase tracking-wider rounded-md transition-all shadow-md ${
                allGreen
                  ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
                  : 'bg-[#F2F2F2] text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload & Continue
            </button>
          </>
        )}

        {/* Uploading: spinner */}
        {stage === 'uploading' && (
          <button disabled className="flex items-center gap-2 h-11 px-10 text-xs font-black uppercase tracking-wider rounded-md bg-green-600 text-white opacity-70 cursor-not-allowed shadow-md">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </button>
        )}
      </div>

      {/* ── Status note under buttons ────────────────────────────── */}
      {stage === 'validated' && !allGreen && (
        <p className="text-center text-xs text-red-500 font-semibold">
          Some words are shown in red. Please re-record until all words are green to continue.
        </p>
      )}
      {stage === 'validated' && allGreen && (
        <p className="text-center text-xs text-green-600 font-semibold">
          ✓ All words matched! Click "Upload & Continue" to proceed.
        </p>
      )}
    </div>
  );
}
