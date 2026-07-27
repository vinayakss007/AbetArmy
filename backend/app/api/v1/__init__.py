from fastapi import APIRouter

from .endpoints import agents, tools, tenants, users, monitoring, executions

api_router = APIRouter()

# Include all routers
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])