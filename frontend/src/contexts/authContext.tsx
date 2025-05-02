import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  token: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  bio?: string;
  skills?: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_TIMEOUT = 60 * 60 * 1000; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage - FIXED: case-sensitive key "user"
    const savedUser = localStorage.getItem("user");
    const loginTime = localStorage.getItem("loginTime");
    
    if (savedUser && loginTime) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        
        if (timeSinceLogin < SESSION_TIMEOUT) {
          setUser(parsedUser);
        } else {
          // Session expired
          localStorage.removeItem("user");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginTime");
          toast.error("Your session has expired. Please log in again.");
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
      }
    }
    setLoading(false);
  }, []);

  // Check for session timeout periodically
  useEffect(() => {
    const checkSessionTimeout = () => {
      const loginTime = localStorage.getItem("loginTime");
      if (loginTime) {
        const timeSinceLogin = Date.now() - parseInt(loginTime);
        if (timeSinceLogin >= SESSION_TIMEOUT) {
          logout();
          toast.error("Your session has expired. Please log in again.");
        }
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      console.log("Login response:", data); // Debugging line
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Format user data
      const userData = {
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        token: data.token
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", Date.now().toString());
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Format user data
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        token: data.token
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("loginTime", Date.now().toString());
      toast.success("Account created successfully");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};