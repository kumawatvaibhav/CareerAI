
import React from 'react';
import { cn } from '@/lib/utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Resume Builder', href: '#resume-builder' },
        { name: 'Career Guide', href: '#career-guide' },
        { name: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Blog', href: '#blog' },
        { name: 'Career Tips', href: '#career-tips' },
        { name: 'Job Market Trends', href: '#job-market' },
        { name: 'Resume Examples', href: '#resume-examples' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Contact', href: '#contact' },
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Career.ai
              </span>
            </div>
            
            <p className="mt-4 text-muted-foreground">
              Advanced AI-powered tools to guide your career journey, create standout resumes, and land your dream job.
            </p>
            
            <div className="mt-6 flex space-x-4">
              {['Twitter', 'LinkedIn', 'Instagram', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href={`#${social.toLowerCase()}`}
                  className="p-2 rounded-full bg-secondary hover:bg-primary/10 transition-colors"
                  aria-label={social}
                >
                  <div className="w-5 h-5 rounded-full bg-muted-foreground/30"></div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {currentYear} Career.ai. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
