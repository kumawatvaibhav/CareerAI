
// Utility functions for the chat component

/**
 * Formats text that may contain markdown into HTML
 * Simple version - for a real app, use a proper markdown parser
 */
export const formatMessage = (message: string): string => {
  // Replace **text** with <strong>text</strong>
  let formattedText = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace *text* with <em>text</em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace URLs with anchor tags
  formattedText = formattedText.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
  );
  
  // Replace newlines with <br>
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  return formattedText;
};

/**
 * Generates a typing delay based on message length
 */
export const getTypingDelay = (message: string): number => {
  // Average reading speed is about 200-250 words per minute
  // This is about 3-4 words per second
  const words = message.split(' ').length;
  const baseDelay = 500; // minimum delay in ms
  const delayPerWord = 100; // ms per word
  
  return Math.min(baseDelay + words * delayPerWord, 3000); // cap at 3 seconds
};

/**
 * Get a random response for a given category
 */
export const getRandomResponse = (category: string): string => {
  const responses: Record<string, string[]> = {
    greeting: [
      "Hello! I'm your AI career assistant. How can I help you today?",
      "Hi there! Ready to explore your career options?",
      "Welcome! I'm here to help with your career questions."
    ],
    careerAdvice: [
      "Based on your background, you might excel in roles that combine technical and creative skills.",
      "Have you considered exploring opportunities in emerging fields like AI ethics or sustainable technology?",
      "Your experience would be valuable in project management or team leadership roles."
    ],
    resumeTips: [
      "For your resume, focus on quantifiable achievements rather than just listing responsibilities.",
      "Consider organizing your resume by skills rather than chronologically if you're changing careers.",
      "Tailor your resume keywords to match the specific job description for better ATS performance."
    ],
    jobSearch: [
      "Beyond traditional job boards, try networking on industry-specific platforms.",
      "Informational interviews can be a powerful way to learn about potential roles and make connections.",
      "Consider reaching out to alumni from your school who work in your target industry."
    ],
    fallback: [
      "I'm not sure I understand completely. Could you provide more details about your career goals?",
      "That's an interesting question. To give you the best advice, could you tell me more about your background?",
      "I want to help you effectively. Could you elaborate a bit more on what you're looking for?"
    ]
  };
  
  const categoryResponses = responses[category] || responses.fallback;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
};
