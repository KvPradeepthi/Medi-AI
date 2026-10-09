import os
import json
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pypdf import PdfReader
import io

from schemas.models import (
    ReportIndexRequest, ChatRequest, DietRequest, SymptomRequest, HealthSummaryRequest
)
from prompts.v1.report_prompt import REPORT_SYSTEM_PROMPT, get_report_prompt
from prompts.v1.diet_prompt import DIET_SYSTEM_PROMPT, get_diet_prompt
from prompts.v1.chat_prompt import CHAT_SYSTEM_PROMPT, get_chat_prompt
from prompts.v1.symptom_prompt import SYMPTOM_SYSTEM_PROMPT, get_symptom_prompt
from utils.db import index_report_text, query_patient_reports

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

# Configure Google Generative AI (Gemini) SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("[WARNING] GEMINI_API_KEY is not defined. AI endpoints will fall back to simulated mock structures.")

# Model cascade list: try modern Gemini models in order
PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
FALLBACK_MODELS = [
    PRIMARY_MODEL,
    "gemini-3.8-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash"
]
# Deduplicate while preserving order
AVAILABLE_MODELS = list(dict.fromkeys(FALLBACK_MODELS))

def generate_with_gemini(contents, system_instruction=None, generation_config=None):
    """
    Execute Gemini model generation with graceful cascading fallback across models.
    """
    last_error = None
    for model_name in AVAILABLE_MODELS:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
            res = model.generate_content(contents, generation_config=generation_config)
            return res
        except Exception as e:
            last_error = e
            print(f"[GEMINI FALLBACK] Model '{model_name}' failed: {e}. Trying next candidate...")
            continue
    raise last_error

app = FastAPI(title="MediAI AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "api_configured": bool(api_key),
        "service": "fastapi-ai"
    }

# 1. OCR + PDF text parsing and structured Gemini Analysis
@app.post("/api/v1/ai/analyze-report")
async def analyze_report(
    file: UploadFile = File(...),
    report_type: str = Form("Other")
):
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI analysis service is unavailable because GEMINI_API_KEY is not configured."
        )

    try:
        file_bytes = await file.read()
        extracted_text = ""
        
        # Determine file type
        content_type = file.content_type or ""
        
        # If PDF, parse text first
        if "pdf" in content_type:
            try:
                pdf_file = io.BytesIO(file_bytes)
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            except Exception as e:
                print(f"PDF local extraction failed: {e}. Falling back to multimodal Gemini.")
        
        # Prepare contents payload for Gemini (supports multimodal analysis)
        contents = []
        
        # If text is extracted, pass it, otherwise pass image/file bytes directly to model for OCR!
        if extracted_text.strip():
            contents.append(get_report_prompt(report_type, extracted_text))
        else:
            # Prepare image upload attachment payload
            image_payload = {
                "mime_type": content_type if content_type else "image/png",
                "data": file_bytes
            }
            contents.append(image_payload)
            contents.append(get_report_prompt(report_type, "Run OCR, extract findings, and compile clinical analysis."))

        # Call Gemini requesting structured JSON
        response = generate_with_gemini(
            contents,
            system_instruction=REPORT_SYSTEM_PROMPT,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        analysis_json = json.loads(response.text)
        
        # In case local PDF extraction was empty, save model findings as extracted text
        if not extracted_text.strip():
            extracted_text = analysis_json.get("summary", "Image-based diagnostic findings analyzed.")
            
        return {
            "extracted_text": extracted_text,
            "analysis": analysis_json
        }
        
    except Exception as e:
        print(f"Gemini analysis exception: {e}")
        raise HTTPException(status_code=502, detail=f"AI model analysis failed: {str(e)}")

# 2. ChromaDB RAG index updates
@app.post("/api/v1/ai/index-report")
def index_report(req: ReportIndexRequest):
    try:
        index_report_text(
            patient_id=req.patient_id,
            report_id=req.report_id,
            text=req.text,
            report_type=req.report_type,
            date=req.date
        )
        return {"message": f"Successfully indexed report {req.report_id} in ChromaDB."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. MediAI Assistant RAG conversational engine
@app.post("/api/v1/ai/chat")
def chat_assistant(req: ChatRequest):
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI conversational assistant is unavailable because GEMINI_API_KEY is not configured."
        )
        
    try:
        # Retrieve context matching query from ChromaDB
        context_chunks = query_patient_reports(req.patient_id, req.query)
        
        # Format history payload into model-ready chat format
        history_list = [{"role": m.role, "content": m.content} for m in req.history]
        
        prompt = get_chat_prompt(req.mode, req.query, context_chunks, history_list)
        
        response = generate_with_gemini(
            prompt,
            system_instruction=CHAT_SYSTEM_PROMPT,
            generation_config=genai.types.GenerationConfig(
                temperature=0.4
            )
        )
        
        return {"response": response.text}
        
    except Exception as e:
        print(f"Chat assistant error: {e}")
        raise HTTPException(status_code=502, detail=f"AI model error: {str(e)}")

# 4. Diet generator
@app.post("/api/v1/ai/diet")
def generate_diet(req: DietRequest):
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI personalized diet planning is unavailable because GEMINI_API_KEY is not configured."
        )
        
    try:
        bmi = round(req.weight / ((req.height / 100) ** 2), 1)
        prompt = get_diet_prompt(
            age=req.age,
            gender=req.gender,
            weight=req.weight,
            height=req.height,
            bmi=bmi,
            medical_history=req.medical_history,
            allergies=req.allergies
        )
        
        response = generate_with_gemini(
            prompt,
            system_instruction=DIET_SYSTEM_PROMPT,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI diet generation failed: {str(e)}")

# 5. Symptom Checker
@app.post("/api/v1/ai/symptoms")
def check_symptoms(req: SymptomRequest):
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI clinical symptom checker is unavailable because GEMINI_API_KEY is not configured."
        )
        
    try:
        prompt = get_symptom_prompt(req.query, req.age, req.gender)
        response = generate_with_gemini(
            prompt,
            system_instruction=SYMPTOM_SYSTEM_PROMPT,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI symptom analysis failed: {str(e)}")

# 6. AI Fitbit Health score summary comment generator
@app.post("/api/v1/ai/health-summary")
def generate_health_summary(req: HealthSummaryRequest):
    if not api_key:
        return {
            "summary": f"Patient records show a {req.compliance_rate}% medication compliance rate and BMI of {req.bmi:.1f}. Routine medical review recommended."
        }
        
    try:
        prompt = (
            f"Generate a friendly Fitbit-style daily health summary comment based on these patient stats:\n"
            f"- Age: {req.age}\n"
            f"- BMI: {req.bmi}\n"
            f"- Medicine logs compliance rate: {req.compliance_rate}%\n"
            f"- Blood reports warning alerts count: {req.red_count} red severity, {req.yellow_count} yellow severity\n"
            f"- Recent metrics logs: {req.latest_vitals}\n\n"
            f"Provide direct clinical summary suggestions in 2-3 sentences. Do not use placeholders."
        )
        
        response = generate_with_gemini(prompt)
        
        return {"summary": response.text.strip()}
    except Exception as e:
        return {
            "summary": f"Metrics compilation complete. Compliance score: {req.compliance_rate}%. Regular physician review advised."
        }
