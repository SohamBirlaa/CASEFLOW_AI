from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services import text_extractor, ai_service

router = APIRouter(prefix="/api", tags=["AI Analysis"])

@router.post("/documents/{document_id}/analyze", response_model=schemas.AIAnalysisResponse, status_code=status.HTTP_201_CREATED)
def analyze_single_document(document_id: int, db: Session = Depends(get_db)):
    # 1. Validate Document
    doc = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.is_archived == False
    ).first()
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or is archived.")

    # 2. Extract Text
    try:
        extracted_text = text_extractor.extract_text(doc.file_path, doc.mime_type)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Text extraction failed: {str(e)}")

    # 3. Trigger AI Inference
    try:
        ai_result = ai_service.analyze_text(extracted_text, analysis_type="document")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI Analysis failed: {str(e)}")

    # 4. Save to Database
    db_analysis = models.AIAnalysis(
        case_id=doc.case_id,
        document_id=doc.id,
        analysis_type=schemas.AIAnalysisType.DOCUMENT.value, # Corrected to use enum value
        summary=ai_result.get("summary"),
        parties=ai_result.get("parties"),
        key_dates=ai_result.get("key_dates"),
        obligations=ai_result.get("obligations"),
        action_items=ai_result.get("action_items"),
        risks=ai_result.get("risks")
    )

    try:
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save AI analysis to database.")


@router.post("/cases/{case_id}/analyze", response_model=schemas.AIAnalysisResponse, status_code=status.HTTP_201_CREATED)
def analyze_complete_case(case_id: int, db: Session = Depends(get_db)):
    # 1. Validate Case
    case = db.query(models.Case).filter(
        models.Case.id == case_id,
        models.Case.is_archived == False
    ).first()
    
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or is archived.")

    # 2. Fetch Active Documents
    documents = db.query(models.Document).filter(
        models.Document.case_id == case_id,
        models.Document.is_archived == False
    ).all()

    if not documents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active documents found to analyze for this case.")

    # 3. Aggregate Text
    combined_text_blocks = []
    for doc in documents:
        try:
            text = text_extractor.extract_text(doc.file_path, doc.mime_type)
            # Use strict dividers so the LLM understands the context boundaries
            combined_text_blocks.append(f"--- START DOCUMENT: {doc.filename} ---\n{text}\n--- END DOCUMENT: {doc.filename} ---")
        except Exception as e:
            # If one document fails to parse, log and continue for resilience
            print(f"Warning: Failed to extract text for {doc.filename}: {e}")
            continue

    combined_text = "\n\n".join(combined_text_blocks)

    if not combined_text.strip():
         raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No readable text could be extracted from the case documents.")

    # 4. Trigger AI Inference
    try:
        ai_result = ai_service.analyze_text(combined_text, analysis_type="case")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Case AI Analysis failed: {str(e)}")

    # 5. Save to Database
    db_analysis = models.AIAnalysis(
        case_id=case.id,
        document_id=None, # Explicitly null for a holistic case analysis
        analysis_type=schemas.AIAnalysisType.CASE.value, # Corrected to use enum value
        summary=ai_result.get("summary"),
        parties=ai_result.get("parties"),
        key_dates=ai_result.get("key_dates"),
        obligations=ai_result.get("obligations"),
        action_items=ai_result.get("action_items"),
        risks=ai_result.get("risks")
    )

    try:
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save Case AI analysis to database.")