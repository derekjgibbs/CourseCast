# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CourseCast is a Streamlit-based web application that uses Monte Carlo simulation to optimize course unit allocation while minimizing waitlist risk. The application allows users to input course preferences, capacity constraints, and risk tolerances to generate optimal course schedules.

## Architecture

### Core Components

- **streamlit_app.py**: Main application entry point with Streamlit UI
- **final_utils.py**: Core optimization algorithms and Monte Carlo simulation
- **optimization_algorithm.py**: Alternative optimization implementation
- **load_data.py**: Data loading and preprocessing utilities
- **inputs.py**: Input validation and configuration handling

### Key Design Patterns

1. **Monte Carlo Simulation**: The core optimization uses probabilistic modeling to estimate waitlist risks
2. **Iterative Optimization**: Algorithms use iterative refinement to find optimal solutions
3. **Constraint-Based Modeling**: Course capacity and prerequisite constraints are enforced throughout
4. **Risk-Based Decision Making**: Waitlist probabilities drive course selection decisions

## Development Commands

### Running the Application
```bash
streamlit run streamlit_app.py
```

### Testing
Currently no formal test suite exists. Manual testing is done through the Streamlit interface.

### Dependencies
Install required packages:
```bash
pip install streamlit pandas numpy scipy matplotlib plotly
```

## Key Algorithms

### Monte Carlo Optimization (final_utils.py)
- **optimize_schedule()**: Main optimization function using Monte Carlo simulation
- **run_monte_carlo()**: Core simulation engine that models waitlist scenarios
- **calculate_waitlist_probability()**: Estimates probability of getting waitlisted
- **select_courses()**: Intelligent course selection based on risk tolerance

### Performance Considerations
- Monte Carlo simulations can be computationally expensive
- Consider caching results for repeated calculations
- Progress bars are used for long-running operations

## Data Structure

### Course Data
- Course information stored in pandas DataFrames
- Key fields: course_id, capacity, demand, prerequisites
- Waitlist probabilities calculated dynamically

### User Inputs
- Course preferences (ranked lists)
- Risk tolerance levels
- Capacity constraints
- Minimum/maximum unit requirements

## Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use descriptive variable names for complex algorithms
- Add docstrings for all functions, especially optimization routines
- Use type hints where appropriate

### Performance Optimization
- Profile Monte Carlo simulations for bottlenecks
- Consider vectorization for large datasets
- Use caching for expensive calculations
- Implement progress tracking for long operations

### Error Handling
- Validate all user inputs before processing
- Handle edge cases in optimization algorithms
- Provide meaningful error messages in the UI
- Log errors for debugging purposes

## Common Issues and Solutions

### Memory Issues
- Large Monte Carlo simulations can consume significant memory
- Consider reducing simulation size or implementing chunked processing

### Convergence Problems
- Optimization algorithms may fail to converge
- Implement timeout mechanisms and fallback strategies
- Monitor convergence metrics during optimization

### UI Responsiveness
- Long-running simulations can freeze the UI
- Use Streamlit's progress bars and status updates
- Consider implementing async processing for heavy computations

## Future Enhancements (v2.0)

The codebase is being redesigned for v2.0 with planned improvements:
- Enhanced optimization algorithms
- Better user interface design
- Improved performance and scalability
- More robust error handling
- Comprehensive testing suite

## File Structure Notes

- Main logic concentrated in `final_utils.py` and `streamlit_app.py`
- Data processing utilities in `load_data.py`
- Alternative implementations in `optimization_algorithm.py`
- Input handling centralized in `inputs.py`
- Historical data and exports in `data/` directory