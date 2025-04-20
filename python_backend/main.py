from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
import groq
import logging

# Enable logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TEMP: Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GROQ client
try:
    client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
    logging.debug("✅ GROQ client initialized.")
except Exception as e:
    logging.error(f"❌ Error initializing GROQ client: {e}")
    raise

# Models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

# Handle CORS preflight
@app.options("/api/chat")
async def preflight_handler(request: Request):
    logging.debug("🛰️ Received OPTIONS request for /api/chat (CORS preflight)")
    return JSONResponse(content={}, status_code=200)

# Main Chat Endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        logging.debug("📨 Incoming /api/chat POST request")
        logging.debug(f"Messages received: {request.messages}")

        groq_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        logging.debug("🧠 Sending to GROQ API...")
        response = client.chat.completions.create(
            model="qwen-qwq-32b",
            messages=groq_messages,
            temperature=0.7,
            max_tokens=4096,
        )

        assistant_response = response.choices[0].message.content
        
        # Remove <think> section using regular expression
        import re
        assistant_response = re.sub(r'<think>.*?</think>', '', assistant_response, flags=re.DOTALL).strip()
        
        logging.debug(f"🤖 GROQ Response: {assistant_response}")

        return {
            "role": "assistant",
            "content": assistant_response
        }
    except Exception as e:
        logging.error(f"🔥 Error in /api/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Launch server
if __name__ == "__main__":
    import uvicorn
    logging.debug("🚀 Starting FastAPI server with Uvicorn...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
