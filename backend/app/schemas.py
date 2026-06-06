from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
import enum

# Strict application-layer validation choices
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

# Shared properties across all Case schemas
class CaseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="The title of the case")
    client_name: str = Field(..., min_length=1, max_length=255, description="Associated client name")
    case_type: Optional[str] = Field(None, max_length=100)
    priority: CasePriority = CasePriority.MEDIUM
    assigned_owner: Optional[str] = Field(None, max_length=255)
    due_date: Optional[datetime] = None
    status: CaseStatus = CaseStatus.NEW
    notes: Optional[str] = None

# Schema strictly for creation (inherits base requirements)
class CaseCreate(CaseBase):
    pass

# Schema strictly for updating (all fields become optional)
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

# Schema for outgoing data (includes DB-generated fields)
class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    is_archived: bool

    # Allows Pydantic to read data directly from the SQLAlchemy ORM model
    model_config = ConfigDict(from_attributes=True)