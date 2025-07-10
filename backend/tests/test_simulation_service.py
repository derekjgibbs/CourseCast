"""
Unit tests for SimulationService.
"""

import pytest
from unittest.mock import Mock
from services.simulation_service import SimulationService
from services.data_service import DataService
from services.optimization_service import OptimizationService


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