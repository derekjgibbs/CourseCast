"""
Tests for the OptimizationService class.
"""

import pytest
import pandas as pd
from unittest.mock import Mock, patch
from services.optimization_service import OptimizationService
from models.optimization_models import OptimizationRequest, CourseInput
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