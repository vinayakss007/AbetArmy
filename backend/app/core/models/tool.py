from sqlalchemy import Column, String, Text, Boolean, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid

from .base import BaseModel


class ToolCategory(str, Enum):
    """Categories of tools"""
    WEB = "web"
    DATABASE = "database"
    API = "api"
    FILE = "file"
    EMAIL = "email"
    CALENDAR = "calendar"
    PAYMENT = "payment"
    DATA_PROCESSING = "data_processing"
    AI = "ai"
    UTILITY = "utility"


class Tool(BaseModel):
    __tablename__ = "tools"
    
    name = Column(String(255), nullable=False, unique=True, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(ToolCategory), nullable=False)
    
    # Tool implementation
    implementation_type = Column(String(50), nullable=False)  # python_function, http_endpoint, etc.
    implementation_config = Column(JSON, nullable=False)  # Configuration for the implementation
    
    # Permissions and scopes
    required_scopes = Column(JSON, default=list, nullable=False)  # Scopes required to use this tool
    default_config = Column(JSON, default=dict, nullable=False)  # Default configuration for tool
    
    # Resource limits
    max_execution_time_ms = Column(Integer, default=5000, nullable=False)
    max_memory_mb = Column(Integer, nullable=True)
    requires_approval = Column(Boolean, default=False, nullable=False)
    
    # Monitoring
    usage_count = Column(Integer, default=0, nullable=False)
    avg_execution_time_ms = Column(Float, default=0.0, nullable=False)
    error_rate = Column(Float, default=0.0, nullable=False)
    
    # Security
    is_safe = Column(Boolean, default=True, nullable=False)
    requires_authentication = Column(Boolean, default=True, nullable=False)
    
    # Versioning
    version = Column(String(20), default="1.0.0", nullable=False)
    is_deprecated = Column(Boolean, default=False, nullable=False)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)  # None for global tools
    
    # Relationships
    tenant = relationship("Tenant")
    tool_executions = relationship("ToolExecution", back_populates="tool", cascade="all, delete-orphan")
    
    def generate_id(self):
        return f"tl_{uuid.uuid4().hex[:16]}"


class ToolExecution(BaseModel):
    __tablename__ = "tool_executions"
    
    # Execution details
    tool_name = Column(String(255), nullable=False, index=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False)  # success, failed, timeout
    error_message = Column(Text, nullable=True)
    
    # Performance metrics
    execution_time_ms = Column(Float, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    
    # Context
    agent_execution_id = Column(String, ForeignKey("agent_executions.id", ondelete="CASCADE"), nullable=True)
    parent_tool_execution_id = Column(String, ForeignKey("tool_executions.id", ondelete="SET NULL"), nullable=True)
    
    # Foreign keys
    tool_id = Column(String, ForeignKey("tools.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    tool = relationship("Tool", back_populates="tool_executions")
    agent_execution = relationship("AgentExecution", backref="tool_executions")
    parent_execution = relationship("ToolExecution", remote_side="ToolExecution.id", backref="child_executions")
    
    def generate_id(self):
        return f"tex_{uuid.uuid4().hex[:16]}"


class DataSource(BaseModel):
    __tablename__ = "data_sources"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)  # database, api, file, web, stream
    
    # Connection configuration
    connection_config = Column(JSON, nullable=False)
    
    # Access control
    access_rules = Column(JSON, default=dict, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Resource limits
    max_concurrent_connections = Column(Integer, default=10, nullable=False)
    rate_limit_per_minute = Column(Integer, nullable=True)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    tenant = relationship("Tenant")
    
    def generate_id(self):
        return f"ds_{uuid.uuid4().hex[:16]}"