import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Brain, 
  FileText, 
  BarChart4, 
  UserCheck, 
  BriefcaseBusiness, 
  LineChart, 
  ArrowRight, 
  Sparkles,
  MapIcon, 
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: "blue" | "purple" | "green" | "pink" | "orange";
  index: number;
}

const FeatureCard = ({ icon, title, description, link, color, index }: FeatureCardProps) => {
  const colorClasses = {
    blue: {
      bg: "bg-ai-blue",
      light: "bg-ai-blue/10",
      text: "text-ai-blue",
    },
    purple: {
      bg: "bg-ai-purple",
      light: "bg-ai-purple/10",
      text: "text-ai-purple",
    },
    green: {
      bg: "bg-ai-green",
      light: "bg-ai-green/10",
      text: "text-ai-green",
    },
    pink: {
      bg: "bg-ai-pink",
      light: "bg-ai-pink/10",
      text: "text-ai-pink",
    },
    orange: {
      bg: "bg-ai-orange",
      light: "bg-ai-orange/10",
      text: "text-ai-orange",
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="neo-card p-6 h-full floating-card pulsing-card">
        <div className={`h-14 w-14 rounded-2xl ${colorClasses[color].bg} flex items-center justify-center mb-6`}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-7 w-7 text-white" })}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-foreground/70 mb-6">{description}</p>
        <Link 
          to={link} 
          className={`flex items-center gap-2 ${colorClasses[color].text} font-medium text-sm group-hover:gap-3 transition-all`}
        >
          Explore feature <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Brain />,
      title: "AI Career Guide",
      description: "Receive personalized career path recommendations based on your skills, experience, and goals.",
      link: "/career-guide",
      color: "blue" as const,
    },
    {
      icon: <FileText />,
      title: "Smart Resume Builder",
      description: "Create ATS-optimized resumes with real-time feedback and keyword suggestions.",
      link: "/resumes",
      color: "purple" as const,
    },
    {
      icon: <MapIcon/>,
      title: "Roadmaps",
      description: "Identify and bridge your skill gaps with custom learning recommendations.",
      link: "/dashboard",
      color: "orange" as const,
    },
  ];

  return (
    <section className="py-24 px-4 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-futuristic-grid bg-grid opacity-10 z-0"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neo-card text-ai-blue mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Accelerate Your Career with <span className="bg-gradient-to-r from-ai-blue via-ai-purple to-ai-red text-transparent bg-clip-text">Smart Tools</span>
          </h2>
          
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Our comprehensive suite of AI-powered tools helps you make informed career decisions
            and stand out in today's competitive job market.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              link={feature.link}
              color={feature.color}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
