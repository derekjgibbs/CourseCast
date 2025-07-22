"""
Pydantic models for simulation requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Callable
from models.optimization_models import CourseInput


class SimulationRequest(BaseModel):
    """Request model for Monte Carlo simulation."""

    budget: float = Field(
        ..., gt=0, description="Maximum budget for courses (must be positive)"
    )
    max_credits: float = Field(
        ...,
        gt=0,
        le=10.0,
        description="Maximum credit hours (must be positive and ≤ 10.0)",
    )
    courses: List[CourseInput] = Field(
        ...,
        min_length=1,
        description="List of courses with utilities (at least 1 required)",
    )
    num_simulations: int = Field(
        default=50, gt=0, le=1000, description="Number of simulations to run (1-1000)"
    )
    seed: Optional[int] = Field(
        default=None, ge=0, description="Base seed for reproducibility (non-negative)"
    )


class CourseStatistics(BaseModel):
    """Statistics for a single course across simulations."""

    uniqueid: int = Field(
        ..., gt=0, description="Unique course identifier (positive integer)"
    )
    probability: float = Field(
        ..., ge=0.0, le=1.0, description="Probability of being selected (0.0-1.0)"
    )
    selection_count: int = Field(
        ..., ge=0, description="Number of times selected (non-negative)"
    )


class ScheduleStatistics(BaseModel):
    """Statistics for a specific schedule combination."""

    courses: List[int] = Field(
        ..., description="List of course unique IDs in this schedule"
    )
    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of this schedule occurring (0.0-1.0)",
    )
    count: int = Field(
        ..., ge=0, description="Number of times this schedule occurred (non-negative)"
    )


class SimulationResponse(BaseModel):
    """Response model for Monte Carlo simulation results."""

    course_probabilities: List[CourseStatistics] = Field(
        ..., description="Individual course selection probabilities"
    )
    schedule_probabilities: List[ScheduleStatistics] = Field(
        ..., description="Schedule combination probabilities"
    )
    total_simulations: int = Field(
        ..., gt=0, description="Total number of simulations run (positive)"
    )
    successful_simulations: int = Field(
        ..., ge=0, description="Number of successful simulations (non-negative)"
    )
    failed_simulations: int = Field(
        ..., ge=0, description="Number of failed simulations (non-negative)"
    )
    message: Optional[str] = Field(
        default=None, description="Additional information or warnings"
    )
