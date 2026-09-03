from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ReportIndexRequest(BaseModel):
    patient_id: str
    report_id: str
    text: str
    report_type: str
    date: str

class ChatMessage(BaseModel):
    role: str # "user" or "model" / "assistant"
    content: str

class ChatRequest(BaseModel):
    patient_id: str
    query: str
    mode: str = "GENERAL"
    history: List[ChatMessage] = []

class DietRequest(BaseModel):
    patient_id: str
    age: int
    gender: str
    weight: float
    height: float
    medical_history: List[str] = []
    allergies: List[str] = []

class SymptomRequest(BaseModel):
    query: str
    age: int
    gender: str

class HealthSummaryRequest(BaseModel):
    age: int
    bmi: float
    compliance_rate: int
    red_count: int
    yellow_count: int
    latest_vitals: Dict[str, Any]
