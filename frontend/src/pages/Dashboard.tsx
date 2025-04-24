import React, { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  FileText, 
  MessageCircleQuestion, 
  GraduationCap, 
  PenTool, 
  BriefcaseBusiness, 
  Users, 
  BarChart3,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  LogOut,
  Home,
  User
} from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { dashboardService, resumeService, chatService } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "@/components/EmptyState";
import UserProfile from "../components/UserProfile";

const LoggedIn = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return { isLoggedIn };
};

const Dashboard = () => {
  const { isLoggedIn } = LoggedIn();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }
  
  // Check if currently viewing profile section
  const isProfileView = location.pathname.includes('/dashboard/profile');
  
  // Handle sign out
  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Handle profile navigation
  const navigateToProfile = () => {
    navigate('/dashboard/profile');
  };

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard,
    error: dashboardError
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
  });
  
  // Fetch resume data
  const {
    data: resumes,
    isLoading: isLoadingResumes,
    error: resumesError
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeService.getResumes,
  });
  
  // Fetch chat histories
  const {
    data: chatHistories,
    isLoading: isLoadingChats,
    error: chatsError
  } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChatHistories,
  });

  // Fetch career roadmaps data
  const {
    data: roadmapsData,
    isLoading: isLoadingRoadmaps,
    error: roadmapsError
  } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const response = await fetch('/final_detailed_career_roadmaps.json');
      if (!response.ok) {
        throw new Error('Failed to fetch roadmaps');
      }
      return response.json();
    }
  });

  // Default features with fallback values when data isn't available
  const features = [
    {
      id: 1,
      title: "Resume Builder",
      description: "Create ATS-optimized resumes with real-time feedback",
      icon: FileText,
      link: "/resumes",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      count: isLoadingResumes 
        ? "Loading..." 
        : resumesError 
          ? "Not available" 
          : resumes?.length === 0 
            ? "No resumes" 
            : `${resumes?.length} Resume${resumes?.length !== 1 ? 's' : ''}`
    },
    {
      id: 2,
      title: "Career Guidance",
      description: "Get personalized career advice from our AI assistant",
      icon: MessageCircleQuestion,
      link: "/career-guide",
      color: "bg-ai-blue/40",
      count: "24/7 Support"
    },
    {
      id: 3,
      title: "Learning Paths",
      description: "Discover customized learning roadmaps for your career",
      icon: GraduationCap,
      link: "/career-roadmaps",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
      count: isLoadingRoadmaps 
        ? "Loading..." 
        : roadmapsError 
          ? "Not available" 
          : `${Object.keys(roadmapsData || {}).length} Paths`
    },
    {
      id: 4,
      title: "Job Tracker",
      description: "Organize and track your job applications in one place",
      icon: BriefcaseBusiness,
      link: "#",
      color: "bg-gradient-to-r from-rose-500 to-pink-500",
      count: isLoadingDashboard 
        ? "Loading..." 
        : dashboardError 
          ? "Not available" 
          : `${dashboardData?.dashboard?.stats?.jobApplications || 0} Applications`
    },
    {
      id: 5,
      title: "Networking Assistant",
      description: "Improve your professional networking strategy",
      icon: Users,
      link: "#",
      color: "bg-gradient-to-r from-violet-500 to-purple-500",
      count: "Network Growth"
    }
  ];

  // Default stats with fallback values when dashboard data isn't available
  const stats = [
    {
      title: "Profile Strength",
      value: dashboardError ? "N/A" : `${dashboardData?.dashboard?.stats?.profileStrength || 0}%`,
      icon: BarChart3,
      color: "text-blue-500"
    },
    {
      title: "Skills Added",
      value: dashboardError ? "N/A" : (dashboardData?.dashboard?.stats?.skillsAdded || 0).toString(),
      icon: Award,
      color: "text-purple-500"
    },
    {
      title: "Learning Progress",
      value: dashboardError ? "N/A" : `${dashboardData?.dashboard?.stats?.learningProgress || 0}%`,
      icon: BookOpen,
      color: "text-amber-500"
    },
    {
      title: "Job Applications",
      value: dashboardError ? "N/A" : (dashboardData?.dashboard?.stats?.jobApplications || 0).toString(),
      icon: Briefcase,
      color: "text-green-500"
    }
  ];

  // Get recent activity with fallback for errors
  const recentActivity = dashboardError ? [] : (dashboardData?.dashboard?.recentActivity || []);

  // Loading indicator for the entire dashboard
  if (isLoadingDashboard && isLoadingResumes && isLoadingChats) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-background relative">
      {/* Top right navigation buttons */}
      <div className="absolute top-2 right-6 flex gap-2 z-10">
        <Link to="/">
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-ai-blue/20">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                  <BriefcaseBusiness className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-2xl gradient-text text-ai-blue">Dashboard</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setActiveSection("overview")}
                        isActive={activeSection === "overview"}
                        tooltip="Overview"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setActiveSection("profile")}
                        isActive={activeSection === "profile"}
                        tooltip="Your Profile"
                      >
                        <User className="h-4 w-4" />
                        <span>Your Profile</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Tools</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {features.slice(0, 4).map(feature => (
                      <SidebarMenuItem key={feature.id}>
                        <SidebarMenuButton 
                          asChild={feature.link !== "#"} 
                          tooltip={feature.title}
                        >
                          {feature.link !== "#" ? (
                            <Link to={feature.link}>
                              <feature.icon className="h-4 w-4" />
                              <span>{feature.title}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center w-full">
                              <feature.icon className="h-4 w-4" />
                              <span>{feature.title}</span>
                              <Badge className="ml-auto text-xs" variant="outline">Soon</Badge>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {features.slice(4).map(feature => (
                      <SidebarMenuItem key={feature.id}>
                        <SidebarMenuButton 
                          asChild={feature.link !== "#"} 
                          tooltip={feature.title}
                        >
                          {feature.link !== "#" ? (
                            <Link to={feature.link}>
                              <feature.icon className="h-4 w-4" />
                              <span>{feature.title}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center w-full">
                              <feature.icon className="h-4 w-4" />
                              <span>{feature.title}</span>
                              <Badge className="ml-auto text-xs" variant="outline">Soon</Badge>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="px-3 py-2">
                <div 
                  className="rounded-lg bg-muted p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={navigateToProfile}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-black">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          
          <div className="flex-1 pl-8">
            <AnimatePresence mode="wait">
              {activeSection === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
                    <p className="text-muted-foreground mt-2">
                      Manage your career growth and job search from your personal dashboard.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card className="p-4 border hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.title}</p>
                              <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                              <stat.icon className="h-5 w-5" />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="col-span-1"
                    >
                      <Card className="h-full">
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
                          {(!features || features.length === 0) ? (
                            <EmptyState
                              title="No features available"
                              description="Features will appear here once they're available"
                              icon={<Info size={40} />}
                            />
                          ) : (
                            <div className="space-y-3">
                              {features.slice(0, 3).map((feature, index) => (
                                <motion.div 
                                  key={feature.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                                >
                                  <Link to={feature.link !== "#" ? feature.link : "#"}>
                                    <div className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors group">
                                      <div className={`${feature.color} p-2 rounded-lg mr-4`}>
                                        <feature.icon className="h-5 w-5 text-white" />
                                      </div>
                                      <div className="flex-grow">
                                        <p className="font-medium">{feature.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">{feature.count}</p>
                                      </div>
                                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="col-span-1"
                    >
                      <Card className="h-full">
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Upcoming Tasks</h3>
                          {dashboardError ? (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">Task data currently unavailable</p>
                            </div>
                          ) : (!recentActivity || recentActivity.length === 0) ? (
                            <EmptyState
                              title="No tasks yet"
                              description="Your upcoming tasks will appear here"
                              icon={<Info size={40} />}
                            />
                          ) : (
                            <div className="flex flex-col space-y-4">
                              <div className="flex items-start p-3 rounded-lg bg-muted/50">
                                <div className="bg-amber-500/20 p-2 rounded-lg mr-4">
                                  <PenTool className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Update your resume</p>
                                  <p className="text-sm text-muted-foreground">Add your recent experience</p>
                                </div>
                              </div>
                              <div className="flex items-start p-3 rounded-lg bg-muted/50">
                                <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                  <GraduationCap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Complete skill assessment</p>
                                  <p className="text-sm text-muted-foreground">15 minutes remaining</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-6">All Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                      <motion.div 
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                        whileHover={{ y: -5 }}
                        className="group"
                      >
                        <Card className="border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                          <div className="p-6 flex flex-col h-full">
                            <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                              <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground mb-4 flex-grow">{feature.description}</p>
                            <Link to={feature.link}>
                              <Button variant={feature.link !== "#" ? "outline" : "secondary"} className="w-full">
                                {feature.link !== "#" ? "Get Started" : "Coming Soon"}
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <UserProfile />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;