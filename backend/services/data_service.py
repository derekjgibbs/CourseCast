"""
Data processing service for CourseCast.

This module contains the RandomManager, PreProcessor, and DataService classes
for handling course data processing, z-score table management, and price forecasting.
"""

import pandas as pd
from pathlib import Path
import datetime
from typing import List


class RandomManager:
    """Manages Z-score table operations for Monte Carlo simulations."""
    
    def __init__(self, z_table_filepath: str = None):
        """Initialize RandomManager and load z-score table.
        
        Args:
            z_table_filepath: Path to z-score table Excel file. 
                            Defaults to 'data/z_score_table.xlsx'.
        """
        if z_table_filepath is None:
            z_table_filepath = str(Path(__file__).parent.parent / "data" / "z_score_table.xlsx")
        
        self.rand_z_table_filepath = z_table_filepath
        self.ztable = pd.read_excel(self.rand_z_table_filepath)
    
    def getRandZSeries(self, seed: str) -> pd.Series:
        """Get random Z-series for a given seed.
        
        Args:
            seed: Seed column name in the z-score table.
            
        Returns:
            Pandas Series containing z-scores for the given seed.
        """
        return self.ztable[seed]


class PreProcessor:
    """Preprocesses course data for optimization and simulation."""
    
    def __init__(self, config=None):
        """Initialize PreProcessor with optional configuration.
        
        Args:
            config: PreprocessingConfig object with custom settings.
                   Defaults to standard configuration if not provided.
        """
        from models.data_models import PreprocessingConfig
        
        self.config = config or PreprocessingConfig()
        self.df = None
    
    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess course data for optimization.
        
        Args:
            df: Raw course data DataFrame.
            
        Returns:
            Preprocessed DataFrame with additional columns and cleaned data.
        """
        self.df = df.copy()
        self.drop_unused_columns()
        self.preprocess_primary_section_id()
        self.preprocess_class_time()
        return self.df
    
    def drop_unused_columns(self):
        """Drop columns that are not needed for optimization."""
        columns_to_drop = [col for col in self.config.drop_columns if col in self.df.columns]
        self.df = self.df.drop(columns=columns_to_drop)
    
    def preprocess_primary_section_id(self):
        """Split primary section ID into course_id and section_code."""
        def rename_course_id(course_id: str) -> str:
            """Map course IDs to standardized names."""
            return self.config.course_id_mapping.get(course_id, course_id)
        
        def split_primary_section_id(section_id: str) -> tuple:
            """Split section ID into course ID and section code."""
            course_id = rename_course_id(section_id[:8])
            section_code = section_id[8:]
            return course_id, section_code
        
        # Split into separate columns
        self.df[['course_id', 'section_code']] = (
            self.df['primary_section_id'].apply(lambda x: pd.Series(split_primary_section_id(x)))
        )
    
    def preprocess_class_time(self):
        """Create binary columns for class time conflict detection."""
        all_classes = set()
        classes = dict()
        
        for index, row in self.df.iterrows():
            part_of_term = row["part_of_term"]
            days_code = row["days_code"]
            start_time = row["start_time_24hr"]
            stop_time = row["stop_time_24hr"]
            
            terms = self.get_terms(part_of_term)
            days = self.get_days(days_code)
            time_class = self.get_time_class(start_time, stop_time)
            
            combinations = ["ct_" + x + y + z for x in terms for y in days for z in time_class]
            classes[index] = combinations
            for c in combinations:
                all_classes.add(c)
        
        # Make new columns filled with 0
        for c in all_classes:
            self.df[c] = 0
        
        # Mark 1 for each class_time
        for index, row in self.df.iterrows():
            for c in classes[index]:
                self.df.loc[index, c] = 1
    
    def get_terms(self, part_of_term: str) -> List[str]:
        """Get term codes from part_of_term."""
        part_of_term = str(part_of_term)
        return self.config.term_mapping.get(part_of_term, [part_of_term])
    
    def get_days(self, days_code: str) -> List[str]:
        """Get individual days from days_code."""
        return self.config.days_mapping.get(days_code, [days_code])
    
    def get_time_class(self, start_time: datetime.time, stop_time: datetime.time) -> List[str]:
        """Get time class codes for a given time period."""
        start_dt = datetime.datetime.combine(datetime.datetime.today(), start_time)
        stop_dt = datetime.datetime.combine(datetime.datetime.today(), stop_time)
        duration = (stop_dt - start_dt).total_seconds() / 3600  # Hours
        
        # Convert time mapping keys to time objects
        time_mapping = {}
        for time_str, code in self.config.time_mapping.items():
            time_obj = datetime.time.fromisoformat(time_str)
            time_mapping[time_obj] = code
        
        if duration > 2:
            new_start_time = (start_dt + datetime.timedelta(hours=1, minutes=45)).time()
            return [time_mapping.get(start_time, 'Z'), time_mapping.get(new_start_time, 'Z')]
        return [time_mapping.get(start_time, 'Z')]
    
    def setupPrice(self, df: pd.DataFrame, seed: str, z_table_filepath: str = None) -> pd.DataFrame:
        """Calculate final prices using z-score based Monte Carlo simulation.
        
        Args:
            df: Preprocessed course data DataFrame.
            seed: Seed column name in the z-score table.
            z_table_filepath: Optional path to z-score table file.
            
        Returns:
            DataFrame with added 'price' column.
        """
        randomManager = RandomManager(z_table_filepath)
        z_series = randomManager.getRandZSeries(seed)
        
        # Add price column
        df['price'] = pd.Series(dtype="float")
        
        # Calculate price for each course
        start_of_uniqueid = 1  # From original code
        for index, row in df.iterrows():
            idx = row['uniqueid'] - start_of_uniqueid
            price = row['price_predicted'] + row['resid_mean'] + z_series[idx] * row['resid_stdev']
            df.loc[index, 'price'] = min(4851, max(0, price))
        
        self.df = df
        return df


class DataService:
    """Placeholder for DataService class."""
    pass