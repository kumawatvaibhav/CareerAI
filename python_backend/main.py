from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import traceback
import groq
import re
import json
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("career_api")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize GROQ client with API key from environment variable
client = groq.Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

if not client:
    logger.error("Failed to initialize GROQ client. Please check your API key in .env file.")
    raise RuntimeError("GROQ client initialization failed")

# Store the last suggested careers for each session
suggested_careers = {}

def load_json_data():
    """Load data from JSON files"""
    data_dir = Path(__file__).parent / "data"
    career_data = {}
    salary_data = {}
    
    try:
        logger.info("Loading JSON data files...")
        # Load career descriptions
        career_file_path = data_dir / "carrerFinal150.json"
        logger.info(f"Loading career data from: {career_file_path}")
        with open(career_file_path, 'r') as f:
            career_data = json.load(f)
            logger.info(f"Successfully loaded career data. Found {len(career_data.get('careers', []))} careers")
            
        # Load salary and role data
        salary_file_path = data_dir / "salaryJobRole150.json"
        logger.info(f"Loading salary data from: {salary_file_path}")
        with open(salary_file_path, 'r') as f:
            salary_data = json.load(f)
            logger.info(f"Successfully loaded salary data. Found {len(salary_data.get('careers', []))} careers")
            
        return career_data, salary_data
    except Exception as e:
        logger.error(f"Error loading JSON data: {str(e)}")
        logger.error(traceback.format_exc())
        return {}, {}

def clean_response(text):
    # Remove <think> tags and their content
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    
    # Remove any remaining think tags that might be incomplete
    text = re.sub(r'<think>.*$', '', text, flags=re.DOTALL)
    text = re.sub(r'^.*?</think>', '', text, flags=re.DOTALL)
    
    # Remove any lines containing "think" or "thought process"
    text = re.sub(r'^.*think.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    
    # Remove any lines that contain explanations or reasoning
    text = re.sub(r'^.*(explanation|reasoning|analysis).*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    
    # Extract career names (lines that look like numbered lists)
    career_lines = re.findall(r'^\d+\.\s*(.*?)$', text, flags=re.MULTILINE)
    
    # If we found career lines, use them
    if career_lines:
        return '\n'.join(career_lines)
    
    # If no numbered lines found, try to find any non-empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return '\n'.join(lines)

def match_career_data(career_names, career_data, salary_data):
    """Match career names with data from JSON files"""
    matched_careers = []
    logger.info(f"Starting to match {len(career_names)} careers with JSON data")
    
    for career in career_names:
        logger.info(f"Matching career: {career['name']}")
        matched_career = {
            "id": career["id"],
            "name": career["name"],
            "category": career["category"],
            "description": None,
            "salary_range": None,
            "roles_offered": None,
            "required_skills": None
        }
        
        # Match with career descriptions
        for career_item in career_data.get("careers", []):
            if career_item["title"].lower() == career["name"].lower():
                logger.info(f"Found matching career description for: {career['name']}")
                matched_career["description"] = career_item["description"]
                break
                
        # Match with salary and role data
        for salary_item in salary_data.get("careers", []):
            if salary_item["title"].lower() == career["name"].lower():
                logger.info(f"Found matching salary data for: {career['name']}")
                matched_career["salary_range"] = salary_item["salary_range"]
                matched_career["roles_offered"] = salary_item["roles_offered"]
                matched_career["required_skills"] = salary_item["required_skills"]
                break
                
        matched_careers.append(matched_career)
        logger.info(f"Completed matching for: {career['name']}")
        
    logger.info(f"Completed matching all careers. Found matches for {len(matched_careers)} careers")
    return matched_careers

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    try:
        logger.info("Received request at /api/suggestions")
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        if not data:
            logger.error("No data provided in request")
            return jsonify({"error": "No data provided"}), 400
            
        # Extract all selected items into a single list
        all_selections = []
        for category, items in data.items():
            all_selections.extend(items)
            
        logger.info(f"Processed selections: {all_selections}")
        
        # Load JSON data
        career_data, salary_data = load_json_data()
        logger.info("JSON data loaded successfully")
        
        # Create prompt for GROQ
        prompt = f"""
        Based on these skills and interests: {', '.join(all_selections)}
        
        List exactly 10 specific technology-related career names that would be a good fit.
        Return ONLY the career names, one per line, with no additional text, descriptions, or formatting.
        Each career name should be specific (e.g., "Frontend Developer" instead of just "Developer").
        Do not include any greetings, introductions, or follow-up questions.
        Do not include numbers in the career names.
        Do not use any markdown formatting.
        Do not include any category or type information after the career names.
        Do not include any explanations or thought processes.
        Do not include any <think> tags or internal reasoning.
        Do not include any lines that start with "think" or contain "thought process".
        Do not number the career names.
        """
        
        logger.info("Sending request to GROQ API")
        logger.debug(f"Prompt: {prompt}")
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            
            logger.info("Successfully received response from GROQ")
            
            # Process the response
            content = response.choices[0].message.content
            logger.info(f"Raw GROQ response: {content}")
            
            # Clean the response
            content = clean_response(content)
            logger.info(f"Cleaned response: {content}")
            
            # Split the response into lines and take only the first 10
            career_names = [line.strip() for line in content.split('\n') if line.strip()][:10]
            logger.info(f"Extracted career names: {career_names}")
            
            if not career_names:
                logger.error("No career names extracted from response")
                return jsonify({"error": "Failed to extract career names"}), 500
            
            # Create initial structured response
            initial_careers = [
                {
                    "id": i + 1,
                    "name": career.strip(),
                    "category": "Technology"
                }
                for i, career in enumerate(career_names)
            ]
            logger.info(f"Created initial career structure: {initial_careers}")
            
            # Match careers with JSON data
            matched_careers = match_career_data(initial_careers, career_data, salary_data)
            logger.info(f"Matched careers with JSON data: {matched_careers}")
            
            # Create final response
            response_data = {
                "careers": matched_careers
            }
            
            # Store the suggested careers for this session
            suggested_careers[request.remote_addr] = response_data["careers"]
            logger.info(f"Stored careers for session: {request.remote_addr}")
            
            logger.info("Returning structured suggestions to client")
            return jsonify(response_data)
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
            logger.error(traceback.format_exc())
            return jsonify({"error": f"GROQ API error: {str(groq_error)}"}), 500
        
    except Exception as e:
        logger.error(f"Error in get_suggestions: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        messages = data.get('messages', [])
        isCareerQuery = data.get('isCareerQuery', False)
        
        logger.info(f"Received chat request. Message: {message}")
        logger.info(f"Messages history: {messages}")
        
        if not message:
            logger.error("No message provided in chat request")
            return jsonify({"error": "No message provided"}), 400
            
        # Get the suggested careers for this session
        session_careers = suggested_careers.get(request.remote_addr, [])
        
        # Create prompt for GROQ
        if isCareerQuery:
            prompt = f"""
            You are having a friendly conversation with someone interested in a career. They've asked about {message}.
            
            Please provide a clear response covering the main aspects of this career. Use bullet points (•) to list key information.
            Make sure to cover these main aspects:
            • What the career involves
            • Key skills and qualifications needed
            • Career growth opportunities
            • Day-to-day responsibilities
            • Industry demand and future prospects
            
            Format your response like this:
            • [First point]
            • [Second point]
            • [Third point]
            ...
            
            Keep each point clear and concise. Don't use markdown formatting.
            Don't include any thinking process or internal reasoning.
            Don't use any <think> tags or explanations.
            Just provide the key points in a clear, bullet-point format.
            The number of points can vary based on what's important to cover.
            """
        else:
            # Check if the question is career-related
            career_keywords = ['career', 'job', 'work', 'profession', 'occupation', 'salary', 'skills', 'role', 'position', 'industry']
            is_about_careers = any(keyword in message.lower() for keyword in career_keywords)
            
            if is_about_careers:
                prompt = f"""
                You are having a friendly conversation with someone about careers. They've asked: {message}
                
                Please provide a clear response using bullet points (•) to list key information.
                Make sure to cover the main aspects of their question.
                
                Format your response like this:
                • [First point]
                • [Second point]
                • [Third point]
                ...
                
                Keep each point clear and concise. Don't use markdown formatting.
                Don't include any thinking process or internal reasoning.
                Don't use any <think> tags or explanations.
                Just provide the key points in a clear, bullet-point format.
                The number of points can vary based on what's important to cover.
                """
            else:
                prompt = f"""
                You are having a friendly conversation with someone. They've asked: {message}
                
                Please provide a helpful response using bullet points (•) to organize the information.
                Make sure to cover the main aspects of their question.
                
                Format your response like this:
                • [First point]
                • [Second point]
                • [Third point]
                ...
                
                Keep each point clear and concise. Don't use markdown formatting.
                Don't include any thinking process or internal reasoning.
                Don't use any <think> tags or explanations.
                Just provide the key points in a clear, bullet-point format.
                The number of points can vary based on what's important to cover.
                """
        
        logger.info("Sending chat request to GROQ API")
        logger.debug(f"Prompt: {prompt}")
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            
            logger.info("Successfully received response from GROQ")
            
            # Process the response
            content = response.choices[0].message.content
            logger.info(f"Raw GROQ response: {content}")
            
            # Clean the response
            content = clean_response(content)
            logger.info(f"Cleaned response: {content}")
            
            # Create response data
            response_data = {
                "response": content,
                "careers": session_careers
            }
            
            logger.info("Returning chat response to client")
            return jsonify(response_data)
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
            logger.error(traceback.format_exc())
            return jsonify({"error": f"GROQ API error: {str(groq_error)}"}), 500
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
