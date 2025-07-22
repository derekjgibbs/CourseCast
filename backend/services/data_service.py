"""
Data processing service for CourseCast.

This module contains the RandomManager, PreProcessor, and DataService classes
for handling course data processing, z-score table management, and price forecasting.
"""

import datetime
from pathlib import Path
from typing import Hashable, List, Optional

import pandas as pd


from models.data_models import PreprocessingConfig


class RandomManager:
    """Manages Z-score table operations for Monte Carlo simulations."""

    def __init__(self, z_table_filepath: Optional[str] = None):
        """Initialize RandomManager and load z-score table.

        Args:
            z_table_filepath: Path to z-score table Excel file.
                            Defaults to 'data/z_score_table.xlsx'.
        """
        if z_table_filepath is None:
            z_table_filepath = str(
                Path(__file__).parent.parent / "data" / "z_score_table.xlsx"
            )

        self.rand_z_table_filepath = z_table_filepath
        self.ztable = pd.read_excel(self.rand_z_table_filepath)

    def getRandZSeries(self, seed: int) -> pd.Series:
        """Get random Z-series for a given seed.

        Args:
            seed: Seed column name in the z-score table.

        Returns:
            Pandas Series containing z-scores for the given seed.
        """
        return self.ztable[seed]


class PreProcessor:
    """Preprocesses course data for optimization and simulation."""

    df: Optional[pd.DataFrame] = None

    def __init__(self, config: Optional[PreprocessingConfig] = None):
        """Initialize PreProcessor with optional configuration.

        Args:
            config: PreprocessingConfig object with custom settings.
                   Defaults to standard configuration if not provided.
        """

        self.config = config or PreprocessingConfig()

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
        columns_to_drop = [
            col for col in self.config.drop_columns if col in self.df.columns
        ]
        self.df = self.df.drop(columns=columns_to_drop)

    def preprocess_primary_section_id(self):
        """Split primary section ID into course_id and section_code."""

        def rename_course_id(course_id: str) -> str:
            """Map course IDs to standardized names."""
            return self.config.course_id_mapping.get(course_id, course_id)

        def split_primary_section_id(section_id: str) -> tuple[str, str]:
            """Split section ID into course ID and section code."""
            course_id = rename_course_id(section_id[:8])
            section_code = section_id[8:]
            return course_id, section_code

        # Split into separate columns
        self.df[["course_id", "section_code"]] = self.df["primary_section_id"].apply(
            lambda x: pd.Series(split_primary_section_id(x))
        )

    def preprocess_class_time(self):
        """Create binary columns for class time conflict detection."""
        class_combinations = self._generate_class_combinations()
        unique_classes = self._extract_unique_classes(class_combinations)
        self._create_class_time_columns(unique_classes)
        self._populate_class_time_columns(class_combinations)

    def _generate_class_combinations(self) -> dict[Hashable, List[str]]:
        """Generate class time combinations for each course row.

        Returns:
            Dictionary mapping row indices to their class time combinations.
        """
        class_combinations: dict[Hashable, List[str]] = {}

        for index, row in self.df.iterrows():
            combinations = self._build_class_time_combinations(
                row["part_of_term"],
                row["days_code"],
                row["start_time_24hr"],
                row["stop_time_24hr"],
            )
            class_combinations[index] = combinations

        return class_combinations

    def _build_class_time_combinations(
        self, part_of_term: str, days_code: str, start_time, stop_time
    ) -> List[str]:
        """Build class time combination strings for a single course.

        Args:
            part_of_term: Academic term part (1,2,3,4,F,S,M,Modular)
            days_code: Days when class meets (MW, TR, etc.)
            start_time: Class start time
            stop_time: Class stop time

        Returns:
            List of class time combination strings (e.g., ['ct_q1MA', 'ct_q1WA'])
        """
        terms = self.get_terms(part_of_term)
        days = self.get_days(days_code)
        time_classes = self.get_time_class(start_time, stop_time)

        combinations = [
            f"ct_{term}{day}{time_class}"
            for term in terms
            for day in days
            for time_class in time_classes
        ]

        return combinations

    def _extract_unique_classes(self, class_combinations: dict[Hashable, List[str]]):
        """Extract all unique class time combinations from the data.

        Args:
            class_combinations: Dictionary of class combinations per row

        Returns:
            Set of all unique class time combination strings
        """
        unique_classes = set[str]()

        for combinations in class_combinations.values():
            unique_classes.update(combinations)

        return unique_classes

    def _create_class_time_columns(self, unique_classes: set):
        """Create binary columns for each unique class time combination.

        Args:
            unique_classes: Set of unique class time combinations
        """
        for class_name in unique_classes:
            self.df[class_name] = 0

    def _populate_class_time_columns(self, class_combinations: dict):
        """Populate binary class time columns with appropriate values.

        Args:
            class_combinations: Dictionary mapping row indices to their combinations
        """
        for index, combinations in class_combinations.items():
            for class_name in combinations:
                self.df.loc[index, class_name] = 1

    def get_terms(self, part_of_term: str) -> List[str]:
        """Get term codes from part_of_term."""
        part_of_term = str(part_of_term)
        return self.config.term_mapping.get(part_of_term, [part_of_term])

    def get_days(self, days_code: str) -> List[str]:
        """Get individual days from days_code."""
        return self.config.days_mapping.get(days_code, [days_code])

    def get_time_class(
        self, start_time: datetime.time, stop_time: datetime.time
    ) -> List[str]:
        """Get time class codes for a given time period."""
        # Handle both time objects and string representations
        if isinstance(start_time, str):
            start_time = pd.to_datetime(start_time).time()
        if isinstance(stop_time, str):
            stop_time = pd.to_datetime(stop_time).time()

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
            return [
                time_mapping.get(start_time, "Z"),
                time_mapping.get(new_start_time, "Z"),
            ]
        return [time_mapping.get(start_time, "Z")]

    def setupPrice(
        self, df: pd.DataFrame, seed: int, z_table_filepath: Optional[str] = None
    ) -> pd.DataFrame:
        """Calculate final prices using z-score based Monte Carlo simulation.

        Args:
            df: Preprocessed course data DataFrame.
            seed: Seed column name/number in the z-score table.
            z_table_filepath: Optional path to z-score table file.

        Returns:
            DataFrame with added 'price' column.
        """
        randomManager = RandomManager(z_table_filepath)
        z_series = randomManager.getRandZSeries(seed)

        # Add price column
        df["price"] = pd.Series(dtype="float")

        # Calculate price for each course
        start_of_uniqueid = 1  # From original code
        for index, row in df.iterrows():
            idx = row["uniqueid"] - start_of_uniqueid
            price = (
                row["price_predicted"]
                + row["resid_mean"]
                + z_series[idx] * row["resid_stdev"]
            )
            df.loc[index, "price"] = min(4851, max(0, price))

        self.df = df
        return df


class DataService:
    """Main service for coordinating data processing operations."""

    def __init__(self, z_table_filepath: Optional[str] = None, config: Optional[PreprocessingConfig] = None):
        """Initialize DataService with components.

        Args:
            z_table_filepath: Optional path to z-score table file.
            config: Optional PreprocessingConfig object.
        """
        self.random_manager = RandomManager(z_table_filepath)
        self.preprocessor = PreProcessor(config)
        self.z_table_filepath = z_table_filepath

    def load_excel_file(self, file_path: str, sheet_name: Optional[str] = None) -> pd.DataFrame:
        """Load course data from Excel file.

        Args:
            file_path: Path to Excel file.
            sheet_name: Optional sheet name to load.

        Returns:
            DataFrame with loaded course data.

        Raises:
            FileNotFoundError: If file doesn't exist.
            ValueError: If required columns are missing.
        """
        from pathlib import Path

        if not Path(file_path).exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            # If sheet_name is specified and returns a dict, get the DataFrame
            if isinstance(df, dict):
                if sheet_name and sheet_name in df:
                    df = df[sheet_name]
                else:
                    # Get the first sheet if multiple sheets exist
                    df = list(df.values())[0]
        except Exception as e:
            raise ValueError(f"Error reading Excel file: {str(e)}")

        # Validate required columns
        required_columns = [
            "primary_section_id",
            "part_of_term",
            "days_code",
            "start_time_24hr",
            "stop_time_24hr",
            "price_predicted",
            "resid_mean",
            "resid_stdev",
            "uniqueid",
        ]

        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")

        return df

    def process_course_data(
        self, file_path: str, seed: int, sheet_name: Optional[str] = None
    ) -> pd.DataFrame:
        """Complete processing pipeline for course data.

        Args:
            file_path: Path to Excel file with course data.
            seed: Seed for Monte Carlo simulation.
            sheet_name: Optional sheet name to load.

        Returns:
            Fully processed DataFrame with prices and conflict fields.
        """
        # Load data
        df = self.load_excel_file(file_path, sheet_name)

        # Preprocess
        df = self.preprocessor.preprocess(df)

        # Setup prices
        df = self.preprocessor.setupPrice(df, seed, self.z_table_filepath)

        return df

    def validate_course_data(self, df: pd.DataFrame) -> bool:
        """Validate course data has all required fields and valid values.

        Args:
            df: Course data DataFrame to validate.

        Returns:
            True if valid, raises ValueError otherwise.
        """
        # Check for required columns
        required_columns = [
            "primary_section_id",
            "course_id",
            "section_code",
            "price",
            "uniqueid",
        ]

        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(
                f"Missing required columns after processing: {missing_columns}"
            )

        # Check for valid prices
        if (df["price"] < 0).any():
            raise ValueError("Negative prices found in data")

        if (df["price"] > 4851).any():
            raise ValueError("Prices exceed maximum allowed value")

        # Check for duplicate unique IDs
        if df["uniqueid"].duplicated().any():
            raise ValueError("Duplicate unique IDs found")

        return True
