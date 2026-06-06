from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import enum

class CaseStatus(str, enum.Enum):
    NEW = "New"
    IN_PROGRESS = "In Progress"
    WAITING = "Waiting"
    REVIEW = "Review"
    CLOSED = "Closed"

class CasePriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

# --- Document Schemas ---
class DocumentBase(BaseModel):
    filename: str
    mime_type: str
    file_size_bytes: int

class DocumentCreate(DocumentBase):
    case_id: int
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    case_id: int
    uploaded_at: datetime
    is_archived: bool

    model_config = ConfigDict(from_attributes=True)

# --- Case Schemas ---
class CaseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    client_name: str = Field(..., min_length=1, max_length=255)
    case_type: Optional[str] = Field(None, max_length=100)
    priority: CasePriority = CasePriority.MEDIUM
    assigned_owner: Optional[str] = Field(None, max_length=255)
    due_date: Optional[datetime] = None
    status: CaseStatus = CaseStatus.NEW
    notes: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    client_name: Optional[str] = Field(None, min_length=1, max_length=255)
    case_type: Optional[str] = Field(None, max_length=100)
    priority: Optional[CasePriority] = None
    assigned_owner: Optional[str] = Field(None, max_length=255)
    due_date: Optional[datetime] = None
    status: Optional[CaseStatus] = None
    notes: Optional[str] = None
    is_archived: Optional[bool] = None

class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    is_archived: bool
    
    # Attached documents mapped with the safe default_factory per approval
    documents: List[DocumentResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)