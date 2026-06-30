FROM python:3.10-slim

WORKDIR /app

# Install necessary libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
