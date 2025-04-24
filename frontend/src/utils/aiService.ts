import { CareerGuidanceEntry } from './careerGuidanceUtils';

// Define your OpenAI API key and endpoint - this should be in your environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface RoadmapPhase {
  title: string;
  topics: string[];
}

interface CareerRoadmap {
  title: string;
  phases: RoadmapPhase[];
}

interface RoadmapsData {
  [key: string]: CareerRoadmap;
}

/**
 * Generate a detailed career description using OpenAI's API
 */
export const generateAICareerDescription = async (
  career: CareerGuidanceEntry, 
  userName: string
): Promise<string> => {
  try {
    const prompt = `
      Generate a comprehensive, personalized career guide for ${userName} about becoming a ${career.suggestedCareer}.
      
      Include the following sections in this exact order:
      1. A title with the career name
      2. A brief introduction to the career (2-3 sentences)
      3. A detailed career roadmap section structured in phases:
         - Phase 1: Foundation (Years 0-2) with Educational Background, Core Skills to Learn, and Basic Tools
         - Phase 2: Specialization (Years 2-4) with Specialized Skills, Tools & Frameworks, Projects to Build
         - Phase 3: Advanced Development (Years 4-6) with Open Source Contributions, Portfolio Building
         - Phase 4: Career Pathways (Years 6+) with Job Titles and Growth Options
      4. Required Skills (Technical and Soft Skills)
      5. Salary Information (based on: ${career.salaryRange})
      6. Industry Outlook and Job Market
      7. Work Environment and Culture
      8. Resources for Further Learning
      
      Make it conversational, personalized, and include emojis for section headers.
      Format with clean headings using bold text (**) rather than markdown headings.
      Use clear phase headings, bullet points and numbered lists where appropriate.
    `;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      // Fallback to the template-based response if API fails
      console.error('API returned unexpected format:', data);
      return generateDetailedCareerRoadmap(career);
    }
  } catch (error) {
    console.error('Error generating AI career description:', error);
    // Fallback to template if API fails
    return generateDetailedCareerRoadmap(career);
  }
};

/**
 * Generate a detailed career roadmap specifically
 */
export const generateCareerRoadmap = async (
  career: CareerGuidanceEntry,
  userName: string
): Promise<string> => {
  try {
    // Try to find a matching roadmap in the JSON file
    const response = await fetch('/final_detailed_career_roadmaps.json');
    const roadmaps: RoadmapsData = await response.json();
    
    const careerLower = career.suggestedCareer.toLowerCase();
    console.log('🔍 ROADMAP MATCHING - Searching for career:', career.suggestedCareer);
    
    // First try exact match
    let matchingRoadmap = Object.entries(roadmaps).find(([key]) => 
      key.toLowerCase() === careerLower
    );
    
    if (matchingRoadmap) {
      console.log('✅ ROADMAP MATCHING - Found exact match:', matchingRoadmap[0]);
    }
    
    // If no exact match, try full word match
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING - Trying full word match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyWords = key.toLowerCase().split(/\s+/);
        const careerWords = careerLower.split(/\s+/);
        const matches = careerWords.every(word => keyWords.includes(word));
        if (matches) {
          console.log('✅ ROADMAP MATCHING - Found full word match:', key);
        }
        return matches;
      });
    }
    
    // If still no match, try partial match with word boundaries
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING - Trying word boundary match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyLower = key.toLowerCase();
        // Check if the career title appears as a whole word in the key
        const matches = keyLower.includes(' ' + careerLower + ' ') || 
               keyLower.startsWith(careerLower + ' ') || 
               keyLower.endsWith(' ' + careerLower) ||
               keyLower === careerLower;
        if (matches) {
          console.log('✅ ROADMAP MATCHING - Found word boundary match:', key);
        }
        return matches;
      });
    }
    
    // Last resort: check if any of the career words are in the key
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING - Trying significant word match...');
      const careerWords = careerLower.split(/\s+/).filter(word => word.length > 3); // Only use significant words
      console.log('🔍 ROADMAP MATCHING - Significant words:', careerWords);
      
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
            console.log(`✅ ROADMAP MATCHING - Found match on word "${matchingWord}" in key "${key}"`);
            return true;
          }
          return false;
        });
      }
    }

    if (matchingRoadmap) {
      const [matchedKey, roadmap] = matchingRoadmap;
      console.log('✅ ROADMAP SELECTED:', matchedKey);
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
      console.log('❌ ROADMAP MATCHING - No match found for:', career.suggestedCareer);
    }
    
    // Fallback to template if no matching roadmap found
    return `I don't have a detailed roadmap template for ${career.suggestedCareer} yet.`;
  } catch (error) {
    console.error('Error generating career roadmap:', error);
    return `I don't have a detailed roadmap template for ${career.suggestedCareer} yet.`;
  }
};

/**
 * Fallback template-based career description when API is unavailable
 */
const generateDetailedCareerRoadmap = (career: CareerGuidanceEntry): string => {
  return `**${career.suggestedCareer}**

${career.suggestedCareer} is a profession that combines skills in ${career.skill} with interests related to ${career.hobby}. This career path allows professionals to apply technical expertise in creative and practical ways that align with their personal interests.

**🎯 Career Roadmap: ${career.suggestedCareer}**

**🔹 Phase 1: Foundation (Years 0-2)**
- **Educational Background**
  - Bachelor's degree in ${career.skill} or related field (recommended but not always required)
  - Relevant certifications and online courses
  - Self-learning through tutorials and documentation

- **Core Skills to Learn**
  - Fundamental principles of ${career.skill}
  - Basic understanding of industry tools and software
  - Problem-solving and analytical thinking
  - Communication skills for team collaboration

- **Basic Tools & Technologies**
  - Industry-standard software and platforms
  - Version control systems
  - Project management tools

**🔹 Phase 2: Specialization (Years 2-4)**
- **Specialized Skills**
  - Advanced techniques in ${career.skill}
  - In-depth knowledge of specific sub-fields
  - Project planning and execution
  - Quality assurance and testing methodologies

- **Tools & Frameworks**
  - Advanced software applications
  - Specialized frameworks for increased productivity
  - Automation tools for repetitive tasks

- **Projects to Build**
  - Personal portfolio showcasing your abilities
  - Collaborative projects with peers
  - Open source contributions to build reputation

**🔹 Phase 3: Professional Growth (Years 4-6)**
- **Career Progression**
  - Junior to mid-level positions
  - Mentorship opportunities
  - Leading small teams or projects
  - Specializing in high-demand niches

- **Advanced Development**
  - Research and development of new techniques
  - Optimization and efficiency improvements
  - Cross-functional collaboration
  - Problem-solving for complex challenges

**🔹 Phase 4: Leadership & Mastery (Years 6+)**
- **Senior Positions**
  - Team leadership roles
  - Project management
  - Strategy and vision development
  - Mentoring junior professionals

- **Alternative Pathways**
  - Consulting or freelancing
  - Starting your own business
  - Teaching and knowledge sharing
  - Research and innovation

**💰 Compensation & Benefits**
- **Salary Range:** ${career.salaryRange}
- **Work-Life Balance:** Most positions offer flexible hours and remote work possibilities
- **Growth Potential:** High demand across various industries with opportunities for advancement

**🔧 Required Skills**
- **Technical Skills:**
  - Strong foundation in ${career.skill}
  - Proficiency with industry tools and technologies
  - Problem-solving and analytical thinking

- **Soft Skills:**
  - Communication and collaboration
  - Time management
  - Adaptability
  - Attention to detail

**🌐 Industry Outlook**
The demand for ${career.suggestedCareer}s is growing rapidly as organizations continue to prioritize ${career.skill.toLowerCase()} capabilities. The field offers opportunities in various sectors including technology, healthcare, finance, entertainment, and more.

**🚀 Day-to-Day Responsibilities**
- Collaborating with cross-functional teams
- Designing and implementing solutions
- Testing and validating work
- Staying updated on industry trends and best practices
- Communicating progress and results to stakeholders

**📚 Recommended Resources**
- Professional associations and communities
- Industry conferences and workshops
- Online learning platforms (Coursera, Udemy, LinkedIn Learning)
- Books and publications specific to ${career.skill}

**💡 Would you like to know more about any specific aspect of this career roadmap?**`;
};

/**
 * Detailed roadmap template for when API is unavailable
 */
const generateDetailedRoadmapTemplate = async (career: CareerGuidanceEntry): Promise<string> => {
  const careerLower = career.suggestedCareer.toLowerCase();
  console.log('🔍 ROADMAP MATCHING (aiService) - Searching for career:', career.suggestedCareer);
  
  try {
    // Fetch the roadmap data from the public directory
    const response = await fetch('/final_detailed_career_roadmaps.json');
    const roadmaps: RoadmapsData = await response.json();
    
    // First try exact match
    let matchingRoadmap = Object.entries(roadmaps).find(([key]) => 
      key.toLowerCase() === careerLower
    );
    
    if (matchingRoadmap) {
      console.log('✅ ROADMAP MATCHING (aiService) - Found exact match:', matchingRoadmap[0]);
    }
    
    // If no exact match, try full word match
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (aiService) - Trying full word match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyWords = key.toLowerCase().split(/\s+/);
        const careerWords = careerLower.split(/\s+/);
        const matches = careerWords.every(word => keyWords.includes(word));
        if (matches) {
          console.log('✅ ROADMAP MATCHING (aiService) - Found full word match:', key);
        }
        return matches;
      });
    }
    
    // If still no match, try partial match with word boundaries
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (aiService) - Trying word boundary match...');
      matchingRoadmap = Object.entries(roadmaps).find(([key]) => {
        const keyLower = key.toLowerCase();
        // Check if the career title appears as a whole word in the key
        const matches = keyLower.includes(' ' + careerLower + ' ') || 
               keyLower.startsWith(careerLower + ' ') || 
               keyLower.endsWith(' ' + careerLower) ||
               keyLower === careerLower;
        if (matches) {
          console.log('✅ ROADMAP MATCHING (aiService) - Found word boundary match:', key);
        }
        return matches;
      });
    }
    
    // Last resort: check if any of the career words are in the key
    if (!matchingRoadmap) {
      console.log('🔄 ROADMAP MATCHING (aiService) - Trying significant word match...');
      const careerWords = careerLower.split(/\s+/).filter(word => word.length > 3); // Only use significant words
      console.log('🔍 ROADMAP MATCHING (aiService) - Significant words:', careerWords);
      
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
            console.log(`✅ ROADMAP MATCHING (aiService) - Found match on word "${matchingWord}" in key "${key}"`);
            return true;
          }
          return false;
        });
      }
    }

    if (matchingRoadmap) {
      const [matchedKey, roadmap] = matchingRoadmap;
      console.log('✅ ROADMAP SELECTED (aiService):', matchedKey);
      let response = `**🎯 ${roadmap.title} Roadmap**\n\n`;
      
      roadmap.phases.forEach(phase => {
        response += `**${phase.title}**\n`;
        phase.topics.forEach(topic => {
          response += `- ${topic}\n`;
        });
        response += '\n';
      });

      return response;
    } else {
      console.log('❌ ROADMAP MATCHING (aiService) - No match found for:', career.suggestedCareer);
    }
  } catch (error) {
    console.error('Error loading roadmap data:', error);
  }

  // Default roadmap for careers not found in the JSON
  return `**🎯 Career Roadmap: ${career.suggestedCareer}**

**🔹 Phase 1: Foundation (Years 0-2)**
- Educational background and certifications
- Core technical skills development
- Basic tools and technologies
- Initial project experience

**🔹 Phase 2: Specialization (Years 2-4)**
- Advanced technical skills
- Industry-specific knowledge
- Project management
- Team collaboration

**🔹 Phase 3: Professional Growth (Years 4-6)**
- Leadership skills
- Advanced certifications
- Strategic thinking
- Industry networking

**🔹 Phase 4: Leadership (Years 6+)**
- Senior roles
- Team management
- Strategic planning
- Industry influence

**💡 Would you like more specific details about any phase of this career roadmap?**`;
}; 