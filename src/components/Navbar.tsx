import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, verifiedUser } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-2 cursor-pointer animate-in fade-in duration-300" onClick={() => navigate("/")}>
        <img 
          src="/applywizz_logo-with_text.png" 
          alt="Applywizz Logo" 
          className="h-10 w-auto object-contain"
        />
      </div>

      {isAuthorized && verifiedUser && (
        <div className="flex items-center gap-4">
          {/* User Details (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>ID: <b className="text-slate-900 font-mono">{verifiedUser.applywizz_id}</b></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-900 truncate max-w-[150px]" title={verifiedUser.email}>{verifiedUser.email}</span>
          </div>
        </div>
      )}
    </header>
  );
};
