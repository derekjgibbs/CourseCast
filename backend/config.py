"""Configuration management for CourseCast backend."""

import os
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Application settings
    app_name: str = Field(default="CourseCast Backend", description="Application name")
    app_version: str = Field(default="0.1.0", description="Application version")
    debug: bool = Field(default=False, description="Enable debug mode")
    
    # Server settings
    host: str = Field(default="127.0.0.1", description="Server host")
    port: int = Field(default=8000, description="Server port")
    reload: bool = Field(default=False, description="Enable auto-reload")
    
    # Database settings
    convex_url: Optional[str] = Field(default=None, description="Convex database URL")
    convex_auth_token: Optional[str] = Field(default=None, description="Convex auth token")
    
    # Logging settings
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: str = Field(default="json", description="Logging format (json or text)")
    
    # Optimization settings
    max_monte_carlo_iterations: int = Field(default=1000, description="Maximum Monte Carlo iterations")
    optimization_timeout: int = Field(default=300, description="Optimization timeout in seconds")
    
    # API settings
    api_v1_prefix: str = Field(default="/api/v1", description="API v1 prefix")
    cors_origins: list[str] = Field(default_factory=lambda: ["*"], description="CORS origins")
    
    @property
    def server_url(self) -> str:
        """Get the server URL."""
        return f"http://{self.host}:{self.port}"


# Global settings instance
settings = Settings()