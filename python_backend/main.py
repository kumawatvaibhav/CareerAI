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
    """Match career names with data from JSON files and handle unmatched careers"""
    matched_careers = []
    unmatched_careers = []
    logger.info(f"Starting to match {len(career_names)} careers with JSON data")
    
    # First pass: Try to match with JSON data
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

        # Check if all fields are filled
        if all([matched_career["description"], matched_career["salary_range"], 
                matched_career["roles_offered"], matched_career["required_skills"]]):
            matched_careers.append(matched_career)
        else:
            unmatched_careers.append(career)

    # Second pass: Get data for unmatched careers from API
    if unmatched_careers:
        logger.info(f"Getting data for {len(unmatched_careers)} unmatched careers from API")
        unmatched_names = [career["name"] for career in unmatched_careers]
        
        # Create a more structured prompt for the API
        prompt = f"""
        You are a career information expert. Please provide detailed information about these careers: {', '.join(unmatched_names)}
        
        For each career, provide the following information in a valid JSON array format:
        [
            {{
                "name": "Career Name",
                "description": "A detailed description of what this career involves",
                "salary_range": {{
                    "entry_level": "$X - $Y",
                    "mid_level": "$X - $Y",
                    "senior_level": "$X - $Y"
                }},
                "roles_offered": ["Role 1", "Role 2", "Role 3", "Role 4"],
                "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"]
            }}
        ]
        
        Important rules:
        1. Return ONLY the JSON array, nothing else
        2. Ensure the JSON is valid and properly formatted
        3. Use realistic salary ranges based on current market rates
        4. Include 4 relevant roles and 4 key skills for each career
        5. Make descriptions detailed but concise
        6. Keep all career names exactly as provided
        7. Do not include any additional text or explanations
        """
        
        try:
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            
            # Clean the response to ensure it's valid JSON
            content = response.choices[0].message.content.strip()
            
            # Remove any markdown code block markers
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Remove any <think> tags and their content
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
            content = content.strip()
            
            try:
                api_data = json.loads(content)
                logger.info(f"Successfully parsed API response for {len(api_data)} careers")
                
                # Add API-provided careers to matched_careers
                for career_data in api_data:
                    # Find the original career to get its ID and category
                    original_career = next((c for c in unmatched_careers if c["name"].lower() == career_data["name"].lower()), None)
                    
                    if original_career:
                        matched_careers.append({
                            "id": original_career["id"],
                            "name": career_data["name"],
                            "category": original_career["category"],
                            "description": career_data["description"],
                            "salary_range": career_data["salary_range"],
                            "roles_offered": career_data["roles_offered"],
                            "required_skills": career_data["required_skills"]
                        })
                    else:
                        # If for some reason we can't find the original career, create a new entry
                        matched_careers.append({
                            "id": len(matched_careers) + 1,
                            "name": career_data["name"],
                            "category": "Technology",
                            "description": career_data["description"],
                            "salary_range": career_data["salary_range"],
                            "roles_offered": career_data["roles_offered"],
                            "required_skills": career_data["required_skills"]
                        })
                        
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse API response as JSON: {str(e)}")
                logger.error(f"Raw API response: {content}")
                
        except Exception as e:
            logger.error(f"Error getting API data for unmatched careers: {str(e)}")
    
    # Sort the careers by their original IDs to maintain order
    matched_careers.sort(key=lambda x: x["id"])
    
    # Ensure we have exactly 10 careers
    if len(matched_careers) > 10:
        matched_careers = matched_careers[:10]
    elif len(matched_careers) < 10:
        logger.warning(f"Only found {len(matched_careers)} careers, expected 10")
    
    logger.info(f"Completed matching all careers. Found matches for {len(matched_careers)} careers")
    return matched_careers

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    try:
        data = request.get_json()
        logger.info(f"Input selections: {data}")
        
        if not data:
            logger.error("No data provided in request")
            return jsonify({"error": "No data provided"}), 400
            
        # Extract all selected items into a single list
        all_selections = []
        for category, items in data.items():
            all_selections.extend(items)
            
        # Load JSON data
        career_data, salary_data = load_json_data()
        
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
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            
            # Process the response
            content = response.choices[0].message.content
            content = clean_response(content)
            career_names = [line.strip() for line in content.split('\n') if line.strip()][:10]
            logger.info(f"AI suggested careers: {career_names}")
            
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
            
            # Match careers with JSON data
            matched_careers = match_career_data(initial_careers, career_data, salary_data)
            logger.info(f"Careers found in JSON data: {[c['name'] for c in matched_careers if c['description']]}")
            logger.info(f"Careers generated by AI: {[c['name'] for c in matched_careers if not c['description']]}")
            
            # Create final response
            response_data = {
                "careers": matched_careers
            }
            
            # Store the suggested careers for this session
            suggested_careers[request.remote_addr] = response_data["careers"]
            
            logger.info("Returning careers to frontend for mapping")
            return jsonify(response_data)
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
            return jsonify({"error": f"GROQ API error: {str(groq_error)}"}), 500
        
    except Exception as e:
        logger.error(f"Error in get_suggestions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        messages = data.get('messages', [])
        isCareerQuery = data.get('isCareerQuery', False)
        
        logger.info(f"Follow-up question: {message}")
        
        if not message:
            logger.error("No message provided in chat request")
            return jsonify({"error": "No message provided"}), 400
            
        # Get the suggested careers for this session
        session_careers = suggested_careers.get(request.remote_addr, [])
        
        # Create prompt for GROQ
        if isCareerQuery:
            prompt = f"""
            You are having a friendly conversation with someone interested in a career. They've asked about {message}.
            
            Please provide a detailed, engaging response that feels natural and conversational while maintaining clear organization.
            Use a visually appealing format with clear section separation and bullet points.
            
            Format your response EXACTLY like this:
            
            OVERVIEW
            • [Engaging description of what the career involves]
            • [Interesting aspects or unique features]
            
            ──────────────────────────────
            
            KEY SKILLS AND QUALIFICATIONS
            • [Core skills with context]
            • [Technical abilities with real-world applications]
            
            ──────────────────────────────
            
            CAREER GROWTH OPPORTUNITIES
            • [Exciting career paths]
            • [Potential specializations and advancements]
            
            ──────────────────────────────
            
            DAY-TO-DAY RESPONSIBILITIES
            • [Typical tasks with context]
            • [Interesting challenges and rewards]
            
            ──────────────────────────────
            
            INDUSTRY DEMAND AND FUTURE PROSPECTS
            • [Current trends and opportunities]
            • [Future developments and possibilities]
            
            Important rules:
            1. Use • for bullet points instead of -
            2. Add a separator line (──────────────────────────────) between sections
            3. Use CAPITAL LETTERS for section headings
            4. Add extra spacing between sections
            5. Make each point engaging and natural
            6. Avoid repetitive language
            7. Include interesting details and context
            8. Keep the tone conversational but professional
            9. Do NOT use any markdown, asterisks, or bold text
            10. Do NOT use any special characters or formatting
            11. Do NOT include any thinking process or internal reasoning
            12. Do NOT use any <think> tags or explanations
            """
        else:
            # Check if the question is career-related
            career_keywords = ['career', 'job', 'work', 'profession', 'occupation', 'salary', 'skills', 'role', 'position', 'industry']
            is_about_careers = any(keyword in message.lower() for keyword in career_keywords)
            
            # Check if it's a greeting or unrelated question
            greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
            is_greeting = any(greeting in message.lower() for greeting in greetings)
            
            if is_about_careers:
                prompt = f"""
                You are having a friendly conversation with someone about careers. They've asked: {message}
                
                Please provide a detailed, engaging response that feels natural and conversational while maintaining clear organization.
                Use a visually appealing format with clear section separation and bullet points.
                
                Format your response EXACTLY like this:
                
                MAIN POINTS
                • [Key insights with context]
                • [Important considerations]
                
                ──────────────────────────────
                
                DETAILED EXPLANATION
                • [In-depth information with examples]
                • [Practical applications]
                
                ──────────────────────────────
                
                PRACTICAL IMPLICATIONS
                • [Real-world impact]
                • [Actionable advice]
                
                Important rules:
                1. Use • for bullet points instead of -
                2. Add a separator line (──────────────────────────────) between sections
                3. Use CAPITAL LETTERS for section headings
                4. Add extra spacing between sections
                5. Make each point engaging and natural
                6. Avoid repetitive language
                7. Include interesting details and context
                8. Keep the tone conversational but professional
                9. Do NOT use any markdown, asterisks, or bold text
                10. Do NOT use any special characters or formatting
                11. Do NOT include any thinking process or internal reasoning
                12. Do NOT use any <think> tags or explanations
                """
            elif is_greeting:
                prompt = f"""
                You are having a friendly conversation with someone. They've greeted you with: {message}
                
                Please provide a warm, natural response to their greeting.
                Keep it friendly and conversational.
                
                Format your response EXACTLY like this:
                [A friendly, natural response to their greeting]
                
                Important rules:
                1. Keep the response short and friendly
                2. Use a natural, conversational tone
                3. Do NOT use any formatting or bullet points
                4. Do NOT include any section headings
                5. Do NOT use any markdown or special characters
                6. Do NOT include any thinking process or internal reasoning
                7. Do NOT use any <think> tags or explanations
                """
            else:
                prompt = f"""
                You are having a friendly conversation with someone. They've asked: {message}
                
                Please provide a helpful, natural response to their question.
                Keep it conversational and easy to understand.
                
                Format your response EXACTLY like this:
                [A natural, conversational response to their question]
                
                Important rules:
                1. Keep the response clear and concise
                2. Use a natural, conversational tone
                3. Do NOT use any formatting or bullet points
                4. Do NOT include any section headings
                5. Do NOT use any markdown or special characters
                6. Do NOT include any thinking process or internal reasoning
                7. Do NOT use any <think> tags or explanations
                """
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=4096
            )
            
            # Process the response
            content = response.choices[0].message.content
            
            # Clean the response to remove any markdown formatting
            content = re.sub(r'\*\*.*?\*\*', '', content)  # Remove bold text
            content = re.sub(r'__.*?__', '', content)  # Remove underlined text
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)  # Remove think tags
            content = re.sub(r'^\s*[-*]\s*', '• ', content, flags=re.MULTILINE)  # Standardize bullet points
            content = re.sub(r'\n\s*\n', '\n', content)  # Remove extra blank lines
            content = content.strip()
            
            logger.info(f"AI response: {content}")
            
            # Create response data
            response_data = {
                "response": content,
                "careers": session_careers
            }
            
            return jsonify(response_data)
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
            return jsonify({"error": f"GROQ API error: {str(groq_error)}"}), 500
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
