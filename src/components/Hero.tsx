
import React from 'react';
import Button from './Button';
import FadeIn from './animations/FadeIn';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-60 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="max-w-xl">
            <FadeIn direction="up">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></span>
                AI-Powered Career Guidance
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Craft Your Perfect Career Path with <span className="text-gradient">AI Precision</span>
              </h1>
            </FadeIn>
            
            <FadeIn direction="up" delay={200}>
              <p className="text-muted-foreground text-lg mb-8">
                Transform your career journey with personalized guidance, ATS-optimized resumes, and real-time skill gap analysis—all powered by advanced AI.
              </p>
            </FadeIn>
            
            <FadeIn direction="up" delay={300}>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full min-w-[140px] font-medium">
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="rounded-full min-w-[140px] font-medium group">
                  <span>Explore Features</span>
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={400}>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <div className="w-full h-full bg-secondary/80"></div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">1,200+</span> professionals advanced their careers today
                </p>
              </div>
            </FadeIn>
          </div>
          
          {/* Right column - Chat Interface */}
          <FadeIn direction="left" delay={300} className="lg:mt-0 mt-8">
            <div className="w-full h-full flex justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary/10 rounded-full filter blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-blue-400/10 rounded-full filter blur-xl"></div>
                
                {/* Chat preview card */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-white/20">
                  <div className="p-4 border-b border-border flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-auto"></div>
                    <span className="text-sm font-medium">AI Career Assistant</span>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="mr-auto max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
                      <p className="text-sm">Hello! I'm your AI career assistant. How can I help with your career journey today?</p>
                    </div>
                    
                    <div className="ml-auto max-w-[80%] p-3 rounded-lg bg-primary text-primary-foreground">
                      <p className="text-sm">I'm looking to transition into a product management role. What skills should I focus on?</p>
                    </div>
                    
                    <div className="mr-auto max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
                      <p className="text-sm">For product management, I'd recommend focusing on data analysis, user experience design, and strategic thinking. Also, develop your communication skills to effectively work with different teams.</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center bg-secondary rounded-lg p-2">
                      <input
                        type="text"
                        placeholder="Type your career question..."
                        className="bg-transparent w-full focus:outline-none text-sm px-2"
                        readOnly
                      />
                      <button className="p-1 rounded-md bg-primary text-primary-foreground">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
