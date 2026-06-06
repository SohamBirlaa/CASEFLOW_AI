from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    client_name = Column(String(255), nullable=False, index=True)
    case_type = Column(String(100), nullable=True)
    
    # Stored as standard strings for SQLite compatibility, validated by Pydantic
    priority = Column(String(20), default="Medium", index=True)
    assigned_owner = Column(String(255), nullable=True, index=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="New", index=True)
    notes = Column(Text, nullable=True)
    
    # Audit and lifecycle timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Soft delete strategy flag
    is_archived = Column(Boolean, default=False, index=True)