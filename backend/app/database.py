from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator

from .config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    echo=settings.debug,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database by creating all tables"""
    from .core.models.base import Base as ModelsBase
    from .core.models.tenant import Tenant, User, APIKey
    from .core.models.agent import Agent, AgentConfig, AgentExecution
    from .core.models.tool import Tool, ToolExecution, DataSource
    from .core.models.monitoring import BillingRecord, AuditLog, Metric, Alert, UsageRecord
    
    ModelsBase.metadata.create_all(bind=engine)


def create_sample_data():
    """Create sample data for development"""
    from .core.models.tenant import Tenant, TenantTier, User, APIKey
    from .core.models.agent import Agent, AgentType, AgentStatus, LLMProvider, AgentConfig
    from .core.models.tool import Tool, ToolCategory
    
    db = SessionLocal()
    try:
        # Create sample tenant
        tenant = Tenant(
            id="tenant_1234567890",
            name="Sample Corp",
            description="Sample company for testing",
            tier=TenantTier.PRO,
            max_agents=50,
            max_users=20,
            max_api_calls_per_month=10000,
            max_storage_mb=1000,
            is_active=True
        )
        db.add(tenant)
        
        # Create sample user
        user = User(
            id="usr_admin12345678",
            email="admin@sample.com",
            username="admin",
            hashed_password="hashed_password_here",  # Would be hashed in real app
            full_name="Admin User",
            is_tenant_admin=True,
            is_superuser=True,
            is_active=True,
            is_verified=True,
            tenant_id=tenant.id
        )
        db.add(user)
        
        # Create sample API key
        api_key = APIKey(
            id="key_1234567890abcd",
            name="Default API Key",
            key_hash="hashed_key_here",
            prefix="key_",
            scopes='["agents:read", "agents:write", "tools:read", "tools:execute"]',
            tenant_id=tenant.id,
            user_id=user.id
        )
        db.add(api_key)
        
        # Create sample tools
        sample_tools = [
            Tool(
                id="tl_websearch12345",
                name="web_search",
                display_name="Web Search",
                description="Search the web for information",
                category=ToolCategory.WEB,
                implementation_type="http_endpoint",
                implementation_config={"url": "https://api.example.com/search"},
                is_safe=True
            ),
            Tool(
                id="tl_database123456",
                name="database_query",
                display_name="Database Query",
                description="Query a database",
                category=ToolCategory.DATABASE,
                implementation_type="python_function",
                implementation_config={"module": "app.agents.tools.database", "function": "execute_query"},
                is_safe=True
            ),
            Tool(
                id="tl_email12345678",
                name="send_email",
                display_name="Send Email",
                description="Send an email",
                category=ToolCategory.EMAIL,
                implementation_type="http_endpoint",
                implementation_config={"url": "https://api.example.com/email"},
                is_safe=True
            )
        ]
        
        for tool in sample_tools:
            db.add(tool)
        
        # Create sample agent configs (templates)
        agent_templates = [
            AgentConfig(
                id="cfg_conversational_1",
                name="Customer Support Agent",
                description="Template for conversational customer support agent",
                is_template=True,
                template_type=AgentType.CONVERSATIONAL,
                config_data={
                    "llm_provider": "openai",
                    "llm_model": "gpt-4",
                    "llm_temperature": 0.7,
                    "tools": ["web_search", "database_query"],
                    "system_prompt": "You are a helpful customer support agent..."
                },
                created_by_id=user.id
            ),
            AgentConfig(
                id="cfg_monitoring_1",
                name="Website Monitor",
                description="Template for website monitoring agent",
                is_template=True,
                template_type=AgentType.MONITORING,
                config_data={
                    "llm_provider": "none",
                    "tools": ["web_check", "alert_system"],
                    "check_interval_seconds": 60,
                    "alert_channels": ["email", "slack"]
                },
                created_by_id=user.id
            )
        ]
        
        for template in agent_templates:
            db.add(template)
        
        # Create sample agents
        sample_agents = [
            Agent(
                id="agt_support_123456",
                name="Customer Support Bot",
                description="Handles customer inquiries and support tickets",
                type=AgentType.CONVERSATIONAL,
                status=AgentStatus.ACTIVE,
                llm_provider=LLMProvider.OPENAI,
                llm_model="gpt-4",
                llm_temperature=0.7,
                available_tools=["web_search", "database_query"],
                config_id="cfg_conversational_1",
                tenant_id=tenant.id
            ),
            Agent(
                id="agt_monitor_123456",
                name="Website Uptime Monitor",
                description="Monitors website availability and performance",
                type=AgentType.MONITORING,
                status=AgentStatus.ACTIVE,
                llm_provider=LLMProvider.NONE,
                available_tools=["web_check", "alert_system"],
                config_id="cfg_monitoring_1",
                tenant_id=tenant.id
            )
        ]
        
        for agent in sample_agents:
            db.add(agent)
        
        db.commit()
        print("Sample data created successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
        raise
    finally:
        db.close()