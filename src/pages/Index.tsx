
import React, { useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ChatInterface from '@/components/ChatInterface';
import Footer from '@/components/Footer';
import FadeIn from '@/components/animations/FadeIn';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        <Hero />

        <section id="feature">
        <Features />
        </section>
        
        {/* Career Guide Section */}
        <section id="AI-ChatBot" className="py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="right">
                <div className="max-w-xl">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                    AI Career Assistant
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Get Personalized Career Guidance
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Our AI assistant analyzes your skills, experience, and goals to provide tailored career advice. Ask questions about job trends, skill development, or career transitions.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      "Personalized career path recommendations",
                      "Industry-specific advice and insights",
                      "Skill development priorities",
                      "Salary expectations and negotiation tips"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
              
              <FadeIn direction="left" delay={200}>
                <ChatInterface />
              </FadeIn>
            </div>
          </div>
        </section>
        
        {/* Resume Builder Preview */}
        <section id="Resume" className="py-24">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                  ATS Resume Builder
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Create ATS-Optimized Resumes
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Build professional resumes that pass Applicant Tracking Systems and impress hiring managers.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={100}>
              <div className="relative max-w-4xl mx-auto">
                {/* Decorative elements */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full filter blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full filter blur-xl"></div>
                
                {/* Resume preview */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-xl relative z-10">
                  <div className="p-4 border-b border-border flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-auto"></div>
                    <span className="text-sm font-medium">Resume Builder</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Left sidebar - Resume template selector */}
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h3 className="font-medium mb-3">Templates</h3>
                      <div className="space-y-3">
                        {["Professional", "Creative", "Technical", "Executive"].map((template, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "p-2 rounded-md cursor-pointer transition-colors",
                              i === 0 ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary"
                            )}
                          >
                            <p className="text-sm">{template}</p>
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="font-medium mt-6 mb-3">ATS Score</h3>
                      <div className="bg-secondary rounded-full h-2 mb-2">
                        <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                      </div>
                      <p className="text-xs text-right text-muted-foreground">85/100</p>
                      
                      <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-2">Keyword Matches</p>
                        <div className="flex flex-wrap gap-2">
                          {["Product", "AI", "Management", "Strategy"].map((keyword, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Center and right - Resume preview */}
                    <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6 space-y-4">
                        <div className="text-center mb-4">
                          <h1 className="text-xl font-bold">Taylor Morgan</h1>
                          <p className="text-sm text-muted-foreground">Product Manager</p>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold border-b border-muted mb-2 pb-1">SUMMARY</h2>
                          <p className="text-xs">Results-driven Product Manager with 5+ years of experience developing innovative solutions in technology. Proven track record of increasing user engagement by 45% and revenue by 30%...</p>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold border-b border-muted mb-2 pb-1">EXPERIENCE</h2>
                          <div className="mb-3">
                            <div className="flex justify-between">
                              <p className="text-xs font-semibold">Senior Product Manager</p>
                              <p className="text-xs">2020 - Present</p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">InnovateTech, Inc.</p>
                            <ul className="text-xs list-disc list-inside space-y-1">
                              <li>Led development of AI-powered features, increasing user retention by 35%</li>
                              <li>Managed cross-functional team of 15 designers, engineers and analysts</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-sm font-bold border-b border-muted mb-2 pb-1">SKILLS</h2>
                          <div className="flex flex-wrap gap-2">
                            {["Product Strategy", "User Research", "Agile Methodologies", "Data Analysis", "Cross-functional Leadership"].map((skill, i) => (
                              <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section id="cta" className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <FadeIn direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Career Journey?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have accelerated their career growth with our AI-powered tools.
              </p>
              <Button asChild className="px-8 py-6 rounded-full text-lg h-auto">
                <Link to="/sign-up">Get Started for Free</Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
