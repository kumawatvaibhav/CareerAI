
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { X, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Features', href: '#feature' },
    { name: 'Resume Builder', href: '#Resume' },
    { name: 'Career Guide', href: '#AI-ChatBot' },
    { name: 'About', href: '#about' },
  ];

  const authenticatedNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Resume Builder', href: '/resume-builder' },
    { name: 'Career Guide', href: '/career-guide' },
  ];

  const displayNavItems = isLoggedIn ? authenticatedNavItems : navItems;

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'py-3 bg-background/80 backdrop-blur-xl shadow-sm' : 'py-5 bg-transparent'
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Career.ai
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {displayNavItems.map((item) => (
            <Link 
              key={item.name}
              to={item.href}
              className="nav-item"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/sign-in')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/sign-up')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-foreground rounded-md focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "fixed inset-0 z-40 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-out-expo md:hidden",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full px-4 pt-24 pb-6">
          <nav className="flex flex-col space-y-6">
            {displayNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium px-2 py-1 transition-colors duration-200 hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col space-y-4">
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { navigate('/sign-in'); setMobileMenuOpen(false); }}>
                  Sign In
                </Button>
                <Button onClick={() => { navigate('/sign-up'); setMobileMenuOpen(false); }}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
