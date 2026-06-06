from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

# Initialize the router with a prefix to keep URLs clean
router = APIRouter(prefix="/api/cases", tags=["Cases"])

@router.post("/", response_model=schemas.CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    # Unpack the Pydantic schema into a SQLAlchemy model
    db_case = models.Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/", response_model=List[schemas.CaseResponse])
def list_cases(skip: int = 0, limit: int = 100, include_archived: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Case)
    
    # Soft delete strategy: Hide archived cases by default
    if not include_archived:
        query = query.filter(models.Case.is_archived == False)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{case_id}", response_model=schemas.CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    # Explicitly filter out archived cases
    case = db.query(models.Case).filter(
        models.Case.id == case_id,
        models.Case.is_archived == False
    ).first()
    
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or archived")
    return case

@router.put("/{case_id}", response_model=schemas.CaseResponse)
def update_case(case_id: int, case_update: schemas.CaseUpdate, db: Session = Depends(get_db)):
    # Explicitly prevent updating archived cases
    db_case = db.query(models.Case).filter(
        models.Case.id == case_id,
        models.Case.is_archived == False
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or archived")
    
    # Extract only the fields that were explicitly sent in the request
    update_data = case_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_case, key, value)
        
    db.commit()
    db.refresh(db_case)
    return db_case

@router.patch("/{case_id}/archive", status_code=status.HTTP_200_OK)
def archive_case(case_id: int, db: Session = Depends(get_db)):
    db_case = db.query(models.Case).filter(
        models.Case.id == case_id,
        models.Case.is_archived == False
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found or already archived")
    
    # Archive instead of deleting to preserve audit history
    db_case.is_archived = True
    db.commit()
    return {"detail": "Case successfully archived"}