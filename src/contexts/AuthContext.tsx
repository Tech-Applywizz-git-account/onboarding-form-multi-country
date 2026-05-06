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
}

interface AuthContextType {
  isAuthorized: boolean;
  verifiedUser: VerifiedUser | null;
  resumeFile: File | null;
  authorize: (user: VerifiedUser) => void;
  logout: () => void;
  setResumeFile: (file: File | null) => void;
}

const SESSION_KEY = 'onboarding_auth';

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
  // Initialise from localStorage so reloads preserve the session
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as VerifiedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const isAuthorized = verifiedUser !== null;

  const authorize = (user: VerifiedUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setVerifiedUser(user);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setVerifiedUser(null);
    setResumeFile(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthorized, verifiedUser, resumeFile, authorize, logout, setResumeFile }}>
      {children}
    </AuthContext.Provider>
  );
};
