import React, { useEffect, useRef } from 'react';


const LoginBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create subtle floating circles
    const circleCount = 10;
    const circles: HTMLDivElement[] = [];

    for (let i = 0; i < circleCount; i++) {
      const circle = document.createElement('div');
      circle.className = 'absolute rounded-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-3xl';
      
      // Randomize sizes between 100px and 300px
      const size = Math.random() * 20 + 10;
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      
      // Random initial positions
      circle.style.left = `${Math.random() * 100}%`;
      circle.style.top = `${Math.random() * 100}%`;
      
      containerRef.current.appendChild(circle);
      circles.push(circle);
    }

    // Animate circles with subtle floating motion
    
    return () => {
      circles.forEach(circle => circle.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    />
  );
};

export default LoginBackground;
