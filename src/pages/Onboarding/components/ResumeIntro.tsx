import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/FileDropzone";
import { cn } from "@/lib/utils";

interface ResumeIntroProps {
  onFileSelect: (file: File | null) => void;
  onStartParsing: () => void;
  onSkip: () => void;
  isParsing: boolean;
  parsingMessage: string;
  resumeFile: File | null;
}

export const ResumeIntro: React.FC<ResumeIntroProps> = ({
  onFileSelect,
  onStartParsing,
  onSkip,
  isParsing,
  parsingMessage,
  resumeFile,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Welcome to <span className="text-blue-600">ApplyWizz</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Upload your resume and let our AI auto-fill the onboarding form for you in seconds.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden relative">
        {isParsing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-300">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Processing Resume</h3>
              <p className="text-blue-600 font-medium animate-pulse">{parsingMessage}</p>
            </div>
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 animate-progress origin-left" />
            </div>
          </div>
        )}

        <div className="p-8 md:p-12 space-y-8">
          <FileDropzone
            label="Drop your Resume / CV here"
            onFileSelect={onFileSelect}
            initialFile={resumeFile}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50/50 rounded-2xl py-12"
          />

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={onStartParsing}
              disabled={!resumeFile || isParsing}
              className="w-full sm:flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 group transition-all"
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  Start Auto-fill with AI
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={onSkip}
              disabled={isParsing}
              className="w-full sm:w-auto h-14 px-8 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            >
              Skip & Fill Manually
            </Button>
          </div>
          
          <p className="text-center text-xs text-slate-400">
            Supported formats: PDF, DOCX, TXT (Max 20MB)
          </p>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {[
          { title: "Saves Time", desc: "No more repetitive typing" },
          { title: "AI Powered", desc: "Accurate field mapping" },
          { title: "Review Ready", desc: "Verify everything before submit" }
        ].map((item, i) => (
          <div key={i} className="p-4 space-y-1">
            <div className="text-sm font-bold text-slate-900">{item.title}</div>
            <div className="text-xs text-slate-500">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
