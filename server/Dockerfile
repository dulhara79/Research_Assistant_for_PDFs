# server/Dockerfile

# Use Python 3.10
FROM python:3.10-slim

# Prevent Python from writing .pyc files and buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required for PDF processing libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    libmagic-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (to cache dependencies)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create a directory for file uploads
RUN mkdir -p /app/data

# Expose port 8000
EXPOSE 8000

# Default command (will be overridden in docker-compose for the worker)
CMD ["uvicorn", "server.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]