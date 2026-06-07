from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Add this line so the metadata registry detects the Case model

import app.models 

from app.routers import cases, documents, document_actions

# Ensure the physical upload directory exists on server startup
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Automatic SQLite table schema generation for MVP scope
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization warning: {e}")

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(document_actions.router)

# Simplified Phase 1 health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME
    }