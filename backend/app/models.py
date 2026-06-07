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

    # Bidirectional Relationships
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="case", cascade="all, delete-orphan")


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

    # Bidirectional Relationships
    case = relationship("Case", back_populates="documents")
    ai_analyses = relationship("AIAnalysis", back_populates="document", cascade="all, delete-orphan")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True, index=True)
    
    analysis_type = Column(String(20), nullable=False) 
    
    summary = Column(Text, nullable=True)
    parties = Column(Text, nullable=True)
    key_dates = Column(Text, nullable=True)
    obligations = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Bidirectional Relationships
    case = relationship("Case", back_populates="ai_analyses")
    document = relationship("Document", back_populates="ai_analyses")