from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

from .base import BaseSchema


class AgentType(str, Enum):
    CONVERSATIONAL = "conversational"
    CRAWLER = "crawler"
    MONITORING = "monitoring"
    TRANSACTIONAL = "transactional"
    DATA_RESEARCH = "data_research"
    ENTERTAINMENT = "entertainment"
    CUSTOM = "custom"


class AgentStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"
    ARCHIVED = "archived"


class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"
    COHERE = "cohere"
    OLLAMA = "ollama"
    HUGGINGFACE = "huggingface"
    NONE = "none"


class AgentCreate(BaseModel):
    """Schema for creating a new agent"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: AgentType
    config_id: Optional[str] = None
    
    # LLM Configuration
    llm_provider: LLMProvider = LLMProvider.OPENAI
    llm_model: Optional[str] = None
    llm_temperature: float = Field(0.7, ge=0.0, le=2.0)
    llm_max_tokens: int = Field(1000, ge=1, le=100000)
    llm_system_prompt: Optional[str] = None
    
    # Resource Limits
    max_concurrent_tasks: int = Field(5, ge=1, le=100)
    max_tokens_per_month: Optional[int] = Field(None, ge=1)
    max_api_calls_per_hour: int = Field(100, ge=1, le=10000)
    
    # Tool Configuration
    available_tools: List[str] = Field(default_factory=list)
    tool_configs: Dict[str, Any] = Field(default_factory=dict)
    
    # Data Access
    data_sources: List[str] = Field(default_factory=list)
    data_access_rules: Dict[str, Any] = Field(default_factory=dict)
    
    # Execution Configuration
    execution_strategy: str = Field("sequential", pattern="^(sequential|parallel|batch)$")
    retry_config: Dict[str, Any] = Field(default_factory=dict)
    timeout_seconds: int = Field(300, ge=1, le=3600)
    
    @validator("llm_model")
    def validate_llm_model(cls, v, values):
        if values.get("llm_provider") == LLMProvider.NONE and v:
            raise ValueError("LLM model should not be specified when provider is 'none'")
        if values.get("llm_provider") != LLMProvider.NONE and not v:
            raise ValueError("LLM model is required when provider is not 'none'")
        return v


class AgentUpdate(BaseModel):
    """Schema for updating an agent"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[AgentStatus] = None
    
    # LLM Configuration
    llm_provider: Optional[LLMProvider] = None
    llm_model: Optional[str] = None
    llm_temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    llm_max_tokens: Optional[int] = Field(None, ge=1, le=100000)
    llm_system_prompt: Optional[str] = None
    
    # Resource Limits
    max_concurrent_tasks: Optional[int] = Field(None, ge=1, le=100)
    max_tokens_per_month: Optional[int] = Field(None, ge=1)
    max_api_calls_per_hour: Optional[int] = Field(None, ge=1, le=10000)
    
    # Tool Configuration
    available_tools: Optional[List[str]] = None
    tool_configs: Optional[Dict[str, Any]] = None
    
    # Data Access
    data_sources: Optional[List[str]] = None
    data_access_rules: Optional[Dict[str, Any]] = None
    
    # Execution Configuration
    execution_strategy: Optional[str] = Field(None, pattern="^(sequential|parallel|batch)$")
    retry_config: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = Field(None, ge=1, le=3600)


class AgentResponse(BaseSchema):
    """Schema for agent response"""
    id: str
    name: str
    description: Optional[str]
    type: AgentType
    status: AgentStatus
    
    # LLM Configuration
    llm_provider: LLMProvider
    llm_model: Optional[str]
    llm_temperature: float
    llm_max_tokens: int
    llm_system_prompt: Optional[str]
    
    # Resource Limits
    max_concurrent_tasks: int
    max_tokens_per_month: Optional[int]
    max_api_calls_per_hour: int
    
    # Tool Configuration
    available_tools: List[str]
    tool_configs: Dict[str, Any]
    
    # Data Access
    data_sources: List[str]
    data_access_rules: Dict[str, Any]
    
    # Execution Configuration
    execution_strategy: str
    retry_config: Dict[str, Any]
    timeout_seconds: int
    
    # Monitoring
    last_executed_at: Optional[datetime]
    execution_count: int
    success_rate: float
    avg_execution_time_ms: float
    
    # Relationships
    tenant_id: str
    config_id: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class AgentListResponse(BaseModel):
    """Schema for paginated agent list response"""
    items: List[AgentResponse]
    total: int
    skip: int
    limit: int


class AgentConfigCreate(BaseModel):
    """Schema for creating agent configuration"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_template: bool = False
    template_type: Optional[AgentType] = None
    config_data: Dict[str, Any] = Field(default_factory=dict)


class AgentConfigResponse(BaseSchema):
    """Schema for agent configuration response"""
    id: str
    name: str
    description: Optional[str]
    is_template: bool
    template_type: Optional[AgentType]
    config_data: Dict[str, Any]
    version: str
    is_latest: bool
    created_by_id: Optional[str]
    parent_config_id: Optional[str]
    created_at: datetime
    updated_at: datetime


class AgentExecutionRequest(BaseModel):
    """Schema for agent execution request"""
    input_data: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    override_config: Optional[Dict[str, Any]] = None