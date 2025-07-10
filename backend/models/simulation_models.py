"""
Pydantic models for simulation requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Callable
from models.optimization_models import CourseInput


class SimulationRequest(BaseModel):
    """Request model for Monte Carlo simulation."""
    
    budget: float = Field(..., description="Maximum budget for courses")
    max_credits: int = Field(..., description="Maximum credit hours")
    courses: List[CourseInput] = Field(..., description="List of courses with utilities")
    num_simulations: int = Field(default=50, description="Number of simulations to run")
    seed: Optional[int] = Field(default=None, description="Base seed for reproducibility")


class CourseStatistics(BaseModel):
    """Statistics for a single course across simulations."""
    
    uniqueid: str = Field(..., description="Unique course identifier")
    probability: float = Field(..., description="Probability of being selected")
    selection_count: int = Field(..., description="Number of times selected")


class ScheduleStatistics(BaseModel):
    """Statistics for a specific schedule combination."""
    
    courses: List[str] = Field(..., description="List of course unique IDs in this schedule")
    probability: float = Field(..., description="Probability of this schedule occurring")
    count: int = Field(..., description="Number of times this schedule occurred")


class SimulationResponse(BaseModel):
    """Response model for Monte Carlo simulation results."""
    
    course_probabilities: List[CourseStatistics] = Field(..., description="Individual course selection probabilities")
    schedule_probabilities: List[ScheduleStatistics] = Field(..., description="Schedule combination probabilities")
    total_simulations: int = Field(..., description="Total number of simulations run")
    successful_simulations: int = Field(..., description="Number of successful simulations")
    failed_simulations: int = Field(..., description="Number of failed simulations")
    message: Optional[str] = Field(default=None, description="Additional information or warnings")