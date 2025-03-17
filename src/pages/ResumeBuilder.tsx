
import React from 'react';
import { Navigate } from 'react-router-dom';
import FadeIn from '@/components/animations/FadeIn';

// Mock authentication check - will be replaced with actual auth later
const useAuth = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return { isLoggedIn };
};

const ResumeBuilder = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <FadeIn>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>
          <p className="text-lg text-muted-foreground">
            Create professional, ATS-optimized resumes tailored to your dream job.
          </p>
          
          {/* Placeholder for resume builder interface */}
          <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border">
            <p className="text-center text-muted-foreground">
              Resume builder interface coming soon...
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default ResumeBuilder;
