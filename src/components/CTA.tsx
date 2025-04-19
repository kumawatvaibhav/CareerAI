import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  const benefits = [
    "AI-powered resume analysis and optimization",
    "Personalized career path recommendations",
    "Real-time job market insights and trends",
    "Interactive skill gap analysis dashboard"
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-career-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-career-200 rounded-full translate-x-1/2 translate-y-1/2 opacity-60 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-career-300 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
      </div>

      <div className="container relative z-10 ">
        <div className="glass-card p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to <span className="gradient-text">Transform</span> Your Career Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of professionals who have already accelerated their careers with our powerful, AI-driven platform.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-6 w-6 text-career-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="ghost"
                  className="bg-teal-600 hover:bg-career-600 text-white py-6 px-8 text-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Get Started Free <ArrowRight className="ml-2" />
                </Button>
                {/* <Button
                  variant="destructive"
                  className="py-6 px-8 text-lg"
                >
                  Watch Demo
                </Button> */}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-1 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="mx-auto text-xs text-gray-400">NIRDESHAK.AI Dashboard</div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-lg bg-career-100 dark:bg-career-900/20 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-career-500/20 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-career-500"></div>
                        </div>
                      </div>
                      <div className="h-24 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-4 w-4/6 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-10 w-full bg-career-500 rounded-md flex items-center justify-center">
                      <div className="h-4 w-24 bg-white/30 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-12 w-12 bg-career-100 rounded-lg animate-bounce-subtle"></div>
              <div className="absolute -bottom-8 -left-8 h-16 w-16 bg-gradient-to-br from-career-300 to-career-500 rounded-full animate-spin-slow opacity-70"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
