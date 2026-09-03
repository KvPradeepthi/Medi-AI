# MediAI – Enterprise-Grade AI-Powered Health Assistant

MediAI is a production-ready, role-based AI healthcare SaaS platform designed for Patients, Doctors, and Administrators. It integrates OCR report parsing, RAG-based query retrieval over health histories, real-time consultation via Socket.io, and a Fitbit-style dashboard metrics monitoring system.

---

## 🚀 Key Features

### 👤 1. Patient Portal
- **Fitbit-style Health Dashboard**: Metrics breakdown (BMI, heart rate, blood pressure, sugar logs, water intake) and daily medicine compliance score.
- **RAG-based MediAI Assistant**: Interactive chatbot capable of answering questions based on historical medical reports loaded in ChromaDB.
- **Report Analysis & OCR**: Instant categorization of medical reports (CBC, Blood, X-Ray) with green/yellow/red severity flags and dietary/wellness advice.
- **Appointment Scheduling**: Quick booking interface with doctor calendar views.
- **Medicine Compliance**: Daily checkbox schedule tracking taken, skipped, or missed doses to calculate a real-time compliance rate.
- **SOS Button**: Generates immediate geolocation alerts, emergency contact dispatches, and displays local hospitals.

### 🩺 2. Doctor Portal
- **Patient Timeline**: Comprehensive graphical chronological view of patient history, uploaded files, prescriptions, and follow-ups.
- **Prescription Pad**: Direct clinical prescription tool updating the patient dashboard in real-time.
- **Real-Time Patient Chat**: Direct messaging interface with report attachments and support for voice memos via Socket.io.

### 🔑 3. Administrator Console
- **System Health Monitor**: Live metrics checking Database, Socket.io, Backend services, and API ping rates.
- **Platform Analytics**: Analytics tracking user growth, doctor registration reviews, report upload trends, and most common diseases.

---

## 🛠️ Architecture & Tech Stack

```
                   ┌──────────────────────────────┐
                   │    React 19 + TypeScript     │
                   │       Tailwind CSS v4.0      │
                   └──────────────┬───────────────┘
                                  │
                                  ▼ REST / WebSockets (Socket.io)
                   ┌──────────────────────────────┐
                   │  Node.js + Express + TS      │
                   │ (Service-Repository-DTO-Log) │
                   └──────────────┬───────────────┘
                                  │
                                  ▼ HTTP REST
                   ┌──────────────────────────────┐
                   │ Python FastAPI AI Service    │
                   │       ChromaDB Vector DB     │
                   └──────────────┬───────────────┘
            ┌─────────────────────┼─────────────────────┐
            ▼                     ▼                     ▼
    Google Gemini API          ChromaDB           MongoDB Atlas
(OCR, RAG, & Analysis)       (Vector Indexes)      (Transaction Logs)
```

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4.0, Chart.js, Socket.io-client, Axios.
- **Backend**: Express.js, TypeScript, Mongoose, Winston (logging), Swagger UI (interactive docs), Socket.io.
- **AI Service**: FastAPI, Python 3.12, ChromaDB (Vector DB), Google Generative AI (Gemini 2.5), Pydantic schemas.
- **Deployment & Infra**: Docker, Docker Compose, Cloudinary (Media storage).

---

## ⚙️ Quick Start Installation

### Prerequisites
- Node.js (v20+)
- Python (v3.12+)
- MongoDB Atlas account (or running local instance)
- Google Gemini API Key

### Configuration
1. Clone the repository and navigate to the project root:
   ```bash
   cd MediAI
   ```
2. Copy the `.env.example` file and fill in your keys:
   ```bash
   cp .env.example .env
   ```

### Running with Docker (Recommended)
Launch the entire platform including the vector database and frontend in one command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api-docs`
- AI Service: `http://localhost:8000`

---

## 📂 Project Structure

```
MediAI/
├── shared/                 # Shared TypeScript interfaces & schemas
├── docs/                   # Diagrams & Presentations
├── frontend/               # React client
├── backend/                # Express server
└── ai-service/             # FastAPI + ChromaDB service
```
For deep-dive descriptions, see the [docs/README.md](docs/README.md).
