# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# (Added build-essential/gcc in case your specific ML libraries need it)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create the 'data' directory and set permissions
# (Important so the app can write PDF files inside the container)
RUN mkdir -p data && chmod 777 data

# Expose port 7860 (Required by Hugging Face Spaces)
EXPOSE 7860

# Run the application
# We override the port to 7860 here to match Hugging Face requirements
CMD ["uvicorn", "server.api.main:app", "--host", "0.0.0.0", "--port", "7860"]