import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables from parent root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env"))

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_embedding(text: str) -> list:
    """
    Generate vector embeddings using Gemini's text-embedding model
    """
    if not api_key:
        # Fallback dummy embedding if key is missing during container builds
        return [0.1] * 768
        
    try:
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return response['embedding']
    except Exception as e:
        print(f"Embedding generation error: {e}")
        # Return mock vector
        return [0.0] * 768
