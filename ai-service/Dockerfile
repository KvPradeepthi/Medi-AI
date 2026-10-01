FROM python:3.12-slim

WORKDIR /app

# Install system build dependencies needed for chromadb
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY main.py ./
COPY prompts/ ./prompts/
COPY schemas/ ./schemas/
COPY utils/ ./utils/

# Expose port
EXPOSE 8000

ENV CHROMA_DB_PATH=/app/chroma_db

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
