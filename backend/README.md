# CourseCast Backend

FastAPI backend service for CourseCast optimization and simulation.

## Overview

This backend service provides REST API endpoints for course optimization and Monte Carlo simulation. It's designed to be scalable, maintainable, and well-documented.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **Structured Logging**: JSON/text logging with structured context
- **Configuration Management**: Environment-based configuration
- **Health Check**: Built-in health monitoring endpoint
- **CORS Support**: Cross-origin resource sharing enabled
- **Auto-documentation**: Automatic API documentation with Swagger UI

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration management
├── logging_config.py    # Logging setup
├── pyproject.toml       # Dependencies and project metadata
├── README.md           # This file
├── models/             # Pydantic models
├── services/           # Business logic services
└── tests/              # Test suite
```

## Quick Start

### Prerequisites

- Python 3.9 or higher
- [uv](https://docs.astral.sh/uv/) for dependency management (recommended)

### Installation

1. **Create virtual environment with uv:**
   ```bash
   cd backend
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   uv pip install -e .
   ```

3. **Install development dependencies (optional):**
   ```bash
   uv pip install -e ".[dev]"
   ```

### Running the Application

1. **Start the development server:**
   ```bash
   uvicorn main:app --reload
   ```

2. **Or run directly:**
   ```bash
   python main.py
   ```

3. **Access the application:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the backend directory:

```env
# Application settings
APP_NAME=CourseCast Backend
DEBUG=false

# Server settings
HOST=0.0.0.0
PORT=8000
RELOAD=true

# Database settings
CONVEX_URL=your_convex_url
CONVEX_AUTH_TOKEN=your_auth_token

# Logging settings
LOG_LEVEL=INFO
LOG_FORMAT=json

# Optimization settings
MAX_MONTE_CARLO_ITERATIONS=1000
OPTIMIZATION_TIMEOUT=300
```

## API Endpoints

### Core Endpoints

- `GET /` - Root endpoint with welcome message
- `GET /health` - Health check endpoint
- `GET /docs` - API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

### API v1 Endpoints

- `GET /api/v1/status` - API status and available endpoints

### Future Endpoints (Planned)

- `POST /api/v1/optimize` - Course optimization endpoint
- `POST /api/v1/simulate` - Monte Carlo simulation endpoint

## Development

### Code Style

The project uses:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

Run code quality checks:
```bash
black .
isort .
flake8 .
mypy .
```

### Testing

Run tests with pytest:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=. --cov-report=html
```

### Project Dependencies

Core dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `PuLP` - Linear programming optimization
- `pandas` - Data manipulation
- `convex` - Database client
- `structlog` - Structured logging

## Logging

The application uses structured logging with configurable output format:

- **JSON format**: For production environments
- **Text format**: For development and debugging

Logs include:
- Timestamp
- Logger name
- Log level
- Structured context
- Stack traces for errors

## Deployment

### Docker (Planned)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

Required environment variables for production:
- `CONVEX_URL` - Database connection URL
- `CONVEX_AUTH_TOKEN` - Database authentication token
- `LOG_LEVEL` - Logging level (INFO, DEBUG, WARNING, ERROR)

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run code quality checks
5. Submit a pull request

## License

This project is licensed under the MIT License.
