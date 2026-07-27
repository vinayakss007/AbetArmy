from sqlalchemy import Column, String, Text, Boolean, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid

from .base import BaseModel


class BillingRecord(BaseModel):
    __tablename__ = "billing_records"
    
    # Billing details
    amount_usd = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    billing_period = Column(String(50), nullable=False)  # e.g., "2024-01"
    status = Column(String(50), nullable=False)  # pending, paid, failed, refunded
    
    # Usage details
    agent_count = Column(Integer, default=0, nullable=False)
    api_call_count = Column(Integer, default=0, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    storage_mb = Column(Float, default=0.0, nullable=False)
    
    # Payment details
    stripe_invoice_id = Column(String(255), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    payment_method = Column(String(50), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="billing_records")
    
    def generate_id(self):
        return f"bil_{uuid.uuid4().hex[:16]}"


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    # Action details
    action_type = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False, index=True)
    resource_id = Column(String, nullable=True, index=True)
    
    # User/Agent context
    actor_type = Column(String(50), nullable=False)  # user, agent, system
    actor_id = Column(String, nullable=True)
    actor_name = Column(String(255), nullable=True)
    
    # Action data
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    changes = Column(JSON, nullable=True)
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(100), nullable=True, index=True)
    
    # Tenant context
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    
    def generate_id(self):
        return f"aud_{uuid.uuid4().hex[:16]}"


class Metric(BaseModel):
    __tablename__ = "metrics"
    
    # Metric details
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # counter, gauge, histogram, summary
    labels = Column(JSON, default=dict, nullable=False)
    
    # Values
    value = Column(Float, nullable=False)
    count = Column(Integer, default=1, nullable=False)
    
    # Time window
    interval_minutes = Column(Integer, default=1, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    
    # Resource context
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant")
    agent = relationship("Agent")
    
    def generate_id(self):
        return f"met_{uuid.uuid4().hex[:16]}"


class Alert(BaseModel):
    __tablename__ = "alerts"
    
    # Alert details
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    severity = Column(String(20), nullable=False)  # info, warning, error, critical
    status = Column(String(20), default="active", nullable=False)  # active, acknowledged, resolved
    
    # Trigger details
    condition = Column(JSON, nullable=False)
    triggered_at = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    
    # Resource context
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String, nullable=True)
    
    # Notification
    notification_sent = Column(Boolean, default=False, nullable=False)
    notification_channels = Column(JSON, default=list, nullable=False)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    
    def generate_id(self):
        return f"alt_{uuid.uuid4().hex[:16]}"


class UsageRecord(BaseModel):
    __tablename__ = "usage_records"
    
    # Usage details
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    record_type = Column(String(50), nullable=False)  # hourly, daily, monthly
    
    # Usage counts
    agent_count = Column(Integer, default=0, nullable=False)
    active_agent_count = Column(Integer, default=0, nullable=False)
    api_call_count = Column(Integer, default=0, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    execution_count = Column(Integer, default=0, nullable=False)
    
    # Performance metrics
    avg_execution_time_ms = Column(Float, default=0.0, nullable=False)
    success_rate = Column(Float, default=0.0, nullable=False)
    
    # Resource usage
    storage_mb = Column(Float, default=0.0, nullable=False)
    memory_hours = Column(Float, default=0.0, nullable=False)
    
    # Cost
    estimated_cost_usd = Column(Float, default=0.0, nullable=False)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    
    def generate_id(self):
        return f"use_{uuid.uuid4().hex[:16]}"