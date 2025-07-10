"""
Pydantic models for optimization service requests and responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CourseInput(BaseModel):
    """Input model for a course with utility value."""
    uniqueid: int = Field(..., description="Unique course identifier")
    utility: float = Field(..., ge=0, le=100, description="Utility value (0-100)")


class OptimizationRequest(BaseModel):
    """Request model for course optimization."""
    budget: float = Field(..., gt=0, description="Available budget for courses")
    max_credits: float = Field(..., gt=0, le=10, description="Maximum credit units allowed")
    seed: int = Field(..., ge=0, description="Random seed for price calculation")
    courses: List[CourseInput] = Field(..., min_length=1, description="List of courses with utilities")

    @field_validator('courses')
    @classmethod
    def validate_unique_courses(cls, v):
        """Ensure all course IDs are unique."""
        course_ids = [course.uniqueid for course in v]
        if len(course_ids) != len(set(course_ids)):
            raise ValueError("Duplicate course IDs are not allowed")
        return v


class OptimizedCourse(BaseModel):
    """Model for an optimized course result."""
    uniqueid: int = Field(..., description="Unique course identifier")
    price: float = Field(..., description="Calculated course price")
    credits: Optional[float] = Field(None, description="Course credit units")
    utility: Optional[float] = Field(None, description="Course utility value")
    selected: bool = Field(..., description="Whether course was selected in optimization")


class OptimizationResponse(BaseModel):
    """Response model for optimization results."""
    selected_courses: List[OptimizedCourse] = Field(..., description="Courses selected by optimization")
    total_cost: float = Field(..., description="Total cost of selected courses")
    total_credits: float = Field(..., description="Total credits of selected courses")
    total_utility: float = Field(..., description="Total utility of selected courses")
    optimization_status: str = Field(..., description="Status of optimization (Optimal, Infeasible, etc.)")
    message: Optional[str] = Field(None, description="Additional information about the optimization")


class OptimizationError(BaseModel):
    """Error model for optimization failures."""
    error_type: str = Field(..., description="Type of error")
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Additional error details")