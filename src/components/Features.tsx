
import React from 'react';
import FadeIn from './animations/FadeIn';
import { ArrowRight, BarChart, FileText, MessageSquare, UserCheck } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <MessageSquare size={24} className="text-primary" />,
      title: "AI Career Guidance",
      description: "Get personalized career recommendations based on your skills, experience, and goals.",
      delay: 0,
    },
    {
      icon: <FileText size={24} className="text-primary" />,
      title: "ATS Resume Builder",
      description: "Create ATS-optimized resumes with real-time feedback to boost your application success rate.",
      delay: 100,
    },
    {
      icon: <BarChart size={24} className="text-primary" />,
      title: "Skill Gap Analysis",
      description: "Identify skill gaps between your profile and dream jobs with customized learning recommendations.",
      delay: 200,
    },
    {
      icon: <UserCheck size={24} className="text-primary" />,
      title: "Interview Preparation",
      description: "Practice with AI-powered mock interviews tailored to your target positions and industries.",
      delay: 300,
    },
  ];

  return (
    <section id="feature" className="py-24">
      <div className="container mx-auto px-4">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Elevate Your Career Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to transform your career path with AI-powered insights and guidance.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FadeIn key={index} direction="up" delay={feature.delay} className="h-full">
              <div className="glass-card h-full rounded-xl p-6 flex flex-col">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4 flex-1">{feature.description}</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-primary font-medium mt-auto group"
                >
                  Learn more 
                  <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
