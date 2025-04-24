import { useState, useEffect } from 'react';

// Define types for our career guidance data
export interface CareerGuidanceEntry {
  skill: string;
  hobby: string;
  suggestedCareer: string;
  relevanceScore: number;
  salaryRange: string;
  careerRoadmap: string;
  briefOverview: string;
  dayToDayTasks: string;
}

// Chat conversation states
export enum ConversationState {
  GREETING = 'greeting',
  ASK_NAME = 'ask_name',
  GREETING_WITH_NAME = 'greeting_with_name',
  ASK_SKILLS = 'ask_skills',
  SHOW_SKILL_SELECTOR = 'show_skill_selector',
  SUGGEST_CAREERS = 'suggest_careers',
  DISCUSS_SPECIFIC_CAREER = 'discuss_specific_career',
}

interface ScoredCareer extends CareerGuidanceEntry {
  score: number;
}

// Function to load and parse the CSV data
export const useCareerGuidanceData = () => {
  const [data, setData] = useState<CareerGuidanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/career_guidance_dataset_with_overview_tasks.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const rows = csvText.split('\n');
        const headers = rows[0].split(',');
        
        const parsedData: CareerGuidanceEntry[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          // Process the row properly to handle commas within quoted fields
          let values = [];
          let insideQuotes = false;
          let currentValue = '';
          
          for (let j = 0; j < rows[i].length; j++) {
            const char = rows[i][j];
            
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Don't forget the last value
          values.push(currentValue.trim());
          
          if (values.length >= 8) {
            parsedData.push({
              skill: values[0].trim(),
              hobby: values[1].trim(),
              suggestedCareer: values[2].trim(),
              relevanceScore: parseInt(values[3].split('-')[0].replace(/\D/g, '') || '0'),
              salaryRange: values[4].trim(),
              careerRoadmap: values[5].trim().replace(/"/g, ''),
              briefOverview: values[6].trim().replace(/"/g, ''),
              dayToDayTasks: values[7].trim().replace(/"/g, '')
            });
          }
        }
        
        setData(parsedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching career guidance data:', err);
        setError('Failed to load career guidance data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Function to extract all unique skills from the dataset
export const extractUniqueSkills = (data: CareerGuidanceEntry[]): string[] => {
  if (!data || data.length === 0) return [];
  
  // Extract all skills and remove duplicates
  const skillsSet = new Set<string>();
  
  data.forEach(entry => {
    if (entry.skill && entry.skill.trim() !== '') {
      skillsSet.add(entry.skill.trim());
    }
  });
  
  // Sort skills by most common/relevant first
  const sortedSkills = Array.from(skillsSet).sort((a, b) => {
    const prioritySkills = [
      'Programming',
      'Web Development',
      'Data Science',
      'UI/UX Design',
      'Mobile Development',
      'Digital Marketing',
      'Video Production',
      'Cybersecurity',
      '3D Design',
      'Project Management'
    ];
    
    const aIndex = prioritySkills.indexOf(a);
    const bIndex = prioritySkills.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  return sortedSkills;
};

// Function to extract relevant hobbies based on selected skill
export const extractRelevantHobbies = (data: CareerGuidanceEntry[], selectedSkill: string): string[] => {
  if (!data || data.length === 0 || !selectedSkill) return [];
  
  // Find all hobbies associated with the selected skill
  const hobbiesSet = new Set<string>();
  
  data.forEach(entry => {
    if (entry.skill === selectedSkill && entry.hobby && entry.hobby.trim() !== '') {
      hobbiesSet.add(entry.hobby.trim());
    }
  });
  
  // Sort hobbies by most common/relevant first
  const sortedHobbies = Array.from(hobbiesSet).sort((a, b) => {
    const priorityHobbies = [
      'Gaming',
      'Sports',
      'Design',
      'Research',
      'Finance',
      'Writing',
      'Music',
      'Travel',
      'Photography',
      'Fashion'
    ];
    
    const aIndex = priorityHobbies.indexOf(a);
    const bIndex = priorityHobbies.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  return sortedHobbies;
};

// Function to extract all unique hobbies from the dataset
export const extractUniqueHobbies = (data: CareerGuidanceEntry[]): string[] => {
  if (!data || data.length === 0) return [];
  
  // Extract all hobbies and remove duplicates
  const hobbiesSet = new Set<string>();
  
  data.forEach(entry => {
    if (entry.hobby && entry.hobby.trim() !== '') {
      hobbiesSet.add(entry.hobby.trim());
    }
  });
  
  return Array.from(hobbiesSet).sort();
};

// Function to get career suggestions for selected skills and hobbies
export const getCareerSuggestionsBySelectedSkills = (
  data: CareerGuidanceEntry[],
  selectedSkills: string[],
  selectedHobbies: string[]
): CareerGuidanceEntry[] => {
  if (!data || data.length === 0) return [];
  
  // If no skills or hobbies are selected, return an empty array
  if (selectedSkills.length === 0 && selectedHobbies.length === 0) return [];

  const normalizedSelectedSkills = selectedSkills.map(skill => skill.toLowerCase());
  const normalizedSelectedHobbies = selectedHobbies.map(hobby => hobby.toLowerCase());

  // Score each career entry based on skill and hobby matches
  const scoredCareers: ScoredCareer[] = data.map(career => {
    let score = 0;
    const maxScore = 100;
    
    // Normalize career skills and hobbies for comparison
    const careerSkill = career.skill.toLowerCase();
    const careerHobby = career.hobby.toLowerCase();
    
    // Calculate skill match score (60% of total weight)
    if (normalizedSelectedSkills.length > 0) {
      // Direct skill match
      if (normalizedSelectedSkills.includes(careerSkill)) {
        score += 60;
      }
      // Partial skill match (check if any selected skill is part of career skill or vice versa)
      else if (normalizedSelectedSkills.some(skill => 
        careerSkill.includes(skill) || skill.includes(careerSkill)
      )) {
        score += 30;
      }
    }
    
    // Calculate hobby match score (40% of total weight)
    if (normalizedSelectedHobbies.length > 0) {
      // The first hobby is weighted more (30% vs 10% for second hobby)
      if (normalizedSelectedHobbies[0] === careerHobby) {
        score += 30; // First hobby gets 30% weight
      } 
      // Partial match for first hobby
      else if (normalizedSelectedHobbies[0] && 
        (careerHobby.includes(normalizedSelectedHobbies[0]) || 
         normalizedSelectedHobbies[0].includes(careerHobby))) {
        score += 15;
      }
      
      // Check for second hobby if it exists
      if (normalizedSelectedHobbies.length > 1) {
        if (normalizedSelectedHobbies[1] === careerHobby) {
          score += 10; // Second hobby gets 10% weight
        }
        // Partial match for second hobby
        else if (careerHobby.includes(normalizedSelectedHobbies[1]) || 
                normalizedSelectedHobbies[1].includes(careerHobby)) {
          score += 5;
        }
      }
    }
    
    return { ...career, score };
  });

  // Sort by score and remove duplicates
  const uniqueCareers = new Map<string, ScoredCareer>();
  
  scoredCareers
    .sort((a, b) => b.score - a.score)
    .forEach(career => {
      if (!uniqueCareers.has(career.suggestedCareer)) {
        uniqueCareers.set(career.suggestedCareer, career);
      }
    });

  // Return top 10 unique careers
  return Array.from(uniqueCareers.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

// Function to get career suggestions based on skills and interests
export const getCareerSuggestions = (
  data: CareerGuidanceEntry[],
  skills: string[],
  interests: string[],
  limit = 3
): CareerGuidanceEntry[] => {
  if (!data.length || (!skills.length && !interests.length)) {
    return [];
  }

  // Convert to lowercase for case-insensitive matching
  const normalizedSkills = skills.map(s => s.toLowerCase());
  const normalizedInterests = interests.map(i => i.toLowerCase());

  // Score each career entry based on matches with user skills and interests
  const scoredEntries = data.map(entry => {
    let score = 0;
    
    // Check if the entry's skill matches any of the user's skills
    if (normalizedSkills.some(skill => 
      entry.skill.toLowerCase().includes(skill) || 
      skill.includes(entry.skill.toLowerCase())
    )) {
      score += 2; // Higher weight for skill match
    }
    
    // Check if the entry's hobby matches any of the user's interests
    if (normalizedInterests.some(interest => 
      entry.hobby.toLowerCase().includes(interest) || 
      interest.includes(entry.hobby.toLowerCase())
    )) {
      score += 1; // Lower weight for hobby match
    }
    
    // Also consider the relevance score from the dataset
    score += entry.relevanceScore / 10;
    
    return { ...entry, matchScore: score };
  });

  // Sort by match score and take the top entries
  return scoredEntries
    .filter(entry => entry.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

// Function to extract skills and interests from user messages
export const extractSkillsAndInterests = (message: string): { skills: string[], interests: string[] } => {
  const lowerMessage = message.toLowerCase();
  
  // Common skill keywords
  const skillKeywords = [
    'programming', 'coding', 'development', 'software', 'web', 'data', 'analysis',
    'design', 'marketing', 'writing', 'finance', 'management', 'leadership',
    'research', 'teaching', 'medicine', 'engineering', 'science', 'math', 'communication'
  ];
  
  // Common interest/hobby keywords
  const interestKeywords = [
    'gaming', 'music', 'reading', 'sports', 'art', 'travel', 'photography',
    'cooking', 'fitness', 'yoga', 'blockchain', 'ai', 'machine learning',
    'writing', 'painting', 'dancing', 'hiking', 'chess', 'fashion', 'movies',
    'cricket', 'football', 'tennis', 'basketball', 'swimming', 'cycling'
  ];
  
  const skills = skillKeywords.filter(skill => lowerMessage.includes(skill));
  const interests = interestKeywords.filter(interest => lowerMessage.includes(interest));
  
  return { skills, interests };
};

// Generate a response based on career suggestions
export const generateCareerResponse = (suggestions: CareerGuidanceEntry[]): string => {
  if (suggestions.length === 0) {
    return "I couldn't find specific career matches based on what you've shared. Could you tell me more about your skills and interests?";
  }
  
  let response = "Based on what you've shared, here are some career paths you might consider:\n\n";
  
  suggestions.forEach((suggestion, index) => {
    response += `**${index + 1}. ${suggestion.suggestedCareer}**\n`;
    response += `- Salary Range: ${suggestion.salaryRange}\n`;
    response += `- Career Path: ${suggestion.careerRoadmap}\n\n`;
  });
  
  response += "Would you like more specific information about any of these careers?";
  
  return response;
}; 