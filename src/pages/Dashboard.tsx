
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, GraduationCap, Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FadeIn from '@/components/animations/FadeIn';
import NavBar from '@/components/NavBar';

// This is a mock authentication check - we'll replace with actual auth later
const useAuth = () => {
  // For now, just check localStorage to see if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return { isLoggedIn };
};

const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  link, 
  className 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  link: string;
  className?: string;
}) => (
  <Card className={cn("transition-all hover:shadow-md", className)}>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardContent>
    <CardFooter>
      <Button variant="ghost" asChild className="ml-auto">
        <Link to={link}>
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const Dashboard = () => {
  const { isLoggedIn } = useAuth();

  // Redirect to sign in if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }

  const dashboardFeatures = [
    {
      title: "Resume Builder",
      description: "Create ATS-optimized resumes that stand out to employers and pass automated screening systems.",
      icon: FileText,
      link: "/resume-builder",
      className: "border-blue-100 hover:border-blue-300"
    },
    {
      title: "Career Guidance",
      description: "Get personalized advice and roadmaps for your dream career path from our AI assistant.",
      icon: GraduationCap,
      link: "/career-guide",
      className: "border-green-100 hover:border-green-300"
    },
    {
      title: "Road Maps",
      description: "Find the perfect road maps for your career goals, including skills, courses, and certifications.",
      icon: Briefcase,
      link: "/job-matcher",
      className: "border-purple-100 hover:border-purple-300"
    },
    {
      title: "Skill Analysis",
      description: "Identify skill gaps and get recommendations for courses and certifications.",
      icon: Brain,
      link: "/skill-analysis",
      className: "border-amber-100 hover:border-amber-300"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar/>
      
      <header className="bg-gray mt-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Let's continue building your career.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:gap-8">
            {dashboardFeatures.map((feature, index) => (
              <FadeIn key={feature.title} direction={index % 2 === 0 ? "right" : "left"} delay={index * 100}>
                <DashboardCard {...feature} />
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={400}>
          <div className="mt-12 bg-primary/5 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <p className="text-muted-foreground">You haven't completed any activities yet. Start by building your resume or exploring career paths.</p>
            <Button className="mt-4">
              Explore Features
            </Button>
          </div>
        </FadeIn>
      </main>
    </div>
  );
};

export default Dashboard;
