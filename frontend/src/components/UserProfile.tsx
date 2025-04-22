import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";
import { 
  User, 
  PenLine, 
  FileText, 
  MessageCircle, 
  Lock, 
  Save,
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService, chatService, userService } from "../services/api";
import EmptyState from "@/components/EmptyState";

const UserProfile = () => {
  const { user } = useAuth();
  const {updateUser} = userService();
  const [activeTab, setActiveTab] = useState("personal");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  // Set up forms
  const personalForm = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || ""
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      personalForm.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || ""
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  // Fetch user resumes
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateUserProfile,
    onSuccess: () => {
      setSuccessMessage("Profile updated successfully!");
      queryClient.invalidateQueries(['user']);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to update profile. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      setSuccessMessage("Password changed successfully!");
      passwordForm.reset();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to change password. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  });

  // Handle personal info update
  const onPersonalSubmit = (data) => {
    updateProfileMutation.mutate({
      ...data,
      skills
    });
  };

  // Handle password change
  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("New passwords don't match!");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  // Add a new skill
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Download resume
  const handleDownloadResume = (resumeId) => {
    // Implementation would depend on your API
    console.log(`Downloading resume: ${resumeId}`);
  };

  // View chat history
  const handleViewChat = (chatId) => {
    // Implementation would depend on your navigation setup
    console.log(`Viewing chat: ${chatId}`);
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-4">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold">Your Profile</h1>
      </div>

      {(successMessage || errorMessage) && (
        <Alert 
          variant={successMessage ? "default" : "destructive"} 
          className="mb-6"
        >
          {successMessage ? 
            <div className="flex items-center text-green-600">
              <Save className="h-4 w-4 mr-2" />
              <span>{successMessage}</span>
            </div> : 
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </div>}
        </Alert>
      )}

      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" /> 
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" /> 
              Skills
            </TabsTrigger>
            <TabsTrigger value="resumes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> 
              Resumes
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> 
              Chat History
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> 
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
                    <FormField
                      control={personalForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} readOnly />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write a short bio about yourself"
                              className="resize-none min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            This will be used for your public profile
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills Management</CardTitle>
                <CardDescription>Add or remove your professional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="Add a new skill" 
                      value={newSkill} 
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddSkill} className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.length === 0 ? (
                      <p className="text-muted-foreground">No skills added yet</p>
                    ) : (
                      skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                          {skill}
                          <button 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => onPersonalSubmit(personalForm.getValues())} 
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Skills
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes">
            <Card>
              <CardHeader>
                <CardTitle>Your Resumes</CardTitle>
                <CardDescription>Access and manage your created resumes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumes ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : resumesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load resumes. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : resumes?.length === 0 ? (
                  <EmptyState
                    title="No resumes found"
                    description="You haven't created any resumes yet"
                    icon={<FileText size={40} />}
                    action={
                      <Button asChild>
                        <Link to="/resume-builder">Create Resume</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes?.map((resume, index) => (
                      <Card key={index} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{resume.title || `Resume ${index + 1}`}</CardTitle>
                          <CardDescription>
                            Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3 pt-0">
                          <div className="text-sm text-muted-foreground">
                            {resume.jobTitle && <p>Job Title: {resume.jobTitle}</p>}
                            {resume.totalPages && <p>Pages: {resume.totalPages}</p>}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between mt-auto">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/resume-builder/${resume.id}`}>
                              <PenLine className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownloadResume(resume.id)}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/resume-builder">
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Resume
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="chats">
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>View your past conversations with the Career Assistant</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingChats ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : chatsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load chat history. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : !chatHistories || chatHistories.length === 0 ? (
                  <EmptyState
                    title="No chat history"
                    description="You haven't had any conversations with our Career Assistant yet"
                    icon={<MessageCircle size={40} />}
                    action={
                      <Button asChild>
                        <Link to="/career-guidance">Start Chatting</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {chatHistories.map((chat, index) => (
                      <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {chat.title || `Chat Session ${index + 1}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(chat.createdAt).toLocaleString()}
                            </p>
                            {chat.preview && (
                              <p className="text-sm mt-2 line-clamp-2">{chat.preview}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/career-guidance/chat/${chat.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/career-guidance">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    New Conversation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter current password" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;