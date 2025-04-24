import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import FadeIn from '@/components/animations/FadeIn';
import NavBar from '@/components/NavBar';
import { Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMessage } from '@/utils/chatUtils';
import { 
  useCareerGuidanceData, 
  extractUniqueSkills,
  extractUniqueHobbies,
  getCareerSuggestionsBySelectedSkills,
  CareerGuidanceEntry,
  ConversationState
} from '@/utils/careerGuidanceUtils';
import { Select, SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateAICareerDescription, generateCareerRoadmap } from '@/utils/aiService';

// Mock authentication check - will be replaced with actual auth later
const useAuth = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return { isLoggedIn };
};

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  showControls?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: "👋 Hi, I am CareerAI! I'm here to help you find your perfect career path. To get started, may I know your name?",
    role: 'assistant',
    timestamp: new Date(),
  },
];

interface RoadmapPhase {
  title: string;
  topics: string[];
}

interface CareerRoadmap {
  title: string;
  phases: RoadmapPhase[];
}

interface RoadmapData {
  [key: string]: CareerRoadmap;
}

const CareerGuide = () => {
  const { isLoggedIn } = useAuth();
  const { data: careerData, isLoading: isDataLoading, error: dataError } = useCareerGuidanceData();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SelectOption[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<SelectOption[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.GREETING);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [availableSkills, setAvailableSkills] = useState<SelectOption[]>([]);
  const [availableHobbies, setAvailableHobbies] = useState<SelectOption[]>([]);
  const [selectedCareerIds, setSelectedCareerIds] = useState<number[]>([]);
  const [currentCareerIndex, setCurrentCareerIndex] = useState<number>(0);
  const [pendingCareers, setPendingCareers] = useState<CareerGuidanceEntry[]>([]);
  const [showDetailedRoadmap, setShowDetailedRoadmap] = useState<boolean>(false);
  const [discussedCareers, setDiscussedCareers] = useState<CareerGuidanceEntry[]>([]);

  // Get the current skill and hobby values
  const getCurrentSkillValues = () => selectedSkills.map(s => s.value);
  const getCurrentHobbyValues = () => selectedHobbies.map(h => h.value);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const skills = extractUniqueSkills(careerData).map(skill => ({
      value: skill,
      label: skill
    }));
    setAvailableSkills(skills);
  }, [careerData]);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      const hobbies = extractUniqueHobbies(careerData).map(hobby => ({
        value: hobby,
        label: hobby
      }));
      
      // Filter out any existing "Others" option
      const filteredHobbies = hobbies.filter(hobby => hobby.value !== 'Others');
      
      // Add a single "Others" option at the end
      const hobbiesWithOthers = [
        ...filteredHobbies,
        { value: 'Others', label: 'Others' }
      ];
      
      setAvailableHobbies(hobbiesWithOthers);
    } else {
      setAvailableHobbies([]);
    }
  }, [selectedSkills, careerData]);

  // Handle skill selection from the MultiSelect component
  const handleSkillChange = (newValue: SelectOption[]) => {
    setSelectedSkills(newValue);
  };

  // Handle hobby selection from the MultiSelect component
  const handleHobbyChange = (newValue: SelectOption[]) => {
    // Limit to only 2 hobbies
    if (newValue.length <= 2) {
      setSelectedHobbies(newValue);
    } else {
      // Keep only the first 2
      setSelectedHobbies(newValue.slice(0, 2));
    }
  };

  // Handle the submission of selected skills and hobbies
  const handleSelectionSubmit = async () => {
    const skillValues = selectedSkills.map(s => s.value);
    const hobbyValues = selectedHobbies.map(h => h.value);
    const hasOthersHobby = hobbyValues.includes('Others');

    let userMessage = '';
    if (skillValues.length > 0 && hobbyValues.length > 0) {
      if (hobbyValues.length === 2) {
        userMessage = `I have skills in ${skillValues.join(', ')} and I enjoy ${hobbyValues[0]} most, followed by ${hobbyValues[1]}. What careers would suit me?`;
      } else {
        userMessage = `I have skills in ${skillValues.join(', ')} and I enjoy ${hobbyValues.join(', ')}. What careers would suit me?`;
      }
    } else if (skillValues.length > 0) {
      userMessage = `I have skills in ${skillValues.join(', ')}. What careers would suit me?`;
    } else if (hobbyValues.length > 0) {
      userMessage = `I enjoy ${hobbyValues.join(', ')}. What careers would suit me?`;
    }

    if (userMessage) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        content: userMessage,
        role: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newUserMessage]);
      setIsLoading(true);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If "Others" is selected among hobbies, prioritize just the skills
      let suggestions;
      if (hasOthersHobby) {
        suggestions = getCareerSuggestionsBySelectedSkills(careerData, skillValues, []);
      } else {
        suggestions = getCareerSuggestionsBySelectedSkills(careerData, skillValues, hobbyValues);
        
        // If no results found with both skills and hobbies, fall back to just skills
        if (suggestions.length === 0 && skillValues.length > 0) {
          suggestions = getCareerSuggestionsBySelectedSkills(careerData, skillValues, []);
        }
      }
      
      if (suggestions.length > 0) {
        // Use the improved response function
        const response = generateCareerSuggestionsResponse(suggestions);
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newAssistantMessage]);
        setConversationState(ConversationState.SUGGEST_CAREERS);
      } else {
        const noMatchMessage: Message = {
          id: Date.now().toString(),
          content: '😕 I couldn\'t find any specific career matches. Could you try selecting different skills or hobbies?',
          role: 'assistant',
          timestamp: new Date(),
          showControls: true
        };
        setMessages(prev => [...prev, noMatchMessage]);
      }

      setIsLoading(false);
    }
  };

  // Generate a compact overview of a career (basic information)
  const generateCareerBasicInfo = (career: CareerGuidanceEntry): string => {
    return `**${career.suggestedCareer}**

**🔍 Career Overview:**
${career.briefOverview || `${career.suggestedCareer} combines ${career.skill} with interests in ${career.hobby}.`}

**💰 Salary Range:** ${career.salaryRange}

**🔧 Key Skills Required:**
- Technical expertise in ${career.skill}
- Problem-solving and analytical thinking
- Communication and collaboration
- Adaptability to changing technologies

**🏢 Top Companies:**
- ${getTopCompaniesForCareer(career.suggestedCareer).join('\n- ')}

**🌐 Market Trend:** 
The demand for ${career.suggestedCareer}s is ${Math.random() > 0.3 ? 'growing' : 'stable'} in the current job market, with opportunities in technology, healthcare, finance, and entertainment sectors.

**📋 Day-to-Day Tasks:**
${career.dayToDayTasks ? career.dayToDayTasks.split(';').map(task => `- ${task.trim()}`).join('\n') : `- Collaborating with cross-functional teams
- Designing and implementing solutions
- Testing and validating work
- Staying updated on industry trends and best practices
- Communicating progress and results to stakeholders`}

**📈 Job Opportunities:**
- Entry-level: Junior positions requiring 0-2 years experience
- Mid-level: Roles requiring 2-5 years of specialized experience
- Senior-level: Leadership positions after 5+ years of experience`;
  };

  // Helper function to get top companies based on career type
  const getTopCompaniesForCareer = (careerName: string): string[] => {
    const careerLower = careerName.toLowerCase();
    
    // Default companies for tech roles
    let companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'];
    
    if (careerLower.includes('game') || careerLower.includes('gaming')) {
      companies = ['Electronic Arts', 'Ubisoft', 'Activision Blizzard', 'Epic Games', 'Unity Technologies'];
    } 
    else if (careerLower.includes('data') || careerLower.includes('analyst')) {
      companies = ['Google', 'IBM', 'Microsoft', 'Amazon AWS', 'Palantir Technologies'];
    }
    else if (careerLower.includes('research') || careerLower.includes('scientist')) {
      companies = ['IBM Research', 'Google DeepMind', 'Microsoft Research', 'Meta AI Research', 'OpenAI'];
    }
    else if (careerLower.includes('finance') || careerLower.includes('quant')) {
      companies = ['JPMorgan Chase', 'Goldman Sachs', 'Bloomberg', 'Two Sigma', 'Citadel'];
    }
    else if (careerLower.includes('healthcare') || careerLower.includes('medical')) {
      companies = ['Philips Healthcare', 'Siemens Healthineers', 'GE Healthcare', 'Johnson & Johnson', 'Medtronic'];
    }
    else if (careerLower.includes('web') || careerLower.includes('frontend') || careerLower.includes('backend')) {
      companies = ['Google', 'Meta', 'Shopify', 'Stripe', 'Vercel'];
    }
    else if (careerLower.includes('mobile') || careerLower.includes('app')) {
      companies = ['Apple', 'Google', 'Uber', 'Spotify', 'Microsoft'];
    }
    else if (careerLower.includes('design') || careerLower.includes('ui') || careerLower.includes('ux')) {
      companies = ['Apple', 'Airbnb', 'Adobe', 'Google', 'Figma'];
    }
    else if (careerLower.includes('security') || careerLower.includes('cyber')) {
      companies = ['CrowdStrike', 'Palo Alto Networks', 'Microsoft', 'Google', 'Cisco'];
    }
    else if (careerLower.includes('cloud') || careerLower.includes('devops')) {
      companies = ['Amazon AWS', 'Microsoft Azure', 'Google Cloud', 'IBM Cloud', 'Cloudflare'];
    }
    else if (careerLower.includes('audio') || careerLower.includes('sound')) {
      companies = ['Spotify', 'Dolby Laboratories', 'Apple', 'Sonos', 'Bose'];
    }
    else if (careerLower.includes('sport')) {
      companies = ['Nike', 'ESPN', 'Strava', 'Under Armour', 'Peloton'];
    }
    
    return companies;
  };

  // Helper function to get top certifications for a career
  const getTopCertificationsForCareer = (careerName: string): string[] => {
    const careerLower = careerName.toLowerCase();
    
    // Default certifications for tech roles
    let certifications = ['CompTIA A+', 'AWS Certified Solutions Architect', 'Microsoft Certified: Azure Fundamentals', 'Google Certified Professional', 'Certified Information Systems Security Professional (CISSP)'];
    
    if (careerLower.includes('game') || careerLower.includes('gaming')) {
      certifications = ['Unity Certified Developer', 'Unreal Engine Certification', 'C++ Certification', 'Game Design and Development Certificate', 'NVIDIA Certified Developer'];
    } 
    else if (careerLower.includes('data') || careerLower.includes('analyst')) {
      certifications = ['Google Data Analytics Certificate', 'Microsoft Certified: Data Analyst Associate', 'IBM Data Science Professional Certificate', 'Certified Analytics Professional (CAP)', 'Cloudera Certified Associate: Data Analyst'];
    }
    else if (careerLower.includes('research') || careerLower.includes('scientist')) {
      certifications = ['Google Professional Machine Learning Engineer', 'AWS Certified Machine Learning - Specialty', 'Microsoft Certified: Azure Data Scientist Associate', 'IBM AI Engineering Professional Certificate', 'TensorFlow Developer Certificate'];
    }
    else if (careerLower.includes('finance') || careerLower.includes('quant')) {
      certifications = ['Financial Risk Manager (FRM)', 'Chartered Financial Analyst (CFA)', 'Certificate in Quantitative Finance (CQF)', 'Professional Risk Manager (PRM)', 'Financial Modeling & Valuation Analyst (FMVA)'];
    }
    else if (careerLower.includes('healthcare') || careerLower.includes('medical')) {
      certifications = ['Healthcare Information and Management Systems Society (HIMSS) Certification', 'Certified Professional in Healthcare Information and Management Systems (CPHIMS)', 'Certified Associate in Healthcare Information and Management Systems (CAHIMS)', 'HL7 Certification', 'Epic Certification'];
    }
    else if (careerLower.includes('web') || careerLower.includes('frontend') || careerLower.includes('backend')) {
      certifications = ['AWS Certified Developer', 'Microsoft Certified: Azure Developer Associate', 'Google Professional Cloud Developer', 'Meta Front-End Developer Certificate', 'W3Schools Certified Web Developer'];
    }
    else if (careerLower.includes('mobile') || careerLower.includes('app')) {
      certifications = ['iOS App Development with Swift Certification', 'Android Certified Application Developer', 'React Native Certification', 'Flutter Development Bootcamp', 'AWS Mobile Developer Certification'];
    }
    else if (careerLower.includes('design') || careerLower.includes('ui') || careerLower.includes('ux')) {
      certifications = ['Google UX Design Certificate', 'Adobe Certified Expert (ACE)', 'Certified User Experience Professional (CUXP)', 'Interaction Design Foundation Certification', 'Figma Certification'];
    }
    else if (careerLower.includes('security') || careerLower.includes('cyber')) {
      certifications = ['Certified Information Systems Security Professional (CISSP)', 'Certified Ethical Hacker (CEH)', 'CompTIA Security+', 'Certified Information Security Manager (CISM)', 'GIAC Security Essentials (GSEC)'];
    }
    else if (careerLower.includes('cloud') || careerLower.includes('devops')) {
      certifications = ['AWS Certified DevOps Engineer', 'Microsoft Certified: DevOps Engineer Expert', 'Google Professional Cloud DevOps Engineer', 'Docker Certified Associate', 'Kubernetes Certification (CKA)'];
    }
    else if (careerLower.includes('audio') || careerLower.includes('sound')) {
      certifications = ['Avid Pro Tools Certification', 'Apple Logic Pro X Certification', 'Dante Certification', 'Audiokinetic Wwise Certification', 'Audio Engineering Society (AES) Certification'];
    }
    else if (careerLower.includes('sport')) {
      certifications = ['NSCA Certified Strength and Conditioning Specialist', 'Sports Analytics Certification', 'Sports Science Certification', 'Sports Technology Management Certificate', 'Sports Data Analytics Certification'];
    }
    
    return certifications;
  };

  // Generate a response message based on career suggestions
  const generateCareerSuggestionsResponse = (suggestions: CareerGuidanceEntry[]): string => {
    if (suggestions.length === 0) {
      return `I couldn't find specific career matches based on what you selected, ${userName}. Could you try selecting different skills or hobbies? 😕`;
    }
    
    let response = `✨ Based on your skills and interests, here are some career suggestions:\n\n`;
    
    suggestions.forEach((suggestion, index) => {
      response += `${index + 1}. ${suggestion.suggestedCareer}\n`;
    });
    
    response += "\n🔍 Would you like to know more about any of these careers?\n";
    response += "- Type a single number (like '1') for one career\n";
    response += "- Or separate multiple numbers with commas (like '1,2,3') for multiple careers";
    
    return response;
  };

  // Generate comprehensive detailed information about a specific career
  const generateCareerDetailResponse = (career: CareerGuidanceEntry): string => {
    return `# ${career.suggestedCareer}

📋 Career Overview
${career.briefOverview || `${career.suggestedCareer} is a profession that combines skills in ${career.skill} with interests related to ${career.hobby}. This career path allows professionals to apply technical expertise in creative and practical ways that align with their personal interests.`}

💰 Compensation & Benefits
- **Salary Range:** ${career.salaryRange}
- **Work-Life Balance:** Most positions offer flexible hours and remote work possibilities
- **Growth Potential:** High demand across various industries with opportunities for advancement

🔧 Required Skills
- Strong foundation in ${career.skill}
- Technical expertise in industry-standard tools and technologies
- Problem-solving abilities and analytical thinking
- Communication and collaboration skills
- Adaptability to changing technologies and requirements

🎓 Educational Path
- Bachelor's degree in ${career.skill} or related field (recommended)
- Specialized certifications can boost employability
- Continuous learning through workshops and online courses
- Portfolio development showcasing practical applications

🗺️ Career Roadmap
${career.careerRoadmap}

🌐 Industry Outlook
The demand for ${career.suggestedCareer}s is growing rapidly as organizations continue to prioritize ${career.skill.toLowerCase()} capabilities. The field offers opportunities in various sectors including technology, healthcare, finance, entertainment, and more.

🚀 Day-to-Day Responsibilities
${career.dayToDayTasks || `- Collaborating with cross-functional teams
- Designing and implementing solutions
- Testing and validating work
- Staying updated on industry trends and best practices
- Communicating progress and results to stakeholders`}

💡 Would you like to know more about this career path or explore other options that match your skills and interests?`;
  };

  // Helper function to extract name from greeting message
  const extractName = (input: string): string | null => {
    // Clean the input
    const cleanedInput = input.trim();
    
    // Check if it's just a simple greeting with no name
    const simpleGreetings = ['hi', 'hello', 'hey', 'hola', 'greetings', 'howdy', 'yo'];
    if (simpleGreetings.includes(cleanedInput.toLowerCase())) {
      return null; // Return null to indicate it's just a greeting with no name
    }
    
    // Check if the message contains a greeting about how the bot is doing
    const hasHowAreYou = cleanedInput.toLowerCase().includes('how are you') || 
                         cleanedInput.toLowerCase().includes('how are u') || 
                         cleanedInput.toLowerCase().includes('how r u') ||
                         cleanedInput.toLowerCase().includes('how you doing') ||
                         cleanedInput.toLowerCase().includes('how do you do') ||
                         cleanedInput.toLowerCase().includes('hows it going') ||
                         cleanedInput.toLowerCase().includes('how\'s it going');
    
    // Common patterns to extract names
    const namePatterns = [
      // "my name is John"
      /(?:my name is|i'?m called|i am called|call me|name'?s|names)\s+([a-zA-Z0-9]+)/i,
      // "i am John" or "i'm John"
      /(?:i am|i'm)\s+([a-zA-Z0-9]+)/i,
      // "myself John"
      /(?:myself)\s+([a-zA-Z0-9]+)/i,
      // Last resort - just take the last word in case of simple inputs
      /^(?:hi|hello|hey|hoi)?\s*,?\s*([a-zA-Z0-9]+)\.?$/i
    ];
    
    // Try each pattern
    for (const pattern of namePatterns) {
      const match = cleanedInput.match(pattern);
      if (match && match[1]) {
        // Clean up possible punctuation from the end of the name
        return match[1].replace(/[.,!?;:]$/, '');
      }
    }
    
    // If no pattern matches, handle special cases and cleanup
    let extractedName = cleanedInput;
    
    // Remove common words that are not names
    const wordsToRemove = ['HERE', 'THERE', 'MY NAME IS', 'I AM', 'MYSELF', 'NAME'];
    
    // Split the input into words
    let words = extractedName.split(/\s+/);
    
    // Filter out words that are in the wordsToRemove list
    words = words.filter(word => !wordsToRemove.includes(word.toUpperCase()));
    
    // If we still have words left, join them back together
    if (words.length > 0) {
      extractedName = words.join(' ');
      
      // If name is ALL CAPS, convert to title case
      if (extractedName === extractedName.toUpperCase()) {
        extractedName = extractedName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      }
      
      return extractedName;
    }
    
    return null; // No name found
  };

  // Check if message contains "how are you" or similar phrases
  const containsHowAreYou = (input: string): boolean => {
    const lowerInput = input.toLowerCase().trim();
    return lowerInput.includes('how are you') || 
           lowerInput.includes('how are u') || 
           lowerInput.includes('how r u') ||
           lowerInput.includes('how you doing') ||
           lowerInput.includes('how do you do') ||
           lowerInput.includes('hows it going') ||
           lowerInput.includes('how\'s it going');
  };

  // Handle the message submission with the updated logic
  const handleMessageSubmit = async () => {
    if (inputValue.trim()) {
      // Store the original input before clearing it
      const currentInput = inputValue.trim();
      
      // Add user message to chat and reset input field
      const userMessage: Message = {
        id: Date.now().toString(),
        content: currentInput,
        role: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      // Handle name input in greeting state
      if (conversationState === ConversationState.GREETING) {
        const extractedName = extractName(currentInput);
        
        // Check if the message contains "how are you" or similar
        const hasHowAreYou = containsHowAreYou(currentInput);
        
        // If we didn't extract a name, ask again
        if (extractedName === null) {
          let promptAgainMessage = '';
          if (hasHowAreYou) {
            promptAgainMessage = `I'm doing great, thank you for asking! 😊 But I still need to know your name to help you better. What's your name?`;
          } else {
            promptAgainMessage = `Good to meet you! To give you better career recommendations, I'd like to know your name. Could you please tell me your name?`;
          }
          
          const promptAgain: Message = {
            id: Date.now().toString(),
            content: promptAgainMessage,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, promptAgain]);
          setIsLoading(false);
          return;
        }
        
        setUserName(extractedName);
        
        let welcomeResponse = '';
        if (hasHowAreYou) {
          welcomeResponse = `I'm doing great, thank you for asking! 😊 And nice to meet you, ${extractedName}! Let's find the perfect career path for you.\n\n👇 Please select your skills and up to 2 hobbies below. Select your favorite hobby first for better recommendations!`;
        } else {
          welcomeResponse = `Nice to meet you, ${extractedName}! 😊 Let's find the perfect career path for you.\n\n👇 Please select your skills and up to 2 hobbies below. Select your favorite hobby first for better recommendations!`;
        }
        
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: welcomeResponse,
          role: 'assistant',
          timestamp: new Date(),
          showControls: true
        };
        setMessages(prev => [...prev, welcomeMessage]);
        setConversationState(ConversationState.ASK_SKILLS);
        setIsLoading(false);
        return;
      }

      // Get current career suggestions based on selected skills and hobbies
      const suggestions = getCareerSuggestionsBySelectedSkills(
        careerData, 
        selectedSkills.map(s => s.value), 
        selectedHobbies.map(h => h.value)
      );

      // Check for goodbye message first, before any other processing
      const isGoodbyeMessage = currentInput.toLowerCase().includes('bye') ||
                              currentInput.toLowerCase().includes('thank') ||
                              currentInput.toLowerCase().includes('thats it') ||
                              currentInput.toLowerCase().includes("that's it") ||
                              currentInput.toLowerCase().includes('goodbye') ||
                              currentInput.toLowerCase().includes('see you');

      if (isGoodbyeMessage) {
        const goodbyeMessage: Message = {
          id: Date.now().toString(),
          content: `🌟 It was amazing chatting with you! Remember, every step you take brings you closer to your dreams. Stay curious, stay confident, and never stop growing. You've got this! 💪✨ Come back anytime — I'm always here to help. 😊👋`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, goodbyeMessage]);
        setIsChatComplete(true);
        setIsLoading(false);
        return;
      }

      // Check for "how are you" questions at any point in the conversation
      if (containsHowAreYou(currentInput) && !currentInput.toLowerCase().includes('skill') && !currentInput.toLowerCase().includes('hobby')) {
        const howAreYouMessage: Message = {
          id: Date.now().toString(),
          content: `I'm doing great, thank you for asking! 😊 I'm here to help you with your career guidance needs. How can I assist you today?`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, howAreYouMessage]);
        setIsLoading(false);
        return;
      }

      // Process career selections when in suggestion state
      if (conversationState === ConversationState.SUGGEST_CAREERS) {
        console.log("Processing career selection. Input:", currentInput);
        
        try {
          let selectedCareers: CareerGuidanceEntry[] = [];
          
          // First try to parse using comma as separator
          if (currentInput.includes(',')) {
            const numbers = currentInput.split(',')
              .map(n => parseInt(n.trim()))
              .filter(n => !isNaN(n) && n > 0 && n <= suggestions.length);
            
            if (numbers.length > 0) {
              selectedCareers = numbers.map(n => suggestions[n - 1]);
              selectedCareers = Array.from(new Set(selectedCareers));
            }
          } 
          // Then try to parse as a single number
          else {
            const singleNumber = parseInt(currentInput.trim());
            if (!isNaN(singleNumber) && singleNumber > 0 && singleNumber <= suggestions.length) {
              console.log("Valid single number detected:", singleNumber);
              selectedCareers = [suggestions[singleNumber - 1]];
            }
          }
          
          // If no valid selections found, show error message
          if (selectedCareers.length === 0) {
            const errorMessage: Message = {
              id: Date.now().toString(),
              content: "❌ I couldn't understand your selection. Please:\n- Type a single number (like '1') for one career\n- Or separate multiple numbers with commas (like '1,2,3') for multiple careers",
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            return;
          }

          // Add loading message
          const loadingMessage: Message = {
            id: Date.now().toString(),
            content: "🔍 Analyzing your career selections...",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, loadingMessage]);

          // Process the selected careers with a delay
          setTimeout(() => {
            // Show basic information for all selected careers
            const allCareersBasicInfo = selectedCareers.map((career, index) => {
              return `**Career ${index + 1}: ${career.suggestedCareer}**\n\n${generateCareerBasicInfo(career)}`;
            }).join('\n\n---\n\n');
            
            const basicInfoMessage: Message = {
              id: Date.now().toString(),
              content: `You've selected ${selectedCareers.length} career${selectedCareers.length > 1 ? 's' : ''}. Here's an overview of each:\n\n${allCareersBasicInfo}\n\n💡 Would you like to see the career roadmap for ${selectedCareers[0].suggestedCareer}? (Type 'yes' to view the roadmap, or 'no' to skip to the next career)`,
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => prev.slice(0, -1).concat([basicInfoMessage]));
            setPendingCareers(selectedCareers);
            setCurrentCareerIndex(0);
            setShowDetailedRoadmap(false);
            setConversationState(ConversationState.DISCUSS_SPECIFIC_CAREER);
            setIsLoading(false);
          }, 2000);
          
        } catch (error) {
          console.error("Error processing career selection:", error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "Sorry, I encountered an error. Please try again by typing a number (like '1') or multiple numbers separated by commas (like '1,2,3').",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
        }
        return;
      }

      // Check if we're in the discussion state with pending careers
      if (pendingCareers.length > 0) {
        // Check if this is a response about interest in current career's roadmap
        const isInterestedResponse = 
          currentInput.toLowerCase().includes('yes') || 
          currentInput.toLowerCase().includes('yeah') ||
          currentInput.toLowerCase().includes('sure') ||
          currentInput.toLowerCase().includes('interested') ||
          currentInput.toLowerCase().includes('tell me more') ||
          currentInput.toLowerCase().includes('roadmap') || 
          currentInput.toLowerCase().includes('path');

        const isNotInterestedResponse = 
          currentInput.toLowerCase().includes('no') || 
          currentInput.toLowerCase().includes('nope') ||
          currentInput.toLowerCase().includes('next') ||
          currentInput.toLowerCase().includes('skip') ||
          currentInput.toLowerCase().includes('not interested');

        // Check if the response is neither yes nor no
        const isInvalidResponse = !isInterestedResponse && !isNotInterestedResponse;

        if (isInvalidResponse) {
          // Handle invalid response only when we're expecting a yes/no for roadmap
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "❓ I didn't catch that. Please type 'yes' if you want to see the roadmap for this career, or 'no' to skip to the next one.",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }

        if ((showDetailedRoadmap && (isInterestedResponse || isNotInterestedResponse)) || 
            (!showDetailedRoadmap && (isInterestedResponse || isNotInterestedResponse))) {
          // User is interested in the detailed roadmap
          if (isInterestedResponse && !showDetailedRoadmap) {
            setShowDetailedRoadmap(true);
            
            // User wants to see the roadmap, generate it
            const currentCareer = pendingCareers[currentCareerIndex];
            
            // Multiple thinking messages that will be displayed sequentially
            const thinkingMessages = [
              "🔍 Analyzing career progression paths...",
              "📊 Researching industry requirements for this role...",
              "🧩 Compiling educational background and skills needed...",
              "⚙️ Mapping out professional development stages...",
              "📝 Finalizing detailed career roadmap..."
            ];
            
            // Display first thinking message
            const initialLoadingMessage: Message = {
              id: Date.now().toString(),
              content: thinkingMessages[0],
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, initialLoadingMessage]);
            
            // Cycle through thinking messages to create a more dynamic experience
            let currentMessageIndex = 0;
            const messageInterval = setInterval(() => {
              currentMessageIndex = (currentMessageIndex + 1) % thinkingMessages.length;
              const updatedLoadingMessage: Message = {
                id: Date.now().toString(),
                content: thinkingMessages[currentMessageIndex],
                role: 'assistant',
                timestamp: new Date()
              };
              setMessages(prev => [...prev.slice(0, -1), updatedLoadingMessage]);
            }, 1400); // Change message every 1.4 seconds
            
            // Generate the roadmap content with delay
            let roadmapContent = '';
            setTimeout(async () => {
              clearInterval(messageInterval); // Stop cycling messages
              
              try {
                if (import.meta.env.VITE_OPENAI_API_KEY) {
                  roadmapContent = await generateCareerRoadmap(currentCareer, userName);
                } else {
                  roadmapContent = generateDetailedRoadmapTemplate(currentCareer);
                }
              } catch (error) {
                console.error("Error generating roadmap:", error);
                roadmapContent = generateDetailedRoadmapTemplate(currentCareer);
              }
              
              const roadmapMessage: Message = {
                id: Date.now().toString(),
                content: roadmapContent,
                role: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => prev.slice(0, -1).concat([roadmapMessage]));
              
              // Add current career to discussed careers list
              setDiscussedCareers(prev => {
                // Avoid duplicates
                if (!prev.some(c => c.suggestedCareer === currentCareer.suggestedCareer)) {
                  return [...prev, currentCareer];
                }
                return prev;
              });
              
              // If there are more careers to discuss
              if (currentCareerIndex < pendingCareers.length - 1) {
                const nextStepMessage: Message = {
                  id: Date.now().toString(),
                  content: `That's the roadmap for ${currentCareer.suggestedCareer}.\n\n💡 Would you like to see the career roadmap for ${pendingCareers[currentCareerIndex + 1].suggestedCareer}? (Type 'yes' to view the roadmap, or 'no' to skip to the next career)`,
                  role: 'assistant',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, nextStepMessage]);
                setCurrentCareerIndex(currentCareerIndex + 1);
                setShowDetailedRoadmap(false);
              } else {
                // We've gone through all careers
                const completionMessage: Message = {
                  id: Date.now().toString(),
                  content: `That completes the information for all the careers you selected! Is there anything specific you'd like to know more about? You can ask about skills, salary, or other aspects of any career we discussed.`,
                  role: 'assistant',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, completionMessage]);
                setPendingCareers([]);
                setCurrentCareerIndex(0);
                setShowDetailedRoadmap(false);
              }
            }, 7000); // 7-second delay for the entire process
            
            return;
          } else if (isNotInterestedResponse || (showDetailedRoadmap && isInterestedResponse)) {
            // User wants to skip to the next career
            if (currentCareerIndex < pendingCareers.length - 1) {
              // Move to the next career in the list
              const nextCareer = pendingCareers[currentCareerIndex + 1];
              
              const nextCareerMessage: Message = {
                id: Date.now().toString(),
                content: `💡 Would you like to see the career roadmap for ${nextCareer.suggestedCareer}? (Type 'yes' to view the roadmap, or 'no' to skip to the next career)`,
                role: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, nextCareerMessage]);
              setCurrentCareerIndex(currentCareerIndex + 1);
              setShowDetailedRoadmap(false);
            } else {
              // We've gone through all careers
              const completionMessage: Message = {
                id: Date.now().toString(),
                content: `That completes the overview of all careers! Feel free to ask any specific questions about skills, salary, or other aspects of any career we discussed.`,
                role: 'assistant',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, completionMessage]);
              setPendingCareers([]);
              setCurrentCareerIndex(0);
              setShowDetailedRoadmap(false);
            }
          }
          
          setIsLoading(false);
          return;
        }
      }

      // Check for follow-up questions about roadmap, salary, skills, etc.
      const isRoadmapQuestion = currentInput.toLowerCase().includes('roadmap') || 
                               currentInput.toLowerCase().includes('path') || 
                               currentInput.toLowerCase().includes('steps');
      
      const isSalaryQuestion = currentInput.toLowerCase().includes('salary') || 
                              currentInput.toLowerCase().includes('pay') || 
                              currentInput.toLowerCase().includes('compensation') ||
                              currentInput.toLowerCase().includes('money');
      
      const isSkillsQuestion = currentInput.toLowerCase().includes('skills') || 
                              currentInput.toLowerCase().includes('requirements') || 
                              currentInput.toLowerCase().includes('need to know');
      
      const isMoreDetailsRequest = currentInput.toLowerCase().includes('tell me more') || 
                                  currentInput.toLowerCase().includes('more details') || 
                                  currentInput.toLowerCase().includes('more information');

      const isJobRolesQuestion = currentInput.toLowerCase().includes('job') ||
                                currentInput.toLowerCase().includes('role') ||
                                currentInput.includes('position') ||
                                currentInput.includes('work') ||
                                currentInput.includes('responsibilities');

      const isMarketTrendQuestion = currentInput.toLowerCase().includes('market') ||
                                   currentInput.toLowerCase().includes('trend') ||
                                   currentInput.toLowerCase().includes('demand') ||
                                   currentInput.toLowerCase().includes('future') ||
                                   currentInput.toLowerCase().includes('growth') ||
                                   currentInput.toLowerCase().includes('opportunity') ||
                                   currentInput.toLowerCase().includes('industry');

      const isCompaniesQuestion = currentInput.toLowerCase().includes('company') ||
                                  currentInput.toLowerCase().includes('companies') ||
                                  currentInput.toLowerCase().includes('employer') ||
                                  currentInput.toLowerCase().includes('corporation') ||
                                  currentInput.toLowerCase().includes('firm') ||
                                  currentInput.toLowerCase().includes('where to work') ||
                                  currentInput.toLowerCase().includes('who hires');

      const isCertificationsQuestion = currentInput.toLowerCase().includes('certification') ||
                                      currentInput.toLowerCase().includes('certificate') ||
                                      currentInput.toLowerCase().includes('credential') ||
                                      currentInput.toLowerCase().includes('qualified') ||
                                      currentInput.toLowerCase().includes('qualify') ||
                                      currentInput.toLowerCase().includes('qualification');

      // Handle specific questions about careers
      if (conversationState === ConversationState.DISCUSS_SPECIFIC_CAREER && 
          (isRoadmapQuestion || isSalaryQuestion || isSkillsQuestion || isMoreDetailsRequest || 
           isJobRolesQuestion || isMarketTrendQuestion || isCompaniesQuestion || isCertificationsQuestion)) {
        
        // We might be asking about a specific career by name
        let specifiedCareerName = null;
        
        // Check if the question mentions a specific career by name
        const careerMentions = suggestions.filter(career => 
          currentInput.toLowerCase().includes(career.suggestedCareer.toLowerCase())
        );
        
        if (careerMentions.length > 0) {
          // If a specific career is mentioned, use that one
          specifiedCareerName = careerMentions[0].suggestedCareer;
        }
        
        // Find the most recently discussed career if no specific career is mentioned
        let lastCareerMessage = null;
        if (!specifiedCareerName) {
          for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.role === 'assistant' && message.content.includes('# ')) {
              const careerNameMatch = message.content.match(/# (.*?)(\n|$)/);
              if (careerNameMatch && careerNameMatch[1]) {
                lastCareerMessage = careerNameMatch[1].trim();
                break;
              }
            } else if (message.role === 'assistant' && message.content.includes('**')) {
              // Look for bold career titles too
              const careerNameMatch = message.content.match(/\*\*(.*?)\*\*/);
              if (careerNameMatch && careerNameMatch[1]) {
                lastCareerMessage = careerNameMatch[1].trim();
                break;
              }
            }
          }
        }
        
        // Determine which careers to provide information about
        let careersToRespond: CareerGuidanceEntry[] = [];
        
        // If we're asking about multiple careers or general information
        const isAskingAboutAll = 
          currentInput.toLowerCase().includes("all careers") || 
          currentInput.toLowerCase().includes("all professions") || 
          currentInput.toLowerCase().includes("each career") || 
          currentInput.toLowerCase().includes("all of them") ||
          currentInput.toLowerCase().includes("both careers") ||
          currentInput.toLowerCase().includes("compare");
        
        if (isAskingAboutAll && discussedCareers.length > 0) {
          // User wants info about all careers they've seen roadmaps for
          careersToRespond = [...discussedCareers];
        } else if (specifiedCareerName) {
          // User mentioned a specific career
          const specifiedCareer = suggestions.find(c => 
            c.suggestedCareer.toLowerCase() === specifiedCareerName.toLowerCase() ||
            c.suggestedCareer.toLowerCase().includes(specifiedCareerName.toLowerCase())
          );
          if (specifiedCareer) {
            careersToRespond = [specifiedCareer];
          }
        } else if (lastCareerMessage) {
          // Use the most recently discussed career
          const lastCareer = suggestions.find(c => 
            c.suggestedCareer === lastCareerMessage || 
            c.suggestedCareer.includes(lastCareerMessage) || 
            lastCareerMessage.includes(c.suggestedCareer)
          );
          if (lastCareer) {
            careersToRespond = [lastCareer];
          }
        } else if (discussedCareers.length > 0) {
          // Default to the most recently discussed career if nothing else matches
          careersToRespond = [discussedCareers[discussedCareers.length - 1]];
        }
        
        if (careersToRespond.length > 0) {
          // Check for multiple topics and prepare a combined response
          const topics = [];
          let combinedResponse = '';
          
          // First, collect all the topics the user is asking about
          if (isRoadmapQuestion) topics.push('roadmap');
          if (isSalaryQuestion) topics.push('salary');
          if (isSkillsQuestion) topics.push('skills');
          if (isJobRolesQuestion) topics.push('roles');
          if (isMarketTrendQuestion) topics.push('trends');
          if (isCompaniesQuestion) topics.push('companies');
          if (isCertificationsQuestion) topics.push('certifications');
          if (isMoreDetailsRequest && topics.length === 0) topics.push('details');
          
          // If we're comparing multiple careers
          if (careersToRespond.length > 1) {
            // Format a heading that shows we're comparing multiple careers
            const careerNames = careersToRespond.map(c => c.suggestedCareer).join(', ');
            combinedResponse = `**Information about ${topics.join(', ')} for ${careerNames}**\n\n`;
            
            // Generate responses for each career and topic
            for (const career of careersToRespond) {
              combinedResponse += `## ${career.suggestedCareer}\n\n`;
              
              for (const topic of topics) {
                const topicResponse = generateTopicResponse(topic, career);
                if (topicResponse) {
                  combinedResponse += `${topicResponse}\n\n`;
                }
              }
              
              combinedResponse += `---\n\n`;
            }
            
            // Send the combined response
            const combinedMessage: Message = {
              id: Date.now().toString(),
              content: combinedResponse + "\n\n💡 Would you like more specific information about any of these careers?",
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, combinedMessage]);
            setIsLoading(false);
            return;
          } else {
            // Single career response - use existing logic
            const careerEntry = careersToRespond[0];
            
            // Add an intro if there are multiple topics
            if (topics.length > 1) {
              combinedResponse = `**Here's information about ${topics.join(', ')} for ${careerEntry.suggestedCareer}:**\n\n`;
            }
            
            // Generate responses for each topic
            for (const topic of topics) {
              let topicResponse = '';
              
              if (topic === 'roadmap') {
                // For roadmap, we'll handle differently since it needs async and loading messages
                const loadingMessage: Message = {
                  id: Date.now().toString(),
                  content: "🔍 Generating detailed career roadmap...",
                  role: 'assistant',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, loadingMessage]);
                
                // We'll need to handle roadmap separately
                try {
                  if (import.meta.env.VITE_OPENAI_API_KEY) {
                    const roadmapContent = await generateCareerRoadmap(careerEntry, userName);
                    const roadmapMessage: Message = {
                      id: Date.now().toString(),
                      content: roadmapContent,
                      role: 'assistant',
                      timestamp: new Date()
                    };
                    setMessages(prev => prev.slice(0, -1).concat([roadmapMessage]));
                  } else {
                    const roadmapContent = generateDetailedRoadmapTemplate(careerEntry);
                    const roadmapMessage: Message = {
                      id: Date.now().toString(),
                      content: roadmapContent,
                      role: 'assistant',
                      timestamp: new Date()
                    };
                    setMessages(prev => prev.slice(0, -1).concat([roadmapMessage]));
                  }
                } catch (error) {
                  console.error("Error generating roadmap:", error);
                  const roadmapContent = generateDetailedRoadmapTemplate(careerEntry);
                  const roadmapMessage: Message = {
                    id: Date.now().toString(),
                    content: roadmapContent,
                    role: 'assistant',
                    timestamp: new Date()
                  };
                  setMessages(prev => prev.slice(0, -1).concat([roadmapMessage]));
                }
                
                // Since we've handled roadmap separately, continue with other topics
                continue;
              } else {
                topicResponse = generateTopicResponse(topic, careerEntry);
              }
              
              if (topicResponse) {
                if (combinedResponse) {
                  combinedResponse += `\n\n${topicResponse}\n\n---\n\n`;
                } else {
                  combinedResponse = topicResponse;
                }
              }
            }
            
            // Only send a combined message if we have content and didn't send individual messages for roadmap/details
            if (combinedResponse && !topics.includes('roadmap') && !topics.includes('details')) {
              combinedResponse += "\n\n💡 Would you like more information about any other aspect of this career?";
              
              const combinedMessage: Message = {
                id: Date.now().toString(),
                content: combinedResponse,
                role: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, combinedMessage]);
              setIsLoading(false);
              return;
            } else if (topics.includes('roadmap') || topics.includes('details')) {
              // If we handled roadmap or details separately, add combined response for other topics
              if (combinedResponse) {
                const additionalMessage: Message = {
                  id: Date.now().toString(),
                  content: combinedResponse + "\n\n💡 Would you like more information about any other aspect of this career?",
                  role: 'assistant',
                  timestamp: new Date()
                };
                
                setMessages(prev => [...prev, additionalMessage]);
              }
              
              setIsLoading(false);
              return;
            }
          }
        } else {
          // Couldn't find the career in our data
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            content: `I'm sorry, I don't have specific information about that career. Would you like to explore other career options or ask about something else?`,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Check if the message is unclear or confusing
      const isPositiveAcknowledgment = 
        currentInput.toLowerCase().match(/^(great|good|nice|thanks|thank you|i like it|i love it|love it|awesome|cool|sounds good|perfect|excellent|wonderful|helpful|useful|interesting|that's helpful|that helps|superb|wow|just wow|amazing|fantastic|brilliant|outstanding|impressive|fabulous|super)!?\.?$/i) !== null;
        
      // If the user just acknowledges or expresses approval for the information
      if (isPositiveAcknowledgment) {
        const acknowledgmentResponse: Message = {
          id: Date.now().toString(),
          content: `I'm glad that was helpful! 😊 Is there anything else you'd like to know about this career or any other career paths?`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, acknowledgmentResponse]);
        setIsLoading(false);
        return;
      }
      
      const isUnclearMessage = 
        currentInput.length < 3 || 
        (currentInput.toLowerCase() !== 'yes' && 
         currentInput.toLowerCase() !== 'no' && 
         !isRoadmapQuestion && 
         !isSalaryQuestion && 
         !isSkillsQuestion && 
         !isMoreDetailsRequest && 
         !isJobRolesQuestion && 
         !isMarketTrendQuestion && 
         !isCompaniesQuestion && 
         !isCertificationsQuestion &&
         conversationState === ConversationState.DISCUSS_SPECIFIC_CAREER);

      if (isUnclearMessage) {
        const clarificationMessage: Message = {
          id: Date.now().toString(),
          content: "I'm not sure I understood what you're asking. Please enter your preference or rephrase your question. You can ask about roadmaps, skills, salary, job roles, market trends, companies, or certifications for any of the careers we discussed.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, clarificationMessage]);
        setIsLoading(false);
        return;
      }

      // Only fall back to general response if we haven't handled the message in any of the above conditions
      handleGeneralResponse(suggestions);
      setIsLoading(false);
    }
  };

  // Helper function for general responses
  const handleGeneralResponse = (suggestions: CareerGuidanceEntry[]) => {
    // Check if we have skills and hobbies selected but no specific career mentioned
    if (selectedSkills.length > 0 || selectedHobbies.length > 0) {
      const hasOthersHobby = selectedHobbies.map(h => h.value).includes('Others');
      
      // If no results found with both skills and hobbies, fall back to just skills
      let careerSuggestions = suggestions;
      if (suggestions.length === 0 && selectedSkills.length > 0) {
        careerSuggestions = getCareerSuggestionsBySelectedSkills(
          careerData, 
          selectedSkills.map(s => s.value), 
          []
        );
      }
      
      if (careerSuggestions.length > 0) {
        // Use the improved response function
        const response = generateCareerSuggestionsResponse(careerSuggestions);
        const newAssistantMessage: Message = {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newAssistantMessage]);
        setConversationState(ConversationState.SUGGEST_CAREERS);
      } else {
        const noMatchMessage: Message = {
          id: Date.now().toString(),
          content: 'I couldn\'t find any specific career matches. Could you try selecting different skills or hobbies? 😕',
          role: 'assistant',
          timestamp: new Date(),
          showControls: true
        };
        setMessages(prev => [...prev, noMatchMessage]);
      }
    } else {
      // General response when we don't have enough context
      const generalMessage: Message = {
        id: Date.now().toString(),
        content: `I'd be happy to help you find career options that match your interests and skills. Could you please select your skills and hobbies from the options below? 👇`,
        role: 'assistant',
        timestamp: new Date(),
        showControls: true
      };
      setMessages(prev => [...prev, generalMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setUserName('');
    setSelectedSkills([]);
    setSelectedHobbies([]);
    setConversationState(ConversationState.GREETING);
    setIsChatComplete(false);
    setDiscussedCareers([]);
    setPendingCareers([]);
    setCurrentCareerIndex(0);
    setShowDetailedRoadmap(false);
  };

  // Add these helper functions for roadmap templates
  const generateDetailedRoadmapTemplate = (career: CareerGuidanceEntry): string => {
    const careerLower = career.suggestedCareer.toLowerCase();
    console.log('🔍 ROADMAP MATCHING (CareerGuide) - Searching for career:', career.suggestedCareer);
    
    // Try to find a matching roadmap in the JSON file
    const roadmaps = require('../public/final_detailed_career_roadmaps.json') as RoadmapData;
    
    // First try exact match
    let matchingRoadmap = Object.entries(roadmaps).find(([key]) => 
      key.toLowerCase() === careerLower
    );
    
    if (matchingRoadmap) {
      console.log('✅ ROADMAP MATCHING (CareerGuide) - Found exact match:', matchingRoadmap[0]);
    }
    
    // If no exact match, try full word match
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (CareerGuide) - Trying full word match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyWords = key.toLowerCase().split(/\s+/);
        const careerWords = careerLower.split(/\s+/);
        const matches = careerWords.every(word => keyWords.includes(word));
        if (matches) {
          console.log('✅ ROADMAP MATCHING (CareerGuide) - Found full word match:', key);
        }
        return matches;
      });
    }
    
    // If still no match, try partial match with word boundaries
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (CareerGuide) - Trying word boundary match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyLower = key.toLowerCase();
        // Check if the career title appears as a whole word in the key
        const matches = keyLower.includes(' ' + careerLower + ' ') || 
               keyLower.startsWith(careerLower + ' ') || 
               keyLower.endsWith(' ' + careerLower) ||
               keyLower === careerLower;
        if (matches) {
          console.log('✅ ROADMAP MATCHING (CareerGuide) - Found word boundary match:', key);
        }
        return matches;
      });
    }
    
    // Last resort: check if any of the career words are in the key
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (CareerGuide) - Trying significant word match...');
      const careerWords = careerLower.split(/\s+/).filter(word => word.length > 3); // Only use significant words
      console.log('🔍 ROADMAP MATCHING (CareerGuide) - Significant words:', careerWords);
      
      if (careerWords.length > 0) {
        matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
          const keyLower = key.toLowerCase();
          const matchingWord = careerWords.find(word => 
            keyLower.includes(' ' + word + ' ') || 
            keyLower.startsWith(word + ' ') || 
            keyLower.endsWith(' ' + word) ||
            keyLower === word
          );
          if (matchingWord) {
            console.log(`✅ ROADMAP MATCHING (CareerGuide) - Found match on word "${matchingWord}" in key "${key}"`);
            return true;
          }
          return false;
        });
      }
    }

    if (matchingRoadmap) {
      const [matchedKey, roadmap] = matchingRoadmap;
      console.log('✅ ROADMAP SELECTED (CareerGuide):', matchedKey);
      let response = `**${roadmap.title}**\n\n`;
      
      roadmap.phases.forEach(phase => {
        response += `${phase.title}\n\n`;
        phase.topics.forEach(topic => {
          response += `- ${topic}\n`;
        });
        response += `\n`;
      });
      
      return response;
    } else {
      console.log('❌ ROADMAP MATCHING (CareerGuide) - No match found for:', career.suggestedCareer);
    }
    
    return `I don't have a detailed roadmap template for ${career.suggestedCareer} yet.`;
  };

  // Helper function to generate responses for different topics
  const generateTopicResponse = (topic: string, careerEntry: CareerGuidanceEntry): string => {
    switch(topic) {
      case 'salary':
        return `**💰 Salary Information for ${careerEntry.suggestedCareer}**\n\nThe typical salary range for this career is ${careerEntry.salaryRange}. This can vary based on location, experience level, and specific employer.\n\n**Entry-level positions** typically start at the lower end, while **experienced professionals** with 5+ years can expect to earn in the mid to upper range. **Senior-level positions** with team leadership responsibilities may earn at or above the upper range.\n\nFactors that can affect salary include:\n- Geographic location (tech hubs typically pay more)\n- Company size and industry\n- Your negotiation skills\n- Additional skills and certifications\n- Education level`;
      
      case 'skills':
        return `**🔧 Key Skills for ${careerEntry.suggestedCareer}**\n\n**Technical Skills:**\n- Strong foundation in ${careerEntry.skill}\n- Proficiency with industry tools and frameworks\n- Problem-solving and analytical thinking\n- Technical writing and documentation\n- Testing and quality assurance\n\n**Soft Skills:**\n- Communication and collaboration\n- Time management\n- Adaptability\n- Attention to detail\n- Client/stakeholder management\n- Continuous learning mindset\n\nContinuous learning is important in this field as technologies and methodologies evolve.`;
      
      case 'roles':
        return `**💼 Job Roles and Responsibilities for ${careerEntry.suggestedCareer}**\n\n**Common Job Titles:**
- Junior/Entry-level ${careerEntry.suggestedCareer}
- Senior ${careerEntry.suggestedCareer}
- Lead ${careerEntry.suggestedCareer}
- ${careerEntry.suggestedCareer} Specialist
- Technical ${careerEntry.suggestedCareer}

**Key Responsibilities:**
- Designing and implementing solutions using ${careerEntry.skill}
- Collaborating with cross-functional teams
- Problem-solving and troubleshooting
- Documentation and reporting
- Quality assurance and testing
- Mentoring junior team members (senior roles)
- Project planning and execution
- Stakeholder communication

**Work Environment:**
- Full-time positions in companies
- Remote work opportunities
- Freelance/contract possibilities
- Startup or enterprise settings
- Collaborative team environment`;
      
      case 'trends':
        return `**📈 Market Trends and Industry Outlook for ${careerEntry.suggestedCareer}**\n\n**Current Market Demand:**
- High demand across various industries
- Growing need for specialized ${careerEntry.skill} expertise
- Increasing adoption in traditional sectors
- Remote work opportunities expanding globally

**Industry Growth:**
- Steady growth in job openings
- Emerging opportunities in new sectors
- Rising demand for specialized skills
- Competitive salary trends

**Future Outlook:**
- Projected continued growth
- New specializations emerging
- Increasing integration with other fields
- Growing importance of ${careerEntry.skill} in business

**Key Industry Sectors:**
- Technology companies
- Financial services
- Healthcare
- Entertainment and media
- Manufacturing and logistics
- Consulting firms

**Emerging Trends:**
- AI and automation integration
- Remote work flexibility
- Focus on continuous learning
- Cross-functional collaboration
- Emphasis on soft skills`;
      
      case 'companies':
        const topCompanies = getTopCompaniesForCareer(careerEntry.suggestedCareer);
        return `**🏢 Top Companies for ${careerEntry.suggestedCareer}s**\n\n**Industry Leaders:**
- ${topCompanies.join('\n- ')}

**What These Companies Offer:**
- Competitive salaries (typically at or above the ${careerEntry.salaryRange} range)
- Career advancement opportunities
- Professional development resources
- Challenging and innovative projects
- Collaborative work environments
- Work-life balance initiatives

**Why They're Desirable Employers:**
- Industry-leading technology and resources
- Opportunities to work on cutting-edge projects
- Strong professional networking
- Prestige and resume-building experience
- Comprehensive benefits packages
- Learning and growth opportunities

**Alternative Employment Options:**
- Startups and scale-ups (for faster growth and more responsibilities)
- Government and public sector organizations (for stability and impact)
- Educational institutions (for research and teaching opportunities)
- Non-profit organizations (for mission-driven work)
- Freelance and consulting (for flexibility and variety)`;
      
      case 'certifications':
        const topCertifications = getTopCertificationsForCareer(careerEntry.suggestedCareer);
        return `**🏆 Top Certifications for ${careerEntry.suggestedCareer}s**\n\n**Industry-Recognized Credentials:**
- ${topCertifications.join('\n- ')}

**Benefits of Certification:**
- Validation of your skills and knowledge
- Increased earning potential (often 5-15% salary premium)
- Competitive advantage in job applications
- Structured learning path for skill development
- Professional recognition among peers and employers

**How to Get Certified:**
- Most certifications require a combination of study and hands-on experience
- Many offer online preparation courses and materials
- Practice exams are typically available to assess readiness
- Some require continuing education to maintain certification
- Costs range from a few hundred to several thousand dollars

**Certification Strategy:**
- Begin with foundational certifications to build your knowledge base
- Progress to specialized certifications as you define your career niche
- Focus on certifications most valued by your target employers
- Combine certifications with practical projects for maximum impact
- Keep certifications current with renewal requirements`;
      
      default:
        return '';
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <button 
        onClick={() => window.location.href = '/dashboard'} 
        className="fixed top-4 left-4 md:left-8 lg:left-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center group overflow-hidden relative z-50"
        aria-label="Back to dashboard"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">Back</span>
      </button>
      
      <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
        <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg flex items-center">
            <div className="flex items-center justify-center mr-3 relative">
              <img 
                src="/images/chatbot-logo.svg" 
                alt="CareerAI Logo" 
                className="w-9 h-9 drop-shadow-md"
              />
            </div>
            <div className="text-xl font-bold">CareerAI</div>
            <div className="ml-2 text-sm bg-blue-500 px-2 py-1 rounded-full">Career Guidance Bot</div>
            <div className="ml-auto flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <div className="text-xs">Online</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div 
                      className="text-base" /* Increased font size */
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {messages[messages.length - 1]?.showControls && (
                <div className="mb-4 space-y-4">
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🧠 Select your skills (select as many as you want):
                    </label>
                    <Select
                      isMulti
                      options={availableSkills}
                      value={selectedSkills}
                      onChange={handleSkillChange}
                      placeholder="Select your skills..."
                      className="w-full"
                    />
                  </div>

                  <div className="relative z-10">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🎯 Select your interests/hobbies (maximum 2, favorite first):
                    </label>
                    <Select
                      isMulti
                      options={availableHobbies}
                      value={selectedHobbies}
                      onChange={handleHobbyChange}
                      placeholder="Select your hobbies (max 2)..."
                      className="w-full"
                      isDisabled={selectedSkills.length === 0}
                    />
                    {selectedHobbies.length === 2 && (
                      <p className="text-xs text-amber-600 mt-1">Maximum 2 hobbies allowed. Your first selection is given higher priority.</p>
                    )}
                  </div>

                  <Button 
                    onClick={handleSelectionSubmit}
                    disabled={selectedSkills.length === 0 && selectedHobbies.length === 0}
                    aria-label="Submit skills and hobbies"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-base"
                  >
                    🚀 Get Career Suggestions
                  </Button>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 bg-white sticky bottom-0 z-30 shadow-md">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isChatComplete ? "Chat completed. Choose an option below." : "Type your message here..."}
                className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                  isChatComplete ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isChatComplete}
              />
              <button
                onClick={handleMessageSubmit}
                className={`p-3 rounded-lg transition-colors ${
                  isChatComplete 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                aria-label="Send message"
                disabled={isChatComplete}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            {isChatComplete && (
              <div className="mt-4 flex space-x-4">
                <button 
                  onClick={handleReset} 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Restart Conversation
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard'} 
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGuide;
