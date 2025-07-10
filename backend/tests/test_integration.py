"""
Integration tests for the data processing service.

This module tests the complete data processing pipeline with real-world scenarios.
"""

import pytest
import pandas as pd
from datetime import time
import tempfile
import os

from services.data_service import DataService
from models.data_models import PreprocessingConfig


class TestDataServiceIntegration:
    """Integration tests for the complete data processing pipeline."""
    
    def test_complete_processing_pipeline(self):
        """Test the complete data processing pipeline with realistic data."""
        # Create test data similar to the original Excel file
        test_data = pd.DataFrame({
            'primary_section_id': [
                'STAT6130001', 'ACCT7970002', 'MGMT6110003',
                'FNCE6110004', 'OIDD6910005', 'REAL7210006'
            ],
            'term': ['Spring 2025'] * 6,
            'title': ['Stats', 'Tax', 'Management', 'Finance', 'Decision', 'Real Estate'],
            'instructor': ['Dr. A', 'Dr. B', 'Dr. C', 'Dr. D', 'Dr. E', 'Dr. F'],
            'part_of_term': ['1', '2', 'F', 'S', 'M', '3'],
            'days_code': ['MW', 'TR', 'MW', 'TR', 'F', 'TBA'],
            'start_time_24hr': [
                time(8, 30), time(10, 15), time(12, 0),
                time(13, 45), time(15, 30), time(0, 0)
            ],
            'stop_time_24hr': [
                time(10, 15), time(12, 0), time(13, 45),
                time(15, 30), time(17, 15), time(0, 0)
            ],
            'start_date': pd.to_datetime(['2025-01-15'] * 6),
            'end_date': pd.to_datetime(['2025-04-30'] * 6),
            'capacity': [50, 40, 60, 55, 45, 30],
            'price_predicted': [1000.0, 1200.0, 1100.0, 1150.0, 1050.0, 1300.0],
            'resid_mean': [100.0, 150.0, 120.0, 130.0, 110.0, 160.0],
            'resid_stdev': [50.0, 75.0, 60.0, 65.0, 55.0, 80.0],
            'uniqueid': [1, 2, 3, 4, 5, 6]
        })
        
        # Create temporary Excel file
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
            test_data.to_excel(tmp.name, index=False)
            tmp_path = tmp.name
        
        try:
            # Initialize service
            service = DataService()
            
            # Process data
            result = service.process_course_data(tmp_path, 1)
            
            # Verify results
            assert len(result) == 6
            
            # Check course ID mapping worked
            assert result.loc[0, 'course_id'] == 'FC_STAT'  # STAT6130 -> FC_STAT
            assert result.loc[1, 'course_id'] == 'TABS'     # ACCT7970 -> TABS
            assert result.loc[2, 'course_id'] == 'FC_MGMT'  # MGMT6110 -> FC_MGMT
            assert result.loc[3, 'course_id'] == 'FC_FNCE'  # FNCE6110 -> FC_FNCE
            assert result.loc[4, 'course_id'] == 'NEGO'     # OIDD6910 -> NEGO
            assert result.loc[5, 'course_id'] == 'REIAF'    # REAL7210 -> REIAF
            
            # Check section codes
            assert result.loc[0, 'section_code'] == '001'
            assert result.loc[1, 'section_code'] == '002'
            
            # Check prices were calculated
            assert 'price' in result.columns
            assert all(result['price'] > 0)
            assert all(result['price'] <= 4851)
            
            # Check class time fields were created
            class_time_columns = [col for col in result.columns if col.startswith('ct_')]
            assert len(class_time_columns) > 0
            
            # Verify specific class time conflicts
            # STAT6130001 is MW 8:30-10:15 in Q1
            assert 'ct_q1MA' in result.columns
            assert result.loc[0, 'ct_q1MA'] == 1  # Monday 8:30
            assert 'ct_q1WA' in result.columns
            assert result.loc[0, 'ct_q1WA'] == 1  # Wednesday 8:30
            
            # Validate the processed data
            assert service.validate_course_data(result)
            
        finally:
            os.unlink(tmp_path)
    
    def test_monte_carlo_price_variation(self):
        """Test that different seeds produce different prices."""
        # Create simple test data
        test_data = pd.DataFrame({
            'primary_section_id': ['STAT6130001'],
            'part_of_term': ['1'],
            'days_code': ['MW'],
            'start_time_24hr': [time(8, 30)],
            'stop_time_24hr': [time(10, 15)],
            'price_predicted': [1000.0],
            'resid_mean': [0.0],
            'resid_stdev': [100.0],
            'uniqueid': [1]
        })
        
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
            test_data.to_excel(tmp.name, index=False)
            tmp_path = tmp.name
        
        try:
            service = DataService()
            
            # Process with different seeds
            result1 = service.process_course_data(tmp_path, 1)
            result2 = service.process_course_data(tmp_path, 2)
            result3 = service.process_course_data(tmp_path, 3)
            
            # Prices should be different due to different z-scores
            price1 = result1.loc[0, 'price']
            price2 = result2.loc[0, 'price']
            price3 = result3.loc[0, 'price']
            
            # With different seeds, at least one price should be different
            assert not (price1 == price2 == price3)
            
        finally:
            os.unlink(tmp_path)
    
    def test_custom_configuration(self):
        """Test data processing with custom configuration."""
        # Create custom config that doesn't drop 'capacity' column
        custom_config = PreprocessingConfig(
            drop_columns=['term', 'title', 'instructor', 'start_date', 'end_date']
        )
        
        test_data = pd.DataFrame({
            'primary_section_id': ['STAT6130001'],
            'term': ['Spring 2025'],
            'title': ['Statistics'],
            'instructor': ['Dr. Smith'],
            'part_of_term': ['1'],
            'days_code': ['MW'],
            'start_time_24hr': [time(8, 30)],
            'stop_time_24hr': [time(10, 15)],
            'start_date': pd.to_datetime('2025-01-15'),
            'end_date': pd.to_datetime('2025-04-30'),
            'capacity': [50],
            'price_predicted': [1000.0],
            'resid_mean': [100.0],
            'resid_stdev': [50.0],
            'uniqueid': [1]
        })
        
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
            test_data.to_excel(tmp.name, index=False)
            tmp_path = tmp.name
        
        try:
            # Initialize service with custom config
            service = DataService(config=custom_config)
            
            # Process data
            result = service.process_course_data(tmp_path, 1)
            
            # Capacity should still be present
            assert 'capacity' in result.columns
            assert result.loc[0, 'capacity'] == 50
            
            # But other columns should be dropped
            assert 'term' not in result.columns
            assert 'title' not in result.columns
            
        finally:
            os.unlink(tmp_path)