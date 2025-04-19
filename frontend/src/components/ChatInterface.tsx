
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import FadeIn from './animations/FadeIn';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I\'m your AI career assistant. How can I help with your career journey today?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "Please Enter Your Name.",
        "This is only demo version, Please Login to get full access.",
        "I can help you with career advice, resume tips, and job market trends.",
        "For personalized career guidance, please provide your skills and experience.",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl glass-card overflow-hidden flex flex-col h-[600px]">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Career Assistant</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="flex items-center gap-1 text-sm"
        >
          <RefreshCw size={14} /> Reset
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <FadeIn 
            key={message.id} 
            delay={index * 50} 
            direction={message.sender === 'user' ? 'left' : 'right'}
            once={true}
          >
            <div
              className={cn(
                "max-w-[85%] p-4 rounded-2xl",
                message.sender === 'user'
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-secondary text-secondary-foreground"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </FadeIn>
        ))}
        
        {isLoading && (
          <div className="mr-auto max-w-[85%] p-4 rounded-2xl bg-secondary text-secondary-foreground">
            <div className="typing-indicator flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <textarea
            className="flex-1 p-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ask about career advice, resume tips, or job market trends..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading}
            className="rounded-full p-3 h-auto aspect-square"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
