// // src/contexts/AuthContext.tsx
// import React, { createContext, useContext, useState } from 'react';

// interface AuthContextType {
//   isAuthorized: boolean;
//   authorize: () => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   const authorize = () => setIsAuthorized(true);
//   const logout = () => setIsAuthorized(false);

//   return (
//     <AuthContext.Provider value={{ isAuthorized, authorize, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface VerifiedUser {
  applywizz_id: string;
  email: string;
  phone: string;
  name?: string;
}

interface AuthContextType {
  isAuthorized: boolean;
  verifiedUser: VerifiedUser | null;
  resumeFile: File | null;
  videoUrl: string | null;
  authorize: (user: VerifiedUser) => void;
  logout: () => void;
  setResumeFile: (file: File | null) => void;
  setVideoUrl: (url: string | null) => void;
}

const SESSION_KEY = 'onboarding_auth';
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

interface AuthSession {
  user: VerifiedUser;
  timestamp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    return localStorage.getItem('onboarding_video_url');
  });

  const handleSetVideoUrl = (url: string | null) => {
    if (url) {
      localStorage.setItem('onboarding_video_url', url);
    } else {
      localStorage.removeItem('onboarding_video_url');
    }
    setVideoUrl(url);
  };
  
  // Initialise from localStorage with a 2-hour expiry check
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Migration/Safety check: If the stored data is old format (doesn't have .user) 
      // or missing .timestamp, clear it and force re-login
      if (!session || !session.user || !session.timestamp) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      const now = Date.now();
      // If session is older than 2 hours, clear it
      if (now - session.timestamp > SESSION_TIMEOUT) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('onboarding_video_url');
        return null;
      }

      return session.user as VerifiedUser;
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  const isAuthorized = !!verifiedUser;

  const authorize = (user: VerifiedUser) => {
    const session: AuthSession = {
      user,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setVerifiedUser(user);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('onboarding_video_url');
    setVerifiedUser(null);
    setResumeFile(null);
    setVideoUrl(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthorized, 
      verifiedUser, 
      resumeFile, 
      videoUrl, 
      authorize, 
      logout, 
      setResumeFile,
      setVideoUrl: handleSetVideoUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};
