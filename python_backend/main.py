from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import traceback
import groq
import re

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

def clean_response(text):
    # Only remove <think> tags and their content
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    return text.strip()

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
        Do not include any <think> tags.
        """
        
        logger.info("Sending request to GROQ API")
        logger.debug(f"Prompt: {prompt}")
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=500
            )
            
            logger.info("Successfully received response from GROQ")
            
            # Process the response
            content = response.choices[0].message.content
            
            # Clean the response
            content = clean_response(content)
            
            # Split the response into lines and take only the first 10
            career_names = [line.strip() for line in content.split('\n') if line.strip()][:10]
            
            # Create structured response
            response_data = {
                "careers": [
                    {
                        "id": i + 1,
                        "name": career.strip(),
                        "category": "Technology"  # This is for internal use only
                    }
                    for i, career in enumerate(career_names)
                ]
            }
            
            # Store the suggested careers for this session
            suggested_careers[request.remote_addr] = response_data["careers"]
            
            logger.info("Returning structured suggestions to client")
            return jsonify(response_data)
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
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
        
        if not message:
            return jsonify({"error": "No message provided"}), 400
            
        # Get the suggested careers for this session
        session_careers = suggested_careers.get(request.remote_addr, [])
        
        # Create context from the conversation history
        context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        # Create prompt for GROQ
        prompt = f"""
        You are a friendly career advisor having a casual conversation. The user has previously selected some skills and interests, and you suggested these careers:
        {', '.join([f"{career['id']}. {career['name']}" for career in session_careers])}
        
        Here is the conversation history:
        {context}
        
        User's latest question: {message}
        
        Please provide a helpful, conversational response about the suggested careers, focusing on the specific career(s) the user is asking about.
        Write in a friendly, chat-like tone as if you're having a conversation.
        Do not use any markdown formatting, bullet points, or numbered lists.
        Do not include any <think> tags.
        If the user's question is not related to the suggested careers, gently guide them back to discussing the careers.
        """
        
        try:
            # Get response from GROQ
            response = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Process the response
            content = response.choices[0].message.content
            
            # Clean the response
            content = clean_response(content)
            
            return jsonify({"response": content})
            
        except Exception as groq_error:
            logger.error(f"Error calling GROQ API: {str(groq_error)}")
            return jsonify({"error": f"GROQ API error: {str(groq_error)}"}), 500
            
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)