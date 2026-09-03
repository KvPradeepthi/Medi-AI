import os
import json
import math
from utils.embeddings import get_embedding

# Try to import ChromaDB, and set up a fallback if binary dependencies are missing (e.g. Windows C++ compilers)
CHROMA_AVAILABLE = False
collection = None

try:
    import chromadb
    CHROMA_DB_PATH = os.environ.get("CHROMA_DB_PATH", "./chroma_db")
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = chroma_client.get_or_create_collection(
        name="patient_reports",
        metadata={"hnsw:space": "cosine"}
    )
    CHROMA_AVAILABLE = True
    print("✔ ChromaDB vector client initialized successfully.")
except ImportError:
    print("[WARNING] ChromaDB package is not installed or failed to load. Falling back to pure Python JSON-based vector storage.")

# Fallback File Path
FALLBACK_FILE = "./chroma_data_fallback.json"

def load_fallback_db() -> list:
    if not os.path.exists(FALLBACK_FILE):
        return []
    try:
        with open(FALLBACK_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_fallback_db(data: list):
    try:
        with open(FALLBACK_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Failed to save fallback database: {e}")

def cosine_similarity(v1: list, v2: list) -> float:
    """
    Compute cosine similarity between two vectors
    """
    if len(v1) != len(v2) or len(v1) == 0:
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    
    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0
    return dot_product / (mag1 * mag2)

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> list:
    """
    Split text into chunks with overlap for embedding indexation
    """
    words = text.split()
    chunks = []
    
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += (chunk_size - chunk_overlap)
        if i >= len(words) - chunk_overlap:
            break
            
    return chunks

def index_report_text(patient_id: str, report_id: str, text: str, report_type: str, date: str):
    """
    Chunk report, generate embeddings, and store in database
    """
    chunks = chunk_text(text)
    
    if CHROMA_AVAILABLE and collection is not None:
        ids = []
        embeddings = []
        metadatas = []
        documents = []
        
        for index, chunk in enumerate(chunks):
            chunk_id = f"{report_id}_{index}"
            embedding = get_embedding(chunk)
            
            ids.append(chunk_id)
            embeddings.append(embedding)
            documents.append(chunk)
            metadatas.append({
                "patient_id": patient_id,
                "report_id": report_id,
                "report_type": report_type,
                "date": date
            })
            
        if ids:
            collection.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=documents
            )
        print(f"Indexed {len(ids)} text chunks in ChromaDB.")
    else:
        # Save to local fallback JSON database
        fallback_db = load_fallback_db()
        
        for index, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            fallback_db.append({
                "id": f"{report_id}_{index}",
                "patient_id": patient_id,
                "report_id": report_id,
                "text": chunk,
                "embedding": embedding,
                "metadata": {
                    "report_type": report_type,
                    "date": date
                }
            })
        save_fallback_db(fallback_db)
        print(f"Indexed {len(chunks)} text chunks in fallback JSON database.")

def query_patient_reports(patient_id: str, query: str, top_k: int = 4) -> list:
    """
    Search reports related to patient's query using vector similarity
    """
    if CHROMA_AVAILABLE and collection is not None:
        query_vector = get_embedding(query)
        try:
            results = collection.query(
                query_embeddings=[query_vector],
                n_results=top_k,
                where={"patient_id": patient_id}
            )
            if results and results["documents"]:
                return results["documents"][0]
        except Exception as e:
            print(f"ChromaDB query failed: {e}")
        return []
    else:
        # Simple similarity check over fallback JSON records
        fallback_db = load_fallback_db()
        patient_records = [r for r in fallback_db if r["patient_id"] == patient_id]
        
        if not patient_records:
            return []
            
        query_vector = get_embedding(query)
        
        # Calculate similarities
        scored_records = []
        for r in patient_records:
            sim = cosine_similarity(query_vector, r["embedding"])
            scored_records.append((sim, r["text"]))
            
        # Sort and select top_k matches
        scored_records.sort(key=lambda x: x[0], reverse=True)
        return [text for score, text in scored_records[:top_k]]
