
from fastapi import FastAPI

app = FastAPI(
    title="GatePass API",
    description="QR-Based Event Check-In System",
    version="1.0.0",
)


@app.get("/")
def home():
    return {"message": "Welcome to GatePass API"}


@app.get("/health")
def health():
    return {"status": "ok"}
