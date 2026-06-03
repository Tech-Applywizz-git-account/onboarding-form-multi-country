// //src/App.tsx
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Landing from "./pages/Landing";
// import Onboarding from "./pages/Onboarding";
// import Success from "./pages/Success";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Landing />} />
//           <Route path="/onboarding" element={<Onboarding />} />
//           <Route path="/success" element={<Success />} />
//           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;



// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding/index";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import ResumeUpload from "./pages/Onboarding/ResumeUpload";
import VideoValidationPage from "./pages/Onboarding/VideoValidationPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Import AuthContext

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              {/* Protect Onboarding route with authentication check */}
              <Route
                path="/video-validation"
                element={
                  <ProtectedRoute>
                    <VideoValidationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-upload"
                element={
                  <ProtectedRoute requireVideo>
                    <ResumeUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireVideo>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route path="/success" element={<Success />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

// ProtectedRoute  component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireVideo?: boolean }> = ({ children, requireVideo }) => {
  const { isAuthorized, videoUrl } = useAuth();

  if (!isAuthorized) {
    // If not authorized, redirect to the landing page
    return <Navigate to="/" replace />;
  }

  if (requireVideo && !videoUrl) {
    // If authorized but video validation not completed, redirect to video validation
    return <Navigate to="/video-validation" replace />;
  }

  return <>{children}</>; // Allow access to the route if authorized
};

export default App;
