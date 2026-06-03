import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, verifiedUser, logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("resume_parsed_data");
    localStorage.removeItem("last_uploaded_resume_name");
    logout();
    toast({ title: "Logged out", description: "All local caches cleared." });
    navigate("/", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <div className="bg-[#1F4096] p-1.5 rounded-md flex items-center justify-center">
          <span className="text-white font-black text-xs tracking-tighter">AW</span>
        </div>
        <span className="text-lg font-black text-[#1F4096] tracking-tight uppercase">ApplyWizz</span>
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  );
};
