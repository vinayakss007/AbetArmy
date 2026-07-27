from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from ...database import get_db
from ...core.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse, AgentListResponse,
    AgentConfigCreate, AgentConfigResponse, AgentExecutionRequest
)
from ...core.services.agents import AgentService
from ...core.services.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all agents for the current tenant"""
    service = AgentService(db, current_user)
    return await service.list_agents(skip=skip, limit=limit, type=type, status=status)


@router.post("/", response_model=AgentResponse, status_code=201)
async def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new agent"""
    service = AgentService(db, current_user)
    return await service.create_agent(agent)


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get agent details by ID"""
    service = AgentService(db, current_user)
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_update: AgentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an agent"""
    service = AgentService(db, current_user)
    agent = await service.update_agent(agent_id, agent_update)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete an agent (soft delete)"""
    service = AgentService(db, current_user)
    success = await service.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/execute", response_model=dict)
async def execute_agent(
    agent_id: str,
    execution_request: AgentExecutionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Execute an agent with provided input"""
    service = AgentService(db, current_user)
    result = await service.execute_agent(agent_id, execution_request)
    if not result:
        raise HTTPException(status_code=404, detail="Agent not found or execution failed")
    return result


@router.post("/{agent_id}/pause", response_model=AgentResponse)
async def pause_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Pause an agent"""
    service = AgentService(db, current_user)
    agent = await service.pause_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/{agent_id}/resume", response_model=AgentResponse)
async def resume_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Resume a paused agent"""
    service = AgentService(db, current_user)
    agent = await service.resume_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/{agent_id}/archive", response_model=AgentResponse)
async def archive_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Archive an agent"""
    service = AgentService(db, current_user)
    agent = await service.archive_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/{agent_id}/duplicate", response_model=AgentResponse)
async def duplicate_agent(
    agent_id: str,
    new_name: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Duplicate an agent with a new name"""
    service = AgentService(db, current_user)
    agent = await service.duplicate_agent(agent_id, new_name)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/{agent_id}/executions", response_model=List[dict])
async def list_agent_executions(
    agent_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List executions for an agent"""
    service = AgentService(db, current_user)
    return await service.list_agent_executions(agent_id, skip=skip, limit=limit)


# Agent Configs (Templates) Endpoints
@router.get("/configs/templates", response_model=List[AgentConfigResponse])
async def list_agent_templates(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List available agent templates"""
    service = AgentService(db, current_user)
    return await service.list_agent_templates(type)


@router.post("/configs/templates", response_model=AgentConfigResponse, status_code=201)
async def create_agent_template(
    config: AgentConfigCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new agent template"""
    service = AgentService(db, current_user)
    return await service.create_agent_template(config)


@router.get("/configs/templates/{config_id}", response_model=AgentConfigResponse)
async def get_agent_template(
    config_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get agent template by ID"""
    service = AgentService(db, current_user)
    template = await service.get_agent_template(config_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/from-template/{template_id}", response_model=AgentResponse, status_code=201)
async def create_agent_from_template(
    template_id: str,
    agent_name: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new agent from a template"""
    service = AgentService(db, current_user)
    agent = await service.create_agent_from_template(template_id, agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail="Template not found or creation failed")
    return agent