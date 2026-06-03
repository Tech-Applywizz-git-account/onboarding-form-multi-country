import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Sparkles, ArrowRight, Loader2, ChevronLeft, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import FileDropzone from "@/components/FileDropzone";
import { extractTextFromFile, parseResumeViaRoute } from "./resumeParser";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const toastObj = useToast();
  const toast = toastObj.toast;
  const { resumeFile, setResumeFile } = useAuth();
  const [isVisibleToRecruiters, setIsVisibleToRecruiters] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingMessage, setParsingMessage] = useState("");

  const handleStartParsing = async () => {
    if (!resumeFile || isParsing) return;

    try {
      setIsParsing(true);

      const messages = [
        "Analyzing your data...",
        "Identifying personal information...",
        "Analyzing work history and roles...",
        "Extracting education details...",
        "Almost there! Preparing your form..."
      ];

      let msgIndex = 0;
      setParsingMessage(messages[0]);

      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setParsingMessage(messages[msgIndex]);
      }, 2000);

      // const text = await extractTextFromFile(resumeFile);
      const parsedData = await parseResumeViaRoute(resumeFile);
      clearInterval(msgInterval);

      if (parsedData) {
        // console.log("Extracted Resume Data:", parsedData);
        localStorage.setItem("resume_parsed_data", JSON.stringify(parsedData));
        toast({ title: "Analysis Complete", description: "Redirecting to your form..." });
        setTimeout(() => navigate("/onboarding", { replace: true }), 1000);
      }
    } catch (error: any) {
      console.error("Resume parsing error:", error);
      toast({ title: "Parsing Failed", description: "Please fill the form manually.", variant: "destructive" });
      navigate("/onboarding", { replace: true });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-md flex flex-col relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden max-h-[min(550px,92vh)]">
          {/* Blue Top Accent */}
          <div className="h-1 w-full bg-[#1F4096]" />

          {/* Parsing Overlay */}
          {isParsing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full border-[3px] border-slate-100 border-t-[#1F4096] animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Resume Analysis in Progress</h3>
                <p className="text-[#1F4096] text-sm font-medium animate-pulse">{parsingMessage}</p>
              </div>
            </div>
          )}

          <div className="p-5 md:p-8 flex flex-col gap-4 overflow-y-auto min-h-0">
            {/* Back Link */}
            <button
              onClick={() => navigate("/video-validation", { state: { forceRecord: true } })}
              className="flex items-center text-[#1F4096] font-bold text-[13px] hover:underline w-fit"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="space-y-0.5 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">UPLOAD A RESUME</h1>
              <p className="text-slate-500 text-[13px] font-medium leading-snug">
                We'll store your resume to enable you to instantly apply to jobs that match what you're looking for!
              </p>
            </div>

            {/* Centered File Upload */}
            <div className="mt-2 space-y-3 flex flex-col">
              <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                SELECT A FILE FROM YOUR DEVICE
              </label>
              <div className="min-h-[160px] bg-[#E8EBF4] border-2 border-dashed border-[#B5C0E0] rounded-lg relative hover:bg-[#DEE3F0] transition-all group overflow-hidden shadow-inner">
                <FileDropzone
                  label=""
                  onFileSelect={setResumeFile}
                  initialFile={resumeFile}
                  className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-none">
                  <CloudUpload className="h-10 w-10 text-[#1F4096]/40 group-hover:text-[#1F4096] transition-all group-hover:scale-110 duration-300" />
                  {!resumeFile ? (
                    <div className="text-[#1F4096] font-bold text-sm tracking-tight flex items-center gap-2">
                      BROWSE <span className="text-slate-400 font-normal text-xs">|</span> DROPBOX
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-slate-900 font-bold text-sm truncate max-w-[250px]">{resumeFile.name}</p>
                      <p className="text-[#1F4096] text-xs font-bold flex items-center justify-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        FILE ATTACHED
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-tight text-center md:text-left">
                We accept DOC, DOCX, PDF, RTF, TXT, up to 10MB.
              </p>
            </div>

            {/* Checkbox Section */}
            <div className="flex items-center space-x-3 mt-2">
              <Checkbox
                id="recruiters"
                checked={isVisibleToRecruiters}
                onCheckedChange={(checked) => setIsVisibleToRecruiters(checked as boolean)}
                className="h-4 w-4 border-slate-300 data-[state=checked]:bg-[#1F4096] data-[state=checked]:border-[#1F4096] rounded-[2px]"
              />
              <label
                htmlFor="recruiters"
                className="text-[13px] font-bold text-slate-700 cursor-pointer select-none"
              >
                Make your Resume visible to recruiters.
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-3 mt-2 pt-4 border-t border-slate-100">
              {resumeFile && !isParsing && (
                <Button
                  variant="outline"
                  onClick={() => setResumeFile(null)}
                  className="text-xs font-bold border-2 border-[#1F4096] text-[#1F4096] hover:bg-[#1F4096] hover:text-white px-6 h-10 transition-all uppercase tracking-wider"
                >
                  RE-UPLOAD NEW FILE
                </Button>
              )}
              <Button
                onClick={handleStartParsing}
                disabled={!resumeFile || isParsing}
                className={cn(
                  "h-10 px-10 text-xs font-black uppercase tracking-wider rounded-md transition-all duration-200 shadow-md",
                  resumeFile
                    ? "bg-[#1F4096] text-white hover:bg-[#163075] active:scale-[0.98] shadow-[#1F4096]/20"
                    : "bg-[#F2F2F2] text-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                {isParsing ? "PARSING..." : "Upload My Resume"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Line - Compact */}
      <footer className="h-2 bg-[#1F4096] w-full flex-shrink-0" />
    </div>
  );
};

export default ResumeUpload;
