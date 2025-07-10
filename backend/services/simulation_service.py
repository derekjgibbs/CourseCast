"""
Simulation service for Monte Carlo simulation of course optimization.
"""

from services.data_service import DataService
from services.optimization_service import OptimizationService


class SimulationService:
    """Service for running Monte Carlo simulations on course optimization."""
    
    def __init__(self, data_service: DataService, optimization_service: OptimizationService):
        """Initialize the simulation service."""
        self.data_service = data_service
        self.optimization_service = optimization_service