from sqlalchemy import Column, String, Text, Boolean, Integer, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid

from .base import BaseModel


class AgentType(str, Enum):
    """Types of agents supported"""
    CONVERSATIONAL = "conversational"
    CRAWLER = "crawler"
    MONITORING = "monitoring"
    TRANSACTIONAL = "transactional"
    DATA_RESEARCH = "data_research"
    ENTERTAINMENT = "entertainment"
    CUSTOM = "custom"


class AgentStatus(str, Enum):
    """Status of an agent"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"
    ARCHIVED = "archived"


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"
    COHERE = "cohere"
    OLLAMA = "ollama"
    HUGGINGFACE = "huggingface"
    NONE = "none"  # For rule-based agents


class Agent(BaseModel):
    __tablename__ = "agents"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(AgentType), nullable=False)
    status = Column(SQLEnum(AgentStatus), default=AgentStatus.DRAFT, nullable=False)
    
    # LLM Configuration
    llm_provider = Column(SQLEnum(LLMProvider), default=LLMProvider.OPENAI, nullable=False)
    llm_model = Column(String(100), nullable=True)
    llm_temperature = Column(Float, default=0.7, nullable=False)
    llm_max_tokens = Column(Integer, default=1000, nullable=False)
    llm_system_prompt = Column(Text, nullable=True)
    
    # Resource Limits
    max_concurrent_tasks = Column(Integer, default=5, nullable=False)
    max_tokens_per_month = Column(Integer, nullable=True)
    max_api_calls_per_hour = Column(Integer, default=100, nullable=False)
    
    # Tool Configuration
    available_tools = Column(JSON, default=list, nullable=False)  # List of tool names
    tool_configs = Column(JSON, default=dict, nullable=False)  # Per-tool configurations
    
    # Data Access
    data_sources = Column(JSON, default=list, nullable=False)  # List of data source IDs
    data_access_rules = Column(JSON, default=dict, nullable=False)  # Access rules per data source
    
    # Execution Configuration
    execution_strategy = Column(String(50), default="sequential", nullable=False)
    retry_config = Column(JSON, default=dict, nullable=False)
    timeout_seconds = Column(Integer, default=300, nullable=False)
    
    # Monitoring
    last_executed_at = Column(DateTime, nullable=True)
    execution_count = Column(Integer, default=0, nullable=False)
    success_rate = Column(Float, default=0.0, nullable=False)
    avg_execution_time_ms = Column(Float, default=0.0, nullable=False)
    
    # Foreign keys
    tenant_id = Column(String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    config_id = Column(String, ForeignKey("agent_configs.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="agents")
    config = relationship("AgentConfig", back_populates="agents")
    executions = relationship("AgentExecution", back_populates="agent", cascade="all, delete-orphan")
    
    def generate_id(self):
        return f"agt_{uuid.uuid4().hex[:16]}"


class AgentConfig(BaseModel):
    __tablename__ = "agent_configs"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_template = Column(Boolean, default=False, nullable=False)
    template_type = Column(SQLEnum(AgentType), nullable=True)
    
    # Configuration data
    config_data = Column(JSON, nullable=False)  # Full agent configuration
    
    # Versioning
    version = Column(String(20), default="1.0.0", nullable=False)
    is_latest = Column(Boolean, default=True, nullable=False)
    parent_config_id = Column(String, ForeignKey("agent_configs.id", ondelete="SET NULL"), nullable=True)
    
    # Foreign keys
    created_by_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    created_by = relationship("User", back_populates="agent_configs")
    agents = relationship("Agent", back_populates="config")
    parent_config = relationship("AgentConfig", remote_side="AgentConfig.id", backref="child_configs")
    
    def generate_id(self):
        return f"cfg_{uuid.uuid4().hex[:16]}"


class AgentExecution(BaseModel):
    __tablename__ = "agent_executions"
    
    # Execution details
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False)  # pending, running, success, failed, cancelled
    error_message = Column(Text, nullable=True)
    
    # Performance metrics
    execution_time_ms = Column(Float, nullable=True)
    token_usage = Column(JSON, nullable=True)  # {prompt_tokens: X, completion_tokens: Y, total_tokens: Z}
    cost_usd = Column(Float, default=0.0, nullable=False)
    
    # Tool usage
    tools_used = Column(JSON, default=list, nullable=False)
    data_sources_accessed = Column(JSON, default=list, nullable=False)
    
    # Context
    session_id = Column(String(100), nullable=True, index=True)
    request_id = Column(String(100), nullable=True, index=True)
    
    # Foreign keys
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="executions")
    
    def generate_id(self):
        return f"exe_{uuid.uuid4().hex[:16]}"