"""Main FastAPI application for CourseCast backend."""

from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from logging_config import setup_logging, get_logger
from services.data_service import DataService
from services.optimization_service import OptimizationService
from services.simulation_service import SimulationService
from models.optimization_models import OptimizationRequest, OptimizationResponse
from models.simulation_models import SimulationRequest, SimulationResponse


# Set up logging
setup_logging()
logger = get_logger(__name__)

# Initialize services
data_service = DataService()
optimization_service = OptimizationService(data_service=data_service)
simulation_service = SimulationService(data_service=data_service, optimization_service=optimization_service)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting CourseCast backend service", version=settings.app_version)
    yield
    logger.info("Shutting down CourseCast backend service")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FastAPI backend service for CourseCast optimization and simulation",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug,
    }


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name} v{settings.app_version}",
        "docs": "/docs",
        "health": "/health",
    }


# API v1 router (placeholder for future endpoints)
@app.get(f"{settings.api_v1_prefix}/status")
async def api_status() -> Dict[str, Any]:
    """API status endpoint."""
    return {
        "api_version": "v1",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "optimization": f"{settings.api_v1_prefix}/optimize",
            "simulation": f"{settings.api_v1_prefix}/simulate",
        },
    }


@app.post(f"{settings.api_v1_prefix}/optimize", response_model=OptimizationResponse)
async def optimize_courses(request: OptimizationRequest) -> OptimizationResponse:
    """Optimize course selection using linear programming."""
    try:
        logger.info(
            "Starting optimization",
            budget=request.budget,
            max_credits=request.max_credits,
            course_count=len(request.courses),
            seed=request.seed
        )
        
        result = optimization_service.optimize(request)
        
        logger.info(
            "Optimization completed",
            status=result.optimization_status,
            selected_courses=len([c for c in result.selected_courses if c.selected]),
            total_cost=result.total_cost,
            total_credits=result.total_credits
        )
        
        return result
        
    except Exception as e:
        logger.error("Optimization failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )


@app.post(f"{settings.api_v1_prefix}/simulate", response_model=SimulationResponse)
async def simulate_courses(request: SimulationRequest) -> SimulationResponse:
    """Run Monte Carlo simulation for course optimization."""
    try:
        logger.info(
            "Starting simulation",
            budget=request.budget,
            max_credits=request.max_credits,
            course_count=len(request.courses),
            num_simulations=request.num_simulations,
            seed=request.seed
        )
        
        result = simulation_service.run_simulation(request)
        
        logger.info(
            "Simulation completed",
            total_simulations=result.total_simulations,
            successful_simulations=result.successful_simulations,
            failed_simulations=result.failed_simulations,
            unique_schedules=len(result.schedule_probabilities)
        )
        
        return result
        
    except Exception as e:
        logger.error("Simulation failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
    )
