from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from ..models.agent import Agent, AgentType, AgentStatus, AgentConfig, AgentExecution
from ..models.tenant import User
from ..schemas.agent import AgentCreate, AgentUpdate, AgentResponse, AgentListResponse
from ..schemas.agent import AgentConfigCreate, AgentConfigResponse, AgentExecutionRequest
from .base import BaseService


class AgentService(BaseService):
    """Service for agent management"""
    
    def __init__(self, db: Session, current_user: User):
        super().__init__(db, current_user)
        self.tenant_id = current_user.tenant_id
    
    async def list_agents(
        self,
        skip: int = 0,
        limit: int = 100,
        type: Optional[str] = None,
        status: Optional[str] = None
    ) -> AgentListResponse:
        """List agents for current tenant"""
        query = self.db.query(Agent).filter(
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        )
        
        if type:
            query = query.filter(Agent.type == type)
        
        if status:
            query = query.filter(Agent.status == status)
        
        total = query.count()
        agents = query.order_by(desc(Agent.created_at)).offset(skip).limit(limit).all()
        
        items = [self._agent_to_response(agent) for agent in agents]
        
        return AgentListResponse(
            items=items,
            total=total,
            skip=skip,
            limit=limit
        )
    
    async def create_agent(self, agent_data: AgentCreate) -> AgentResponse:
        """Create a new agent"""
        # Check agent limit for tenant
        agent_count = self.db.query(Agent).filter(
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).count()
        
        # TODO: Get tenant limit from tenant configuration
        
        # Validate config if provided
        config = None
        if agent_data.config_id:
            config = self.db.query(AgentConfig).filter(
                AgentConfig.id == agent_data.config_id,
                AgentConfig.is_deleted == False
            ).first()
            if not config:
                raise ValueError("Agent config not found")
        
        # Create agent
        agent = Agent(
            id=f"agt_{self._generate_short_id()}",
            name=agent_data.name,
            description=agent_data.description,
            type=agent_data.type,
            status=AgentStatus.DRAFT,
            
            # LLM Configuration
            llm_provider=agent_data.llm_provider,
            llm_model=agent_data.llm_model,
            llm_temperature=agent_data.llm_temperature,
            llm_max_tokens=agent_data.llm_max_tokens,
            llm_system_prompt=agent_data.llm_system_prompt,
            
            # Resource Limits
            max_concurrent_tasks=agent_data.max_concurrent_tasks,
            max_tokens_per_month=agent_data.max_tokens_per_month,
            max_api_calls_per_hour=agent_data.max_api_calls_per_hour,
            
            # Tool Configuration
            available_tools=agent_data.available_tools,
            tool_configs=agent_data.tool_configs,
            
            # Data Access
            data_sources=agent_data.data_sources,
            data_access_rules=agent_data.data_access_rules,
            
            # Execution Configuration
            execution_strategy=agent_data.execution_strategy,
            retry_config=agent_data.retry_config,
            timeout_seconds=agent_data.timeout_seconds,
            
            # Relationships
            tenant_id=self.tenant_id,
            config_id=config.id if config else None
        )
        
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        
        return self._agent_to_response(agent)
    
    async def get_agent(self, agent_id: str) -> Optional[AgentResponse]:
        """Get agent by ID"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return None
        
        return self._agent_to_response(agent)
    
    async def update_agent(self, agent_id: str, agent_update: AgentUpdate) -> Optional[AgentResponse]:
        """Update an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return None
        
        # Update fields
        update_data = agent_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(agent, field, value)
        
        agent.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(agent)
        
        return self._agent_to_response(agent)
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Soft delete an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return False
        
        agent.soft_delete()
        self.db.commit()
        return True
    
    async def execute_agent(self, agent_id: str, execution_request: AgentExecutionRequest) -> Optional[Dict[str, Any]]:
        """Execute an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False,
            Agent.status == AgentStatus.ACTIVE
        ).first()
        
        if not agent:
            return None
        
        # TODO: Implement actual agent execution
        # This would involve:
        # 1. Creating AgentExecution record
        # 2. Loading agent configuration
        # 3. Initializing LLM (if applicable)
        # 4. Executing tools
        # 5. Storing results
        
        # For now, return mock execution
        execution = AgentExecution(
            id=f"exe_{self._generate_short_id()}",
            agent_id=agent_id,
            input_data=execution_request.input_data,
            status="success",
            execution_time_ms=500.0,
            tools_used=agent.available_tools[:2] if agent.available_tools else [],
            request_id=execution_request.request_id,
            session_id=execution_request.session_id
        )
        
        self.db.add(execution)
        
        # Update agent statistics
        agent.last_executed_at = datetime.utcnow()
        agent.execution_count += 1
        agent.success_rate = (agent.success_rate * (agent.execution_count - 1) + 1) / agent.execution_count
        
        self.db.commit()
        
        return {
            "execution_id": execution.id,
            "status": "success",
            "execution_time_ms": execution.execution_time_ms,
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def pause_agent(self, agent_id: str) -> Optional[AgentResponse]:
        """Pause an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return None
        
        agent.status = AgentStatus.PAUSED
        agent.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(agent)
        
        return self._agent_to_response(agent)
    
    async def resume_agent(self, agent_id: str) -> Optional[AgentResponse]:
        """Resume a paused agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False,
            Agent.status == AgentStatus.PAUSED
        ).first()
        
        if not agent:
            return None
        
        agent.status = AgentStatus.ACTIVE
        agent.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(agent)
        
        return self._agent_to_response(agent)
    
    async def archive_agent(self, agent_id: str) -> Optional[AgentResponse]:
        """Archive an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return None
        
        agent.status = AgentStatus.ARCHIVED
        agent.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(agent)
        
        return self._agent_to_response(agent)
    
    async def duplicate_agent(self, agent_id: str, new_name: str) -> Optional[AgentResponse]:
        """Duplicate an agent"""
        agent = self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.tenant_id == self.tenant_id,
            Agent.is_deleted == False
        ).first()
        
        if not agent:
            return None
        
        # Create duplicate
        duplicate = Agent(
            id=f"agt_{self._generate_short_id()}",
            name=new_name,
            description=f"Copy of {agent.name}",
            type=agent.type,
            status=AgentStatus.DRAFT,
            
            # Copy configurations
            llm_provider=agent.llm_provider,
            llm_model=agent.llm_model,
            llm_temperature=agent.llm_temperature,
            llm_max_tokens=agent.llm_max_tokens,
            llm_system_prompt=agent.llm_system_prompt,
            
            max_concurrent_tasks=agent.max_concurrent_tasks,
            max_tokens_per_month=agent.max_tokens_per_month,
            max_api_calls_per_hour=agent.max_api_calls_per_hour,
            
            available_tools=agent.available_tools.copy() if agent.available_tools else [],
            tool_configs=agent.tool_configs.copy() if agent.tool_configs else {},
            
            data_sources=agent.data_sources.copy() if agent.data_sources else [],
            data_access_rules=agent.data_access_rules.copy() if agent.data_access_rules else {},
            
            execution_strategy=agent.execution_strategy,
            retry_config=agent.retry_config.copy() if agent.retry_config else {},
            timeout_seconds=agent.timeout_seconds,
            
            tenant_id=self.tenant_id,
            config_id=agent.config_id
        )
        
        self.db.add(duplicate)
        self.db.commit()
        self.db.refresh(duplicate)
        
        return self._agent_to_response(duplicate)
    
    async def list_agent_executions(self, agent_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """List executions for an agent"""
        executions = self.db.query(AgentExecution).filter(
            AgentExecution.agent_id == agent_id
        ).order_by(desc(AgentExecution.created_at)).offset(skip).limit(limit).all()
        
        return [
            {
                "id": exe.id,
                "status": exe.status,
                "execution_time_ms": exe.execution_time_ms,
                "created_at": exe.created_at,
                "tools_used": exe.tools_used,
                "session_id": exe.session_id
            }
            for exe in executions
        ]
    
    async def list_agent_templates(self, type: Optional[str] = None) -> List[AgentConfigResponse]:
        """List agent templates"""
        query = self.db.query(AgentConfig).filter(
            AgentConfig.is_template == True,
            AgentConfig.is_deleted == False,
            AgentConfig.is_latest == True
        )
        
        if type:
            query = query.filter(AgentConfig.template_type == type)
        
        templates = query.order_by(AgentConfig.name).all()
        
        return [
            AgentConfigResponse(
                id=template.id,
                name=template.name,
                description=template.description,
                is_template=template.is_template,
                template_type=template.template_type,
                config_data=template.config_data,
                version=template.version,
                is_latest=template.is_latest,
                created_by_id=template.created_by_id,
                parent_config_id=template.parent_config_id,
                created_at=template.created_at,
                updated_at=template.updated_at
            )
            for template in templates
        ]
    
    async def create_agent_template(self, config: AgentConfigCreate) -> AgentConfigResponse:
        """Create an agent template"""
        template = AgentConfig(
            id=f"cfg_{self._generate_short_id()}",
            name=config.name,
            description=config.description,
            is_template=config.is_template,
            template_type=config.template_type,
            config_data=config.config_data,
            created_by_id=self.current_user.id
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return AgentConfigResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            is_template=template.is_template,
            template_type=template.template_type,
            config_data=template.config_data,
            version=template.version,
            is_latest=template.is_latest,
            created_by_id=template.created_by_id,
            parent_config_id=template.parent_config_id,
            created_at=template.created_at,
            updated_at=template.updated_at
        )
    
    async def get_agent_template(self, config_id: str) -> Optional[AgentConfigResponse]:
        """Get agent template by ID"""
        template = self.db.query(AgentConfig).filter(
            AgentConfig.id == config_id,
            AgentConfig.is_template == True,
            AgentConfig.is_deleted == False
        ).first()
        
        if not template:
            return None
        
        return AgentConfigResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            is_template=template.is_template,
            template_type=template.template_type,
            config_data=template.config_data,
            version=template.version,
            is_latest=template.is_latest,
            created_by_id=template.created_by_id,
            parent_config_id=template.parent_config_id,
            created_at=template.created_at,
            updated_at=template.updated_at
        )
    
    async def create_agent_from_template(self, template_id: str, agent_name: str) -> Optional[AgentResponse]:
        """Create an agent from a template"""
        template = self.db.query(AgentConfig).filter(
            AgentConfig.id == template_id,
            AgentConfig.is_template == True,
            AgentConfig.is_deleted == False,
            AgentConfig.is_latest == True
        ).first()
        
        if not template:
            return None
        
        # Create agent from template
        agent_data = AgentCreate(
            name=agent_name,
            description=f"Created from template: {template.name}",
            type=template.template_type or AgentType.CUSTOM,
            config_id=template.id,
            
            # Use template configuration
            **template.config_data
        )
        
        return await self.create_agent(agent_data)
    
    def _agent_to_response(self, agent: Agent) -> AgentResponse:
        """Convert Agent model to response schema"""
        return AgentResponse(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            type=agent.type,
            status=agent.status,
            
            llm_provider=agent.llm_provider,
            llm_model=agent.llm_model,
            llm_temperature=agent.llm_temperature,
            llm_max_tokens=agent.llm_max_tokens,
            llm_system_prompt=agent.llm_system_prompt,
            
            max_concurrent_tasks=agent.max_concurrent_tasks,
            max_tokens_per_month=agent.max_tokens_per_month,
            max_api_calls_per_hour=agent.max_api_calls_per_hour,
            
            available_tools=agent.available_tools,
            tool_configs=agent.tool_configs,
            
            data_sources=agent.data_sources,
            data_access_rules=agent.data_access_rules,
            
            execution_strategy=agent.execution_strategy,
            retry_config=agent.retry_config,
            timeout_seconds=agent.timeout_seconds,
            
            last_executed_at=agent.last_executed_at,
            execution_count=agent.execution_count,
            success_rate=agent.success_rate,
            avg_execution_time_ms=agent.avg_execution_time_ms,
            
            tenant_id=agent.tenant_id,
            config_id=agent.config_id,
            
            created_at=agent.created_at,
            updated_at=agent.updated_at
        )