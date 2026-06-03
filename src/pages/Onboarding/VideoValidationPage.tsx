import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { VideoValidator } from "@/components/VideoValidator";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

const VideoValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifiedUser, setVideoUrl, videoUrl } = useAuth();
  
  const leadId = verifiedUser?.applywizz_id || "unknown";

  useEffect(() => {
    const state = location.state as { forceRecord?: boolean } | null;
    if (videoUrl && !state?.forceRecord) {
      navigate("/resume-upload", { replace: true });
    }
  }, [videoUrl, navigate, location.state]);

  const handleSuccess = (url: string) => {
    setVideoUrl(url);
    // Proceed to the resume upload page after successful validation and DB sync
    setTimeout(() => {
      navigate("/resume-upload", { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-md flex flex-col relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
          {/* Blue Top Accent */}
          <div className="h-1 w-full bg-[#1F4096]" />

          <div className="p-5 md:p-8 flex flex-col gap-4">

            <div className="space-y-0.5 text-center md:text-left mb-4">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Identity Verification</h1>
              <p className="text-slate-500 text-[13px] font-medium leading-snug">
                For security purposes, please record a short video of yourself reading the statement below.
              </p>
            </div>

            {/* Video Validator Component */}
            <VideoValidator 
              leadId={leadId} 
              name={verifiedUser?.name}
              email={verifiedUser?.email}
              onSuccess={handleSuccess} 
            />
          </div>
        </div>
      </main>

      {/* Footer Line */}
      <footer className="h-2 bg-[#1F4096] w-full flex-shrink-0" />
    </div>
  );
};

export default VideoValidationPage;
