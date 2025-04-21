import React, { useState, useRef, useEffect } from "react";
import styles from "./CareerGuide.module.css";
import NavBar from "@/components/NavBar";
interface Career {
  id: number;
  name: string;
  category: string;
  description: string | null;
  salary_range: {
    entry_level: string;
    mid_level: string;
    senior_level: string;
  } | null;
  roles_offered: string[] | null;
  required_skills: string[] | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  careers?: Career[];
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
  const [careers, setCareers] = useState<Career[]>([]);

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

      // Store the careers data
      setCareers(data.careers);

      // Format the careers into a readable message
      const careersMessage = `Based on your selections, here are some career suggestions that might be a good fit for you:\n\n${data.careers
        .map((career: Career) => {
          let message = `💼 ${career.name}\n`;
          if (career.description) {
            message += `📝 ${career.description}\n`;
          }
          if (career.salary_range) {
            message += `💰 Salary Range:\n`;
            message += `   • Entry Level: ${career.salary_range.entry_level}\n`;
            message += `   • Mid Level: ${career.salary_range.mid_level}\n`;
            message += `   • Senior Level: ${career.salary_range.senior_level}\n`;
          }
          if (career.roles_offered && career.roles_offered.length > 0) {
            message += `🎯 Roles Offered: ${career.roles_offered.join(", ")}\n`;
          }
          if (career.required_skills && career.required_skills.length > 0) {
            message += `🛠️ Required Skills: ${career.required_skills.join(
              ", "
            )}\n`;
          }
          return message;
        })
        .join("\n\n")}`;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: careersMessage,
          careers: data.careers,
        },
        {
          role: "assistant",
          content:
            "Would you like to know more about any of these careers? Just type the name of the career you're interested in, and I'll provide more details!",
          careers: null,
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
      // Check if the message is asking about a specific career
      const careerNames = careers.map((career) => career.name.toLowerCase());
      const isCareerQuery = careerNames.some((name) =>
        userMessage.toLowerCase().includes(name)
      );

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          messages: messages,
          isCareerQuery: isCareerQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // If it's a career query, show the response directly
      if (isCareerQuery) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            careers: null,
          },
        ]);
      } else {
        // For general queries, show the response and ask if they want to know more
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            careers: null,
          },
          {
            role: "assistant",
            content:
              "Would you like to know more about any of these careers? Just type the name of the career you're interested in!",
            careers: null,
          },
        ]);
      }
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

  const renderCareerDetails = (career: Career) => {
    return (
      <div className={styles.careerCard}>
        <h3 className={styles.careerTitle}>{career.name}</h3>
        {career.description && (
          <div className={styles.careerSection}>
            <h4>Description</h4>
            <p>{career.description}</p>
          </div>
        )}
        {career.salary_range && (
          <div className={styles.careerSection}>
            <h4>Salary Range</h4>
            <div className={styles.salaryGrid}>
              <div className={styles.salaryItem}>
                <span className={styles.salaryLabel}>Entry Level:</span>
                <span className={styles.salaryValue}>
                  {career.salary_range.entry_level}
                </span>
              </div>
              <div className={styles.salaryItem}>
                <span className={styles.salaryLabel}>Mid Level:</span>
                <span className={styles.salaryValue}>
                  {career.salary_range.mid_level}
                </span>
              </div>
              <div className={styles.salaryItem}>
                <span className={styles.salaryLabel}>Senior Level:</span>
                <span className={styles.salaryValue}>
                  {career.salary_range.senior_level}
                </span>
              </div>
            </div>
          </div>
        )}
        {career.roles_offered && career.roles_offered.length > 0 && (
          <div className={styles.careerSection}>
            <h4>Roles Offered</h4>
            <div className={styles.tags}>
              {career.roles_offered.map((role, index) => (
                <span key={index} className={styles.tag}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
        {career.required_skills && career.required_skills.length > 0 && (
          <div className={styles.careerSection}>
            <h4>Required Skills</h4>
            <div className={styles.tags}>
              {career.required_skills.map((skill, index) => (
                <span key={index} className={styles.tag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #004d40 0%, #00332c 100%)",
        height: "91vh",
        marginTop: "64px",
        padding: "10px",
      }}
    >
      <div
        className={styles.navbarContainer}
        style={{
          background: "white",
        }}
      >
        <NavBar />
      </div>
      <div className={styles.container}>
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
                {message.role === "assistant" && message.careers ? (
                  <div className={styles.careerDetails}>
                    {message.careers.map(renderCareerDetails)}
                  </div>
                ) : (
                  <div className={styles.messageContent}>{message.content}</div>
                )}
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
                {loading
                  ? "Generating Suggestions..."
                  : "Get Career Suggestions"}
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
    </div>
  );
};

export default CareerGuide;
