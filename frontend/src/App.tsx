import { AuthProvider } from "./contexts/authContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToast } from 'react-hot-toast';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResumeBuilder from "./pages/ResumeBuilder";
import CareerGuide from "./pages/CareerGuide";
import CareerRoadmaps from "./pages/CareerRoadmaps";
import NotFound from "./pages/NotFound";
import ResumeDashboard from './pages/ResumeDashboard';
import UserProfile from "./components/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HotToast position="top-right" />
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<UserProfile />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/resumes" element={<ResumeDashboard />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/resume-builder/:id" element={<ResumeBuilder />} />
            <Route path="/career-guide" element={<CareerGuide />} />
            <Route path="/career-roadmaps" element={<CareerRoadmaps />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
