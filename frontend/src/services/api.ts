import { toast } from "sonner";

// API URL
const API_URL = "http://localhost:5000/api";

// Utility function to get auth token from storage
const getToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};


// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.message || 'Something went wrong';
    toast.error(error);
    throw new Error(error);
  }
  
  return data;
};

// API service for resumes
export const resumeService = {
  // Get all resumes
  getResumes: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/resumes/getResumes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }
  },
  
  // Get resume by ID
  getResumeById: async (id: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/resumes/getResumeById/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  },
  
  // Create resume
  createResume: async (resumeData: { title: string, content: any }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/resumes/createResume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      const data = await handleResponse(response);
      toast.success('Resume created successfully');
      return data;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },
  
  // Update resume
  updateResume: async (id: string, resumeData: { title?: string, content?: any }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/resumes/updateResume/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      const data = await handleResponse(response);
      toast.success('Resume updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  },
  
  // Delete resume
  deleteResume: async (id: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/resumes/deleteResume/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      await handleResponse(response);
      toast.success('Resume deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
};

// API service for chat history
export const chatService = {
  // Get all chat histories
  getChatHistories: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/chats/getAllChats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      return [];
    }
  },
  
  // Get chat history by ID
  getChatHistoryById: async (id: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/chats/getChatById/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return null;
    }
  },
  
  // Create chat session
  createChatSession: async (chatData: { topic: string, initialMessage?: string }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },
  
  // Add message to chat history
  addMessage: async (chatId: string, messageData: { sender: 'user' | 'ai', content: string }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/chats/createChat/${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },
  
  // Delete chat history
  deleteChatHistory: async (id: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/chats/deleteChat/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      await handleResponse(response);
      toast.success('Chat history deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }
};

// API service for dashboard
export const dashboardService = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/dashboard/getDashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  },
  
  // Update dashboard stats
  updateDashboardStats: async (statsData: { 
    profileStrength?: number, 
    skillsAdded?: number, 
    learningProgress?: number, 
    jobApplications?: number 
  }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/dashboard/updateDashboard`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statsData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      throw error;
    }
  },
  
  // Add dashboard activity
  addActivity: async (text: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/dashboard/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding dashboard activity:', error);
      throw error;
    }
  }
};
