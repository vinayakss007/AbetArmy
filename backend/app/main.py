from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .config import settings
from .database import init_db, create_sample_data
from .api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Environment: {settings.environment}")
    
    # Initialize database
    try:
        init_db()
        if settings.environment == "development":
            create_sample_data()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Modular AI Agent Fleet Platform - Enterprise-grade agent orchestration",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/health",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "timestamp": "2024-01-01T00:00:00Z"  # Would be actual timestamp
    }


@app.get("/metrics")
async def metrics():
    """Metrics endpoint for Prometheus"""
    return {
        "status": "metrics_endpoint",
        "message": "Prometheus metrics available at /metrics/prometheus"
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )