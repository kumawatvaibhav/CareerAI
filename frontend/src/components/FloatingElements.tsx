
import React from "react";
import { motion } from "framer-motion";

interface FloatingElementsProps {
  className?: string;
  density?: "low" | "medium" | "high";
  colors?: ("red" | "blue" | "green" | "purple" | "pink" | "orange" | "yellow")[];
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  className = "",
  density = "medium",
  colors = ["blue", "purple", "pink"]
}) => {
  // Determine number of elements based on density
  const getElementCount = () => {
    switch (density) {
      case "low": return 3;
      case "medium": return 6;
      case "high": return 9;
      default: return 6;
    }
  };

  const elementCount = getElementCount();
  
  // Generate random positions for elements
  const elements = Array.from({ length: elementCount }).map((_, i) => {
    const size = Math.floor(Math.random() * 300) + 100;
    const color = colors[i % colors.length];
    const delay = Math.random() * 10;
    const duration = Math.random() * 20 + 15;
    
    const colorClasses: Record<string, string> = {
      red: "bg-ai-red/30",
      blue: "bg-ai-blue/30",
      green: "bg-ai-green/30",
      purple: "bg-ai-purple/30",
      pink: "bg-ai-pink/30",
      orange: "bg-ai-orange/30",
      yellow: "bg-ai-yellow/30"
    };
    
    const colorClass = colorClasses[color];
    
    return {
      id: i,
      size,
      left: `${Math.random() * 90}%`,
      top: `${Math.random() * 90}%`,
      color: colorClass,
      delay,
      duration
    };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map(element => (
        <motion.div
          key={element.id}
          className={`shape-blob ${element.color} opacity-30`}
          style={{
            width: element.size,
            height: element.size,
            left: element.left,
            top: element.top,
            zIndex: -1
          }}
          animate={{
            x: [0, -20, 20, -20, 0],
            y: [0, 20, -20, 20, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: element.duration,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatType: "reverse",
            delay: element.delay
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
