# CareerAI - Intelligent Career Guidance System

CareerAI is an intelligent career guidance system that helps users explore and understand various career options based on their skills and interests. The system provides personalized career suggestions and detailed information about different professions in a conversational manner.

## Features

### 1. Interactive Career Selection

- Select from multiple categories of skills and interests
- Real-time filtering and search capabilities
- User-friendly interface with checkboxes and dropdowns
- Horizontal layout for easy navigation

### 2. Smart Career Suggestions

- AI-powered career recommendations based on selected skills
- Detailed career information including:
  - Job descriptions
  - Required skills
  - Salary ranges
  - Career growth opportunities
  - Industry demand

### 3. Conversational Interface

- WhatsApp-like chat interface
- Natural language processing for queries
- Bullet-point formatted responses
- Context-aware conversations
- Support for both career-specific and general questions

### 4. Modern UI/UX

- Clean, modern design with gradient backgrounds
- Responsive layout
- Smooth animations and transitions
- Intuitive navigation
- Mobile-friendly interface

## Technical Stack

### Frontend

- React.js
- TypeScript
- CSS Modules
- Modern UI components
- Responsive design

### Backend

- Python
- Flask
- GROQ API for AI processing
- JSON data management
- RESTful API endpoints

## Project Structure

```
CareerAI/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── CareerGuide.tsx
│   │   ├── components/
│   │   └── styles/
│   └── package.json
├── python_backend/
│   ├── main.py
│   ├── data/
│   │   ├── carrerFinal150.json
│   │   └── salaryJobRole150.json
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- GROQ API key

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd CareerAI/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd CareerAI/python_backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file with your GROQ API key:

   ```
   GROQ_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   python main.py
   ```

## Usage Flow

1. **Initial Setup**

   - Launch the application
   - The system presents categories of skills and interests

2. **Skill Selection**

   - User selects relevant skills and interests
   - System processes selections in real-time
   - Submit selections to get career suggestions

3. **Career Exploration**

   - System displays suggested careers
   - Each career card shows key information
   - User can ask specific questions about careers

4. **Interactive Chat**

   - User can ask questions about any career
   - System responds with detailed, bullet-point information
   - Supports both career-specific and general questions
   - Maintains conversation context

5. **Follow-up Questions**
   - Users can ask follow-up questions
   - System provides relevant, detailed responses
   - Maintains bullet-point format for clarity
   - Handles both career-related and general queries

## Response Format

The system provides responses in a clear, bullet-point format:

```
• [First key point]
• [Second key point]
• [Third key point]
...
```

For career-specific questions, responses include:

- Career overview
- Required skills
- Growth opportunities
- Day-to-day responsibilities
- Industry demand

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- GROQ API for AI capabilities
- React and Flask communities
- All contributors to this project
