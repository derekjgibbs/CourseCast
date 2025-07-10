"""
Tests for the OptimizationService class.
"""

import pytest
import pandas as pd
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