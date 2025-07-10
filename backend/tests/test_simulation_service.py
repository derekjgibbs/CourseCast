"""
Unit tests for SimulationService.
"""

import pytest
from unittest.mock import Mock
from services.simulation_service import SimulationService
from services.data_service import DataService
from services.optimization_service import OptimizationService
from models.simulation_models import SimulationRequest, SimulationResponse
from models.optimization_models import CourseInput, OptimizationResponse, OptimizedCourse


class TestSimulationService:
    """Test cases for SimulationService."""
    
    def test_simulation_service_can_be_instantiated(self):
        """Test that SimulationService can be instantiated with required dependencies."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        mock_optimization_service = Mock(spec=OptimizationService)
        
        # Act
        service = SimulationService(mock_data_service, mock_optimization_service)
        
        # Assert
        assert service is not None
        assert service.data_service == mock_data_service
        assert service.optimization_service == mock_optimization_service
    
    def test_run_simulation_with_single_iteration(self):
        """Test that run_simulation can handle a single iteration and return proper results."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        mock_optimization_service = Mock(spec=OptimizationService)
        
        # Mock optimization response
        mock_courses = [
            OptimizedCourse(uniqueid=1, price=100.0, credits=3, utility=5.0, selected=True),
            OptimizedCourse(uniqueid=2, price=200.0, credits=4, utility=3.0, selected=False)
        ]
        mock_optimization_response = OptimizationResponse(
            selected_courses=mock_courses,
            total_cost=100.0,
            total_credits=3,
            total_utility=5.0,
            optimization_status="Optimal"
        )
        mock_optimization_service.optimize.return_value = mock_optimization_response
        
        service = SimulationService(mock_data_service, mock_optimization_service)
        
        # Create request with single simulation
        request = SimulationRequest(
            budget=500.0,
            max_credits=9,
            courses=[
                CourseInput(uniqueid=1, utility=5.0),
                CourseInput(uniqueid=2, utility=3.0)
            ],
            num_simulations=1,
            seed=42
        )
        
        # Act
        result = service.run_simulation(request)
        
        # Assert
        assert isinstance(result, SimulationResponse)
        assert result.total_simulations == 1
        assert result.successful_simulations == 1
        assert result.failed_simulations == 0
        assert len(result.course_probabilities) == 2
        assert result.course_probabilities[0].uniqueid == 1
        assert result.course_probabilities[0].probability == 1.0
        assert result.course_probabilities[1].uniqueid == 2
        assert result.course_probabilities[1].probability == 0.0
        assert len(result.schedule_probabilities) == 1
        assert result.schedule_probabilities[0].courses == [1]
        assert result.schedule_probabilities[0].probability == 1.0
    
    def test_run_simulation_with_multiple_iterations(self):
        """Test that run_simulation handles multiple iterations with different results."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        mock_optimization_service = Mock(spec=OptimizationService)
        
        # Mock different optimization responses for different seeds
        mock_courses_result1 = [
            OptimizedCourse(uniqueid=1, price=100.0, credits=3, utility=5.0, selected=True),
            OptimizedCourse(uniqueid=2, price=200.0, credits=4, utility=3.0, selected=False)
        ]
        mock_courses_result2 = [
            OptimizedCourse(uniqueid=1, price=100.0, credits=3, utility=5.0, selected=False),
            OptimizedCourse(uniqueid=2, price=200.0, credits=4, utility=3.0, selected=True)
        ]
        
        mock_response1 = OptimizationResponse(
            selected_courses=mock_courses_result1,
            total_cost=100.0,
            total_credits=3,
            total_utility=5.0,
            optimization_status="Optimal"
        )
        mock_response2 = OptimizationResponse(
            selected_courses=mock_courses_result2,
            total_cost=200.0,
            total_credits=4,
            total_utility=3.0,
            optimization_status="Optimal"
        )
        
        # Configure mock to return different responses based on call order
        mock_optimization_service.optimize.side_effect = [mock_response1, mock_response2]
        
        service = SimulationService(mock_data_service, mock_optimization_service)
        
        # Create request with multiple simulations
        request = SimulationRequest(
            budget=500.0,
            max_credits=9,
            courses=[
                CourseInput(uniqueid=1, utility=5.0),
                CourseInput(uniqueid=2, utility=3.0)
            ],
            num_simulations=2,
            seed=42
        )
        
        # Act
        result = service.run_simulation(request)
        
        # Assert
        assert isinstance(result, SimulationResponse)
        assert result.total_simulations == 2
        assert result.successful_simulations == 2
        assert result.failed_simulations == 0
        
        # Check course probabilities (both courses should have 0.5 probability)
        assert len(result.course_probabilities) == 2
        course1_stats = next(cp for cp in result.course_probabilities if cp.uniqueid == 1)
        course2_stats = next(cp for cp in result.course_probabilities if cp.uniqueid == 2)
        assert course1_stats.probability == 0.5
        assert course1_stats.selection_count == 1
        assert course2_stats.probability == 0.5
        assert course2_stats.selection_count == 1
        
        # Check schedule probabilities (two different schedules, each with 0.5 probability)
        assert len(result.schedule_probabilities) == 2
        assert result.schedule_probabilities[0].probability == 0.5
        assert result.schedule_probabilities[1].probability == 0.5
        assert result.schedule_probabilities[0].count == 1
        assert result.schedule_probabilities[1].count == 1
    
    def test_run_simulation_handles_optimization_failures(self):
        """Test that run_simulation handles failures in individual optimization runs."""
        # Arrange
        mock_data_service = Mock(spec=DataService)
        mock_optimization_service = Mock(spec=OptimizationService)
        
        # Mock one successful response and one that raises an exception
        mock_courses = [
            OptimizedCourse(uniqueid=1, price=100.0, credits=3, utility=5.0, selected=True),
            OptimizedCourse(uniqueid=2, price=200.0, credits=4, utility=3.0, selected=False)
        ]
        mock_success_response = OptimizationResponse(
            selected_courses=mock_courses,
            total_cost=100.0,
            total_credits=3,
            total_utility=5.0,
            optimization_status="Optimal"
        )
        
        # Configure mock to succeed once then fail once
        mock_optimization_service.optimize.side_effect = [mock_success_response, Exception("Optimization failed")]
        
        service = SimulationService(mock_data_service, mock_optimization_service)
        
        # Create request with 2 simulations, but only 1 will succeed
        request = SimulationRequest(
            budget=500.0,
            max_credits=9,
            courses=[
                CourseInput(uniqueid=1, utility=5.0),
                CourseInput(uniqueid=2, utility=3.0)
            ],
            num_simulations=2,
            seed=42
        )
        
        # Act
        result = service.run_simulation(request)
        
        # Assert
        assert isinstance(result, SimulationResponse)
        assert result.total_simulations == 2
        assert result.successful_simulations == 1
        assert result.failed_simulations == 1
        
        # Course probabilities based on 1 successful simulation
        assert len(result.course_probabilities) == 2
        course1_stats = next(cp for cp in result.course_probabilities if cp.uniqueid == 1)
        course2_stats = next(cp for cp in result.course_probabilities if cp.uniqueid == 2)
        assert course1_stats.probability == 1.0  # Selected in 1 out of 1 successful simulation
        assert course1_stats.selection_count == 1
        assert course2_stats.probability == 0.0  # Not selected in the successful simulation
        assert course2_stats.selection_count == 0