

import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

# Standalone prefix for direct document interactions
router = APIRouter(prefix="/api/documents", tags=["Document Actions"])

@router.get("/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db)):
    # 1. Validate Document State
    doc = db.query(models.Document).filter(
        models.Document.id == document_id, 
        models.Document.is_archived == False
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document not found or is archived."
        )
        
    # 2. Validate Physical File Existence
    if not os.path.exists(doc.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Physical file missing from server."
        )

    # 3. Stream File Safely using FileResponse
    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.filename,
        content_disposition_type="attachment"
    )

@router.patch("/{document_id}/archive", status_code=status.HTTP_200_OK)
def archive_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(
        models.Document.id == document_id, 
        models.Document.is_archived == False
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document not found or already archived."
        )
    
    # Soft archive strategy: Update state, preserve physical file
    doc.is_archived = True
    
    try:
        db.commit()
        return {"detail": "Document successfully archived."}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to archive document in the database."
        )