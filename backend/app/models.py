from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    client_name = Column(String(255), nullable=False, index=True)
    case_type = Column(String(100), nullable=True)
    
    priority = Column(String(20), default="Medium", index=True)
    assigned_owner = Column(String(255), nullable=True, index=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="New", index=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_archived = Column(Boolean, default=False, index=True)

    # One-to-Many Relationship: A Case can have multiple documents
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    is_archived = Column(Boolean, default=False, index=True)

    # Reverse relationship back to the Case
    case = relationship("Case", back_populates="documents")