"""
Tests for the OptimizationService class.
"""

import pytest
import pandas as pd
import pulp
from unittest.mock import Mock, patch
from services.optimization_service import OptimizationService
from models.optimization_models import OptimizationRequest, CourseInput, OptimizationResponse
from services.data_service import DataService


class TestOptimizationService:
    """Test cases for OptimizationService."""

    def test_optimization_service_initialization(self):
        """Test that OptimizationService can be initialized with DataService."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        
        # Act
        service = OptimizationService(data_service=mock_data_service)
        
        # Assert
        assert service is not None
        assert service.data_service == mock_data_service
        assert hasattr(service, 'optimize')
        assert callable(service.optimize)

    def test_budget_constraint_prevents_over_budget_selection(self):
        """Test that budget constraint prevents selecting courses exceeding budget."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        service = OptimizationService(data_service=mock_data_service)
        
        # Mock course data with prices that exceed budget
        course_data = pd.DataFrame({
            'uniqueid': [1, 2, 3],
            'price': [3000, 2500, 2000],  # Total 7500, exceeding budget of 5000
            'credits': [1.0, 1.0, 1.0],
            'course_id': ['COURSE1', 'COURSE2', 'COURSE3'],
            'ct_MW_09': [1, 0, 0],
            'ct_MW_11': [0, 1, 0],
            'ct_TR_14': [0, 0, 1]
        })
        
        mock_data_service.process_course_data.return_value = course_data
        
        request = OptimizationRequest(
            budget=5000,
            max_credits=3.0,
            seed=1,
            courses=[
                CourseInput(uniqueid=1, utility=80),
                CourseInput(uniqueid=2, utility=70),
                CourseInput(uniqueid=3, utility=60)
            ]
        )
        
        # Act
        result = service.optimize(request)
        
        # Assert
        assert isinstance(result, OptimizationResponse)
        assert result.total_cost <= 5000, "Total cost should not exceed budget"
        assert len(result.selected_courses) >= 1, "At least one course should be selected"
        assert result.optimization_status in ["Optimal", "Feasible"], "Should find feasible solution"

    def test_credit_constraint_prevents_over_credit_selection(self):
        """Test that credit constraint prevents selecting courses exceeding max credits."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        service = OptimizationService(data_service=mock_data_service)
        
        # Mock course data with credits that exceed limit
        course_data = pd.DataFrame({
            'uniqueid': [1, 2, 3],
            'price': [1000, 1000, 1000],  # All within budget
            'credits': [2.0, 2.0, 2.0],  # Total 6.0, exceeding max_credits of 4.0
            'course_id': ['COURSE1', 'COURSE2', 'COURSE3'],
            'ct_MW_09': [1, 0, 0],
            'ct_MW_11': [0, 1, 0],
            'ct_TR_14': [0, 0, 1]
        })
        
        mock_data_service.process_course_data.return_value = course_data
        
        request = OptimizationRequest(
            budget=5000,  # High budget
            max_credits=4.0,  # Limited credits
            seed=1,
            courses=[
                CourseInput(uniqueid=1, utility=80),
                CourseInput(uniqueid=2, utility=70),
                CourseInput(uniqueid=3, utility=60)
            ]
        )
        
        # Act
        result = service.optimize(request)
        
        # Assert
        assert isinstance(result, OptimizationResponse)
        assert result.total_credits <= 4.0, "Total credits should not exceed max_credits"
        assert len(result.selected_courses) >= 1, "At least one course should be selected"
        assert result.optimization_status in ["Optimal", "Feasible"], "Should find feasible solution"

    def test_time_conflict_constraint_prevents_overlapping_classes(self):
        """Test that time conflict constraint prevents selecting overlapping courses."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        service = OptimizationService(data_service=mock_data_service)
        
        # Mock course data with time conflicts
        course_data = pd.DataFrame({
            'uniqueid': [1, 2, 3],
            'price': [1000, 1000, 1000],
            'credits': [1.0, 1.0, 1.0], 
            'course_id': ['COURSE1', 'COURSE2', 'COURSE3'],
            'ct_MW_09': [1, 1, 0],  # Course 1 and 2 conflict on MW 9am
            'ct_MW_11': [0, 0, 0],
            'ct_TR_14': [0, 0, 1]   # Course 3 is on TR 2pm (no conflict)
        })
        
        mock_data_service.process_course_data.return_value = course_data
        
        request = OptimizationRequest(
            budget=5000,
            max_credits=5.0,
            seed=1,
            courses=[
                CourseInput(uniqueid=1, utility=90),
                CourseInput(uniqueid=2, utility=85),  # High utility but conflicts with course 1
                CourseInput(uniqueid=3, utility=60)
            ]
        )
        
        # Act
        result = service.optimize(request)
        
        # Assert
        assert isinstance(result, OptimizationResponse)
        selected_course_ids = [c.uniqueid for c in result.selected_courses if c.selected]
        
        # Should not select both course 1 and 2 due to time conflict
        conflicting_courses_selected = len([cid for cid in selected_course_ids if cid in [1, 2]])
        assert conflicting_courses_selected <= 1, "Should not select conflicting courses 1 and 2"
        
        assert len(selected_course_ids) >= 1, "At least one course should be selected"
        assert result.optimization_status in ["Optimal", "Feasible"], "Should find feasible solution"

    def test_course_duplicate_constraint_prevents_multiple_sections(self):
        """Test that course duplicate constraint allows max one section per course."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        service = OptimizationService(data_service=mock_data_service)
        
        # Mock course data with multiple sections of same course
        course_data = pd.DataFrame({
            'uniqueid': [1, 2, 3],
            'price': [1000, 1200, 1500],
            'credits': [1.0, 1.0, 1.0], 
            'course_id': ['FNCE101', 'FNCE101', 'MGMT200'],  # Two sections of FNCE101
            'ct_MW_09': [1, 0, 0],
            'ct_MW_11': [0, 1, 0],  # Different times to avoid time conflicts
            'ct_TR_14': [0, 0, 1]
        })
        
        mock_data_service.process_course_data.return_value = course_data
        
        request = OptimizationRequest(
            budget=5000,
            max_credits=5.0,
            seed=1,
            courses=[
                CourseInput(uniqueid=1, utility=80),
                CourseInput(uniqueid=2, utility=85),  # Same course_id as course 1
                CourseInput(uniqueid=3, utility=60)
            ]
        )
        
        # Act
        result = service.optimize(request)
        
        # Assert
        assert isinstance(result, OptimizationResponse)
        selected_course_ids = [c.uniqueid for c in result.selected_courses if c.selected]
        
        # Should not select both sections of FNCE101 (course 1 and 2)
        fnce_sections_selected = len([cid for cid in selected_course_ids if cid in [1, 2]])
        assert fnce_sections_selected <= 1, "Should not select multiple sections of same course"
        
        assert len(selected_course_ids) >= 1, "At least one course should be selected"
        assert result.optimization_status in ["Optimal", "Feasible"], "Should find feasible solution"

    def test_error_handling_for_infeasible_solutions(self):
        """Test that optimization handles edge cases gracefully."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        service = OptimizationService(data_service=mock_data_service)
        
        # Mock course data where no courses can be selected due to constraints
        # All courses exceed both budget AND credit constraints simultaneously
        course_data = pd.DataFrame({
            'uniqueid': [1, 2],
            'price': [6000, 7000],  # All courses exceed budget of 5000
            'credits': [3.0, 4.0],  # All courses exceed max_credits of 2.0
            'course_id': ['COURSE1', 'COURSE2'],
            'ct_MW_09': [1, 0],  # No time conflicts
            'ct_MW_11': [0, 1]
        })
        
        mock_data_service.process_course_data.return_value = course_data
        
        request = OptimizationRequest(
            budget=5000,  # Budget too low for any course
            max_credits=2.0,  # Credits too low for any course
            seed=1,
            courses=[
                CourseInput(uniqueid=1, utility=80),
                CourseInput(uniqueid=2, utility=70)
            ]
        )
        
        # Act
        result = service.optimize(request)
        
        # Assert
        assert isinstance(result, OptimizationResponse)
        # With no courses fitting constraints, the problem should be "Optimal" with empty solution
        # PuLP considers an empty feasible solution as "Optimal" (not infeasible)
        assert result.optimization_status == "Optimal", "Should find optimal empty solution"
        assert result.total_cost == 0, "No courses should be selected when none fit constraints"
        assert result.total_credits == 0, "No credits when no courses selected"
        # Check that no courses are actually selected
        selected_courses = [c for c in result.selected_courses if c.selected]
        assert len(selected_courses) == 0, "No courses should be selected when none fit constraints"

