import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.config import settings

# Route prefix securely binds documents to a parent case
router = APIRouter(prefix="/api/cases/{case_id}/documents", tags=["Documents"])

@router.post("/", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(case_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Validate Case State
    db_case = db.query(models.Case).filter(
        models.Case.id == case_id, 
        models.Case.is_archived == False
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or is archived")

    # 2. Validate MIME Type Security
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File type '{file.content_type}' is not permitted. Only PDF and TXT are allowed."
        )

    # 3. Validate File Size
    file_bytes = await file.read()
    file_size = len(file_bytes)
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
        
    await file.seek(0) # Reset cursor for the physical write

    # 4. Apply UUID Sanitization Strategy
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    physical_file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # 5. Write Physical File to OS
    try:
        with open(physical_file_path, "wb") as buffer:
            buffer.write(file_bytes)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to write file to local disk.")

    # 6. Database Transaction & Synchronization
    db_document = models.Document(
        case_id=case_id,
        filename=file.filename or "unknown",
        file_path=physical_file_path,
        mime_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size
    )
    
    try:
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        return db_document
    except Exception:
        db.rollback()
        if os.path.exists(physical_file_path):
            os.remove(physical_file_path)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to index document in the database."
        )


@router.get("/", response_model=List[schemas.DocumentResponse])
def list_documents(case_id: int, db: Session = Depends(get_db)):
    # Validate Case State
    db_case = db.query(models.Case).filter(
        models.Case.id == case_id, 
        models.Case.is_archived == False
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or is archived")
        
    # Retrieve only active documents linked to this case
    documents = db.query(models.Document).filter(
        models.Document.case_id == case_id,
        models.Document.is_archived == False
    ).all()
    
    return documents