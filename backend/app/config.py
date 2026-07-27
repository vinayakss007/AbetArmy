from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    # Application
    app_name: str = "AI Agent Fleet Platform"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    
    # API
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security
    secret_key: str = Field(default="your-secret-key-here-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Database
    database_url: str = Field(
        default="postgresql://agent_admin:agent_password@localhost:5432/agent_fleet"
    )
    redis_url: str = Field(default="redis://localhost:6379/0")
    
    # AI Providers
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    cohere_api_key: Optional[str] = None
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # Agent Configuration
    default_agent_concurrency: int = 5
    max_agents_per_user: int = 100
    max_tools_per_agent: int = 20
    
    # Monitoring
    enable_telemetry: bool = True
    metrics_port: int = 9091
    log_level: str = "INFO"
    
    # Billing
    stripe_api_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @validator("environment")
    def validate_environment(cls, v):
        if v not in ["development", "staging", "production"]:
            raise ValueError("Environment must be development, staging, or production")
        return v
    
    @validator("database_url")
    def validate_database_url(cls, v):
        if not v.startswith("postgresql://"):
            raise ValueError("Database URL must start with postgresql://")
        return v


settings = Settings()