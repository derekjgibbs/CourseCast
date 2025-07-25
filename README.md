# CourseCast

CourseCast helps you get better results from Wharton's CourseMatch by showing you how your utility inputs translate into actual schedules, taking into account historical price patterns and variability.

## Overview

CourseCast is a Streamlit-based web application that uses Monte Carlo simulation to optimize course unit allocation while minimizing waitlist risk. The application allows users to input course preferences, capacity constraints, and risk tolerances to generate optimal course schedules.

## Features

- **Monte Carlo Simulation**: Probabilistic modeling to estimate waitlist risks
- **Optimization Algorithms**: Iterative refinement to find optimal course selections
- **Risk-Based Decision Making**: Waitlist probabilities drive course selection decisions
- **Interactive UI**: Streamlit-based interface for easy configuration and results visualization

## Quick Start

### Prerequisites

- Python 3.7 or higher
- pip package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CourseCast
```

2. Install required dependencies:

```bash
pip install streamlit pandas numpy scipy matplotlib plotly
```

### Running the Application

Start the Streamlit application:

```bash
streamlit run streamlit_app.py
```

The application will open in your default web browser, typically at `http://localhost:8501`.

## Usage

1. **Input Course Preferences**: Enter your ranked course preferences
2. **Set Constraints**: Define capacity limits and unit requirements
3. **Configure Risk Tolerance**: Set your acceptable waitlist risk levels
4. **Run Optimization**: Execute the Monte Carlo simulation
5. **Review Results**: Analyze the optimized schedule and risk assessments

## Project Structure

- `streamlit_app.py` - Main application entry point
- `final_utils.py` - Core optimization algorithms and Monte Carlo simulation
- `optimization_algorithm.py` - Alternative optimization implementation
- `load_data.py` - Data loading and preprocessing utilities
- `inputs.py` - Input validation and configuration handling
- `data/` - Historical data and exports

## Development

See `CLAUDE.md` for detailed development guidelines, architecture overview, and coding standards.

## Future Enhancements

The project is being redesigned for v2.0 with planned improvements:

- Enhanced optimization algorithms
- Better user interface design
- Improved performance and scalability
- More robust error handling
- Comprehensive testing suite
