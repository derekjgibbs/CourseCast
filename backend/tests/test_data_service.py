"""
Test suite for the data processing service.

This module contains comprehensive tests for the RandomManager, PreProcessor,
and DataService classes using TDD approach.
"""

import pytest
import pandas as pd
from datetime import time, datetime
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import tempfile
import os

from services.data_service import RandomManager, PreProcessor, DataService
from models.data_models import (
    CourseData, ProcessedCourseData, ZScoreTable, 
    PreprocessingConfig, PriceForecastInput, PriceForecastOutput
)


class TestRandomManager:
    """Test suite for RandomManager class."""
    
    def test_init_loads_z_score_table(self):
        """Test that RandomManager initializes and loads z-score table."""
        from services.data_service import RandomManager
        
        # Arrange & Act
        manager = RandomManager()
        
        # Assert
        assert hasattr(manager, 'ztable')
        assert hasattr(manager, 'rand_z_table_filepath')
        assert manager.ztable is not None
        assert not manager.ztable.empty
    
    def test_init_with_custom_filepath(self):
        """Test RandomManager initialization with custom filepath."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_get_rand_z_series_returns_correct_series(self, temp_z_score_file):
        """Test getRandZSeries returns correct series for given seed."""
        from services.data_service import RandomManager
        
        # Arrange
        manager = RandomManager(temp_z_score_file)
        
        # Act
        series = manager.getRandZSeries('seed1')
        
        # Assert
        assert len(series) == 5
        assert list(series) == [0.1, 0.2, 0.3, 0.4, 0.5]
    
    def test_get_rand_z_series_with_invalid_seed(self, temp_z_score_file):
        """Test getRandZSeries handles invalid seed gracefully."""
        from services.data_service import RandomManager
        
        # Arrange
        manager = RandomManager(temp_z_score_file)
        
        # Act & Assert
        with pytest.raises(KeyError):
            manager.getRandZSeries('invalid_seed')
    
    def test_z_table_file_not_found_raises_error(self):
        """Test that missing z-score table file raises appropriate error."""
        # RED: Should fail - error handling doesn't exist yet
        pass


class TestPreProcessor:
    """Test suite for PreProcessor class."""
    
    def test_init_creates_preprocessor(self):
        """Test PreProcessor initialization."""
        from services.data_service import PreProcessor
        
        # Arrange & Act
        preprocessor = PreProcessor()
        
        # Assert
        assert preprocessor is not None
        assert hasattr(preprocessor, 'config')
    
    def test_preprocess_drops_unused_columns(self, sample_course_data):
        """Test that preprocess drops specified columns."""
        from services.data_service import PreProcessor
        
        # Arrange
        preprocessor = PreProcessor()
        original_columns = set(sample_course_data.columns)
        
        # Act
        result = preprocessor.preprocess(sample_course_data)
        
        # Assert
        dropped_columns = {'term', 'title', 'instructor', 'start_date', 'end_date', 'capacity'}
        remaining_columns = set(result.columns)
        
        assert dropped_columns.isdisjoint(remaining_columns)
        assert 'primary_section_id' in remaining_columns
        assert 'course_id' in remaining_columns
        assert 'section_code' in remaining_columns
    
    def test_preprocess_primary_section_id_splits_correctly(self):
        """Test primary section ID preprocessing splits course_id and section_code."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_preprocess_primary_section_id_maps_course_codes(self):
        """Test course ID mapping for cross-listed courses."""
        from services.data_service import PreProcessor
        
        # Arrange
        test_data = pd.DataFrame({
            'primary_section_id': ['STAT6130001', 'ACCT7970002', 'MGMT6110003'],
            'part_of_term': ['1', '2', 'F'],
            'days_code': ['MW', 'TR', 'M'],
            'start_time_24hr': [time(8, 30), time(10, 15), time(13, 45)],
            'stop_time_24hr': [time(10, 15), time(12, 0), time(15, 30)],
            'price_predicted': [1000.0, 1200.0, 1100.0],
            'resid_mean': [100.0, 150.0, 120.0],
            'resid_stdev': [50.0, 75.0, 60.0],
            'uniqueid': [1, 2, 3]
        })
        preprocessor = PreProcessor()
        
        # Act
        result = preprocessor.preprocess(test_data)
        
        # Assert
        assert result.loc[0, 'course_id'] == 'FC_STAT'  # STAT6130 should map to FC_STAT
        assert result.loc[1, 'course_id'] == 'TABS'     # ACCT7970 should map to TABS
        assert result.loc[2, 'course_id'] == 'FC_MGMT'  # MGMT6110 should map to FC_MGMT
        assert result.loc[0, 'section_code'] == '001'
        assert result.loc[1, 'section_code'] == '002'
        assert result.loc[2, 'section_code'] == '003'
    
    def test_preprocess_class_time_creates_conflict_fields(self):
        """Test class time preprocessing creates conflict detection fields."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_get_terms_maps_correctly(self):
        """Test part_of_term mapping to quarter codes."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_get_days_maps_correctly(self):
        """Test days_code mapping to individual days."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_get_time_class_handles_short_classes(self):
        """Test time class calculation for classes <= 2 hours."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_get_time_class_handles_long_classes(self):
        """Test time class calculation for classes > 2 hours."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_setup_price_calculates_correctly(self, sample_course_data, temp_z_score_file):
        """Test price calculation with z-score."""
        from services.data_service import PreProcessor
        
        # Arrange
        preprocessor = PreProcessor()
        processed_data = preprocessor.preprocess(sample_course_data)
        
        # Act
        result = preprocessor.setupPrice(processed_data, 'seed1', temp_z_score_file)
        
        # Assert
        assert 'price' in result.columns
        # Price should be: price_predicted + resid_mean + z * resid_stdev
        # For first row: 1000 + 100 + 0.1 * 50 = 1105
        expected_price_0 = 1000.0 + 100.0 + 0.1 * 50.0
        assert abs(result.loc[0, 'price'] - expected_price_0) < 0.01
    
    def test_setup_price_caps_at_min_max(self):
        """Test price calculation caps at 0 and 4851."""
        # RED: Should fail - method doesn't exist yet
        pass


class TestDataService:
    """Test suite for DataService class."""
    
    def test_init_creates_data_service(self):
        """Test DataService initialization."""
        # RED: Should fail - DataService doesn't exist yet
        pass
    
    def test_load_excel_file_success(self):
        """Test successful Excel file loading."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_load_excel_file_not_found(self):
        """Test Excel file loading with missing file."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_validate_course_data_success(self):
        """Test course data validation with valid data."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_validate_course_data_missing_columns(self):
        """Test course data validation with missing required columns."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_process_course_data_end_to_end(self):
        """Test complete course data processing pipeline."""
        # RED: Should fail - method doesn't exist yet
        pass
    
    def test_forecast_prices_with_seed(self):
        """Test price forecasting with specific seed."""
        # RED: Should fail - method doesn't exist yet
        pass


# Test fixtures
@pytest.fixture
def sample_course_data():
    """Sample course data for testing."""
    return pd.DataFrame({
        'primary_section_id': ['STAT6130001', 'ACCT6110001', 'FNCE6110001'],
        'term': ['Spring 2025', 'Spring 2025', 'Spring 2025'],
        'title': ['Statistics', 'Accounting', 'Finance'],
        'instructor': ['Dr. Smith', 'Dr. Jones', 'Dr. Brown'],
        'part_of_term': ['1', '2', 'F'],
        'days_code': ['MW', 'TR', 'M'],
        'start_time_24hr': [time(8, 30), time(10, 15), time(13, 45)],
        'stop_time_24hr': [time(10, 15), time(12, 0), time(15, 30)],
        'start_date': [datetime(2025, 1, 15), datetime(2025, 3, 1), datetime(2025, 1, 15)],
        'end_date': [datetime(2025, 3, 1), datetime(2025, 4, 30), datetime(2025, 4, 30)],
        'capacity': [50, 40, 60],
        'price_predicted': [1000.0, 1200.0, 1100.0],
        'resid_mean': [100.0, 150.0, 120.0],
        'resid_stdev': [50.0, 75.0, 60.0],
        'uniqueid': [1, 2, 3]
    })


@pytest.fixture
def sample_z_score_table():
    """Sample z-score table for testing."""
    return pd.DataFrame({
        'seed1': [0.1, 0.2, 0.3, 0.4, 0.5],
        'seed2': [-0.1, -0.2, 0.1, 0.2, 0.3],
        'seed3': [0.5, -0.5, 0.0, 0.1, -0.1]
    })


@pytest.fixture
def temp_z_score_file(sample_z_score_table):
    """Create temporary z-score table file."""
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
        sample_z_score_table.to_excel(tmp.name, index=False)
        yield tmp.name
        os.unlink(tmp.name)