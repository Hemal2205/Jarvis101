from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
import os
from llama_cpp import Llama
from typing import Dict
import requests

router = APIRouter()

# Model directories
CODE_GEN_DIR = os.path.join(os.path.dirname(__file__), '../models/code-generation')
TEXT_GEN_DIR = os.path.join(os.path.dirname(__file__), '../models/text-generation')
EMBEDDINGS_DIR = os.path.join(os.path.dirname(__file__), '../models/embeddings')

# List all GGUF models in a directory
def list_gguf_models(directory):
    models = []
    for fname in os.listdir(directory):
        if fname.endswith('.gguf'):
            models.append({
                'name': fname,
                'path': os.path.abspath(os.path.join(directory, fname))
            })
    return models

@router.get('/api/llm/models')
def get_all_models():
    local_models = (
        list_gguf_models(CODE_GEN_DIR) +
        list_gguf_models(TEXT_GEN_DIR) +
        list_gguf_models(EMBEDDINGS_DIR)
    )
    online_models = [
        {'name': 'OpenAI GPT-4', 'id': 'gpt-4'},
        {'name': 'Google Gemini 1.5', 'id': 'gemini-1.5'},
        {'name': 'Google Gemini', 'id': 'gemini'}
    ]
    return JSONResponse({
        'local_models': local_models,
        'online_models': online_models
    })

# Cache loaded models by path
llm_models: Dict[str, Llama] = {}

# Improved prompt template for better factual answers
PROMPT_TEMPLATE = """
[INST] <<SYS>>\nYou are JARVIS, an advanced AI assistant. Answer all questions factually, concisely, and with the most up-to-date information available as of 2024. If you do not know the answer, say so honestly.\n<</SYS>>\n{user_message} [/INST]
"""

def run_local_llm(message: str, model_path: str) -> str:
    if not os.path.exists(model_path):
        return f"[LLM] Model file not found: {model_path}"
    if model_path not in llm_models:
        llm_models[model_path] = Llama(model_path=model_path, n_ctx=2048, n_threads=8)
    llm = llm_models[model_path]
    prompt = PROMPT_TEMPLATE.format(user_message=message)
    output = llm(prompt, max_tokens=512, stop=["</s>", "[INST]"], echo=False)
    if 'choices' in output and len(output['choices']) > 0:
        return output['choices'][0]['text'].strip()
    return "[LLM] No response generated."

@router.post("/api/llm/chat")
async def llm_chat(request: dict):
    """Chat with selected LLM model"""
    message = request.get("message")
    model = request.get("model")
    api_key = request.get("api_key")
    
    if not message:
        return JSONResponse({
            "success": False,
            "reply": "Message is required",
            "error": "Missing message"
        }, status_code=400)
    
    if not model:
        return JSONResponse({
            "success": False,
            "reply": "Model selection is required",
            "error": "Missing model"
        }, status_code=400)
    try:
        # OpenAI support
        if model in ['gpt-4', 'gpt-3.5-turbo', 'openai']:
            if not api_key:
                return JSONResponse({"success": False, "reply": "OpenAI API key required.", "error": "API key missing"})
            try:
                import openai
                client = openai.OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-4" if model in ['gpt-4', 'openai'] else "gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are JARVIS, an advanced AI assistant. Be helpful, accurate, and concise."},
                        {"role": "user", "content": message}
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )
                reply = response.choices[0].message.content
                return JSONResponse({"success": True, "reply": reply, "model": model})
            except Exception as e:
                return JSONResponse({"success": False, "reply": f"OpenAI error: {str(e)}", "error": str(e)})
        
        # Gemini support
        elif model in ['gemini', 'gemini-1.5', 'gemini-pro']:
            if not api_key:
                return JSONResponse({"success": False, "reply": "Gemini API key required.", "error": "API key missing"})
            # Gemini API endpoint (v1)
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + api_key
            payload = {
                "contents": [{"parts": [{"text": message}]}]
            }
            try:
                response = requests.post(url, json=payload, timeout=30)
                data = response.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return JSONResponse({"success": True, "reply": reply, "model": model})
                else:
                    return JSONResponse({"success": False, "reply": "No response from Gemini.", "error": "No response"})
            except Exception as e:
                return JSONResponse({"success": False, "reply": f"Gemini error: {str(e)}", "error": str(e)})
        
        # Local model support
        else:
            # Try to find local model
            model_path = None
            for d in [CODE_GEN_DIR, TEXT_GEN_DIR, EMBEDDINGS_DIR]:
                candidate = os.path.join(d, model)
                if os.path.exists(candidate):
                    model_path = candidate
                    break
            
            if not model_path:
                # Try with .gguf extension
                for d in [CODE_GEN_DIR, TEXT_GEN_DIR, EMBEDDINGS_DIR]:
                    candidate = os.path.join(d, model + '.gguf')
                    if os.path.exists(candidate):
                        model_path = candidate
                        break
            
            if not model_path:
                return JSONResponse({"success": False, "reply": f"Model '{model}' not found.", "error": "Model not found"})
            
            reply = run_local_llm(message, model_path)
            return JSONResponse({"success": True, "reply": reply, "model": model})
    
    except Exception as e:
        return JSONResponse({"success": False, "reply": f"Error processing request: {str(e)}", "error": str(e)})
