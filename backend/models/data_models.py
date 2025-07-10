"""
Data models for the CourseCast data processing service.

This module defines Pydantic models for data structures used in course data processing,
including course information, preprocessing results, and price forecasting data.
"""

from datetime import datetime, time
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict


class CourseData(BaseModel):
    """Model for raw course data from Excel files."""

    primary_section_id: str = Field(
        ..., description="Primary section ID in format COURSE####SEC"
    )
    term: Optional[str] = Field(None, description="Academic term")
    title: Optional[str] = Field(None, description="Course title")
    instructor: Optional[str] = Field(None, description="Instructor name")
    part_of_term: str = Field(..., description="Part of term (1,2,3,4,F,S,M,Modular)")
    days_code: str = Field(..., description="Days code (M,T,W,R,F,S,U,MW,TR,FS,TBA)")
    start_time_24hr: time = Field(..., description="Start time in 24-hour format")
    stop_time_24hr: time = Field(..., description="Stop time in 24-hour format")
    start_date: Optional[datetime] = Field(None, description="Start date")
    end_date: Optional[datetime] = Field(None, description="End date")
    capacity: Optional[int] = Field(None, description="Course capacity")
    price_predicted: float = Field(..., description="Predicted price for the course")
    resid_mean: float = Field(..., description="Residual mean for price prediction")
    resid_stdev: float = Field(
        ..., description="Residual standard deviation for price prediction"
    )
    uniqueid: int = Field(..., description="Unique identifier for the course section")

    model_config = ConfigDict(
        json_encoders={time: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}
    )


class ProcessedCourseData(BaseModel):
    """Model for processed course data after preprocessing."""

    primary_section_id: str
    course_id: str = Field(..., description="Processed course ID (may be mapped)")
    section_code: str = Field(
        ..., description="Section code extracted from primary_section_id"
    )
    part_of_term: str
    days_code: str
    start_time_24hr: time
    stop_time_24hr: time
    price_predicted: float
    resid_mean: float
    resid_stdev: float
    uniqueid: int
    price: Optional[float] = Field(
        None, description="Final calculated price with uncertainty"
    )

    # Dynamic class time fields will be added during processing
    class_time_fields: Dict[str, int] = Field(
        default_factory=dict, description="Class time conflict fields"
    )

    model_config = ConfigDict(
        json_encoders={time: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}
    )


class ZScoreTable(BaseModel):
    """Model for Z-score table data."""

    data: Dict[str, List[float]] = Field(..., description="Z-score table data by seed")

    @field_validator("data")
    @classmethod
    def validate_data(cls, v):
        if not v:
            raise ValueError("Z-score table data cannot be empty")
        return v


class PreprocessingConfig(BaseModel):
    """Configuration for data preprocessing."""

    drop_columns: List[str] = Field(
        default=["term", "title", "instructor", "start_date", "end_date", "capacity"],
        description="Columns to drop during preprocessing",
    )
    course_id_mapping: Dict[str, str] = Field(
        default_factory=lambda: {
            "STAT6130": "FC_STAT",
            "STAT6210": "FC_STAT",
            "WHCP6160": "FC_WHCP",
            "WHCP6180": "FC_WHCP",
            "ACCT6110": "FC_ACCT",
            "ACCT6130": "FC_ACCT",
            "FNCE6110": "FC_FNCE",
            "FNCE6210": "FC_FNCE",
            "FNCE6130": "FC_MACRO",
            "FNCE6230": "FC_MACRO",
            "MGMT6110": "FC_MGMT",
            "MGMT6120": "FC_MGMT",
            "MKTG6120": "FC_MKTG",
            "MKTG6130": "FC_MKTG",
            # Cross-listed courses mapping
            "ACCT7970": "TABS",
            "FNCE7970": "TABS",
            "BEPP7630": "EMAP",
            "OIDD7630": "EMAP",
            "LGST8050": "AABT",
            "MKTG7600": "AABT",
            "LGST8060": "NEGO",
            "MGMT6910": "NEGO",
            "OIDD6910": "NEGO",
            "LGST8090": "SBM",
            "MGMT8150": "SBM",
            "MGMT7290": "IPSIDE",
            "LGST7290": "IPSIDE",
            "OIDD6900": "MDM",
            "MGMT6900": "MDM",
            "OIDD6930": "INFL",
            "LGST6930": "INFL",
            "OIDD7610": "RAEM",
            "BEPP7610": "RAEM",
            "REAL7080": "HM",
            "BEPP7080": "HM",
            "REAL7210": "REIAF",
            "FNCE7210": "REIAF",
            "REAL8040": "REL",
            "LGST8040": "REL",
            "REAL8360": "IHC",
            "BEPP8360": "IHC",
            "STAT7770": "IPDS",
            "OIDD7770": "IPDS",
        },
        description="Mapping of course IDs to standardized names",
    )
    term_mapping: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "1": ["q1"],
            "2": ["q2"],
            "3": ["q3"],
            "4": ["q4"],
            "F": ["q1", "q2"],
            "S": ["q3", "q4"],
            "M": ["mod"],
            "Modular": ["mod"],
        },
        description="Mapping of part_of_term to quarter codes",
    )
    days_mapping: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "M": ["M"],
            "T": ["T"],
            "W": ["W"],
            "R": ["R"],
            "F": ["F"],
            "S": ["S"],
            "U": ["U"],
            "MW": ["M", "W"],
            "TR": ["T", "R"],
            "FS": ["F", "S"],
            "TBA": ["TBA"],
        },
        description="Mapping of days codes to individual days",
    )
    time_mapping: Dict[str, str] = Field(
        default_factory=lambda: {
            "08:30:00": "A",
            "10:15:00": "B",
            "12:00:00": "C",
            "13:45:00": "D",
            "15:30:00": "E",
            "17:15:00": "F",
            "19:00:00": "G",
            "20:45:00": "H",
            "22:30:00": "I",
            "00:00:00": "Z",
        },
        description="Mapping of start times to class periods",
    )


class PriceForecastInput(BaseModel):
    """Input model for price forecasting."""

    course_data: List[ProcessedCourseData]
    seed: str = Field(..., description="Seed for random number generation")
    start_of_uniqueid: int = Field(
        default=1, description="Starting unique ID for indexing"
    )


class PriceForecastOutput(BaseModel):
    """Output model for price forecasting results."""

    updated_course_data: List[ProcessedCourseData]
    seed_used: str
    total_courses_processed: int
    price_range: Dict[str, float] = Field(description="Min and max prices calculated")


class DataServiceError(BaseModel):
    """Error model for data service operations."""

    error_type: str = Field(..., description="Type of error")
    error_message: str = Field(..., description="Detailed error message")
    context: Optional[Dict[str, Any]] = Field(
        None, description="Additional error context"
    )
