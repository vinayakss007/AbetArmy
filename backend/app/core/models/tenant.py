from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid

from .base import BaseModel


class TenantTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class Tenant(BaseModel):
    __tablename__ = "tenants"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    tier = Column(SQLEnum(TenantTier), default=TenantTier.FREE, nullable=False)
    
    # Tenant limits
    max_agents = Column(Integer, default=10, nullable=False)
    max_users = Column(Integer, default=5, nullable=False)
    max_api_calls_per_month = Column(Integer, default=1000, nullable=False)
    max_storage_mb = Column(Integer, default=100, nullable=False)
    
    # Billing info
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    billing_email = Column(String(255), nullable=True)
    
    # Settings
    is_active = Column(Boolean, default=True, nullable=False)
    custom_domain = Column(String(255), nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="tenant", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="tenant", cascade="all, delete-orphan")
    billing_records = relationship("BillingRecord", back_populates="tenant", cascade="all, delete-orphan")


class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # User roles within tenant
    is_tenant_admin = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    agent_configs = relationship("AgentConfig", back_populates="created_by", cascade="all, delete-orphan")
    
    def generate_id(self):
        return f"usr_{uuid.uuid4().hex[:16]}"


class APIKey(BaseModel):
    __tablename__ = "api_keys"
    
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    prefix = Column(String(10), nullable=False)
    scopes = Column(Text, nullable=False)  # JSON list of permissions
    expires_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")
    
    def generate_id(self):
        return f"key_{uuid.uuid4().hex[:16]}"