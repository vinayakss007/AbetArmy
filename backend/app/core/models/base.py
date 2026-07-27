from datetime import datetime
from typing import Optional
from sqlalchemy import Column, DateTime, String, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps"""
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True)


class SoftDeleteMixin:
    """Mixin for soft delete functionality"""
    is_deleted = Column(default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)


class BaseModel(Base, TimestampMixin, SoftDeleteMixin):
    """Base model class with common attributes"""
    __abstract__ = True
    
    id = Column(String, primary_key=True, index=True)
    
    def soft_delete(self):
        """Soft delete the record"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()