import React, { useState, useRef, useEffect } from "react";
import styles from "./CareerGuide.module.css";

interface Career {
  id: number;
  name: string;
  category: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CategorySelections {
  [key: string]: string[];
}

const CareerGuide: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selections, setSelections] = useState<CategorySelections>({
    "Technical Skills": [],
    Interests: [],
    Hobbies: [],
  });
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = {
    "Technical Skills": [
      "Programming (Python/Java/C++)",
      "Web Development (HTML/CSS/JS)",
      "Data Analysis",
      "Network Security",
      "Machine Learning",
      "Cloud Computing",
      "Embedded Systems",
      "UI/UX Design",
      "Database Management",
      "IoT Development",
      "Cryptography",
      "Version Control (Git)",
      "Containerization (Docker/K8s)",
      "Mobile App Development",
      "API Development",
      "CI/CD Pipelines",
      "Data Structures & Algorithms",
      "Linux/Command Line",
      "Blockchain Basics",
      "DevOps Tools (Jenkins/GitHub Actions)",
    ],
    Interests: [
      "Artificial Intelligence Research",
      "Ethical Hacking",
      "Robotics Design",
      "Big Data Patterns",
      "Human-Computer Interaction",
      "Hardware Tinkering",
      "Game Mechanics",
      "Business Process Optimization",
      "Biomedical Tech",
      "Renewable Energy Systems",
      "Smart Cities & IoT",
      "Autonomous Vehicles",
      "AR/VR Technologies",
      "Natural Language Processing",
      "Open Source Community",
      "Cyber Law and Policy",
      "Financial Technologies (FinTech)",
      "Digital Art & Visualization",
      "Digital Twins",
      "AI in Healthcare",
    ],
    Hobbies: [
      "Competitive Coding",
      "CTF (Capture The Flag) Challenges",
      "DIY Electronics Projects",
      "Open Source Contributions",
      "3D Modeling/Game Modding",
      "Tech Blogging",
      "Drone Building",
      "Home Automation Projects",
      "Data Visualization Art",
      "VR World Creation",
      "Tinkering with Raspberry Pi / Arduino",
      "Attending Hackathons",
      "Building Personal Portfolio Sites",
      "Creating YouTube Tech Tutorials",
      "Reverse Engineering Apps",
      "Simulations & Virtual Labs",
      "Playing Strategy Games",
      "Creating Discord Bots",
      "Podcasting on Tech Topics",
      "Experimenting with AI Art Tools",
    ],
  };

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your career assistant. Let's find the perfect career path for you. Please select your technical skills, interests, and hobbies from the categories below.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (category: string, item: string) => {
    setSelections((prev) => {
      const newSelection = prev[category].includes(item)
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item];
      return { ...prev, [category]: newSelection };
    });
  };

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const hasSelections = Object.values(selections).some(
        (items) => items.length > 0
      );
      if (!hasSelections) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Please select at least one skill or interest to get suggestions.",
          },
        ]);
        setLoading(false);
        return;
      }

      // Add user's selections as a message
      const userSelections = Object.entries(selections)
        .filter(([_, items]) => items.length > 0)
        .map(([category, items]) => `${category}: ${items.join(", ")}`)
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userSelections,
        },
      ]);

      const response = await fetch("http://localhost:8000/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selections),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Format the careers into a readable message
      const careersMessage = data.careers
        .map((career: Career) => `${career.id}. ${career.name}`)
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: careersMessage,
        },
      ]);

      setShowChat(true);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your message. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className={styles.careerGuideContainer}>
      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              }`}
            >
              <div className={styles.messageContent}>{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {!showChat ? (
          <div className={styles.selectionContainer}>
            <div className={styles.categorySelectors}>
              {Object.entries(categories).map(([category, items]) => (
                <div key={category} className={styles.categoryBox}>
                  <h3>{category}</h3>
                  <div className={styles.dropdown}>
                    {items.map((item) => (
                      <label key={item} className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          checked={selections[category].includes(item)}
                          onChange={() => handleSelect(category, item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={getSuggestions}
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Generating Suggestions..." : "Get Career Suggestions"}
            </button>
          </div>
        ) : (
          <div className={styles.chatInputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about the suggested careers..."
              className={styles.chatInput}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className={styles.sendButton}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGuide;
