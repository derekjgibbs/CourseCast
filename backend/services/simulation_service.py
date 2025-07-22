"""
Simulation service for Monte Carlo simulation of course optimization.
"""

from collections import Counter
from services.data_service import DataService
from services.optimization_service import OptimizationService
from models.simulation_models import (
    SimulationRequest,
    SimulationResponse,
    CourseStatistics,
    ScheduleStatistics,
)
from models.optimization_models import OptimizationRequest


class SimulationService:
    """Service for running Monte Carlo simulations on course optimization."""

    def __init__(
        self, data_service: DataService, optimization_service: OptimizationService
    ):
        """Initialize the simulation service."""
        self.data_service = data_service
        self.optimization_service = optimization_service

    def run_simulation(self, request: SimulationRequest) -> SimulationResponse:
        """Run Monte Carlo simulation with multiple optimization iterations."""
        assert request.num_simulations > 0, "Number of simulations must be positive"
        assert len(request.courses) > 0, "At least one course must be provided"

        simulation_results, schedule_counter = self._execute_simulations(request)
        successful_simulations = len(simulation_results)
        failed_simulations = request.num_simulations - successful_simulations

        course_probabilities = self._calculate_course_probabilities(
            request, simulation_results, successful_simulations
        )
        schedule_probabilities = self._calculate_schedule_probabilities(
            schedule_counter, successful_simulations
        )

        return SimulationResponse(
            course_probabilities=course_probabilities,
            schedule_probabilities=schedule_probabilities,
            total_simulations=request.num_simulations,
            successful_simulations=successful_simulations,
            failed_simulations=failed_simulations,
        )

    def _execute_simulations(self, request: SimulationRequest):
        """Execute multiple optimization simulations and collect results."""
        simulation_results = []
        schedule_counter = Counter()

        for i in range(request.num_simulations):
            try:
                optimization_request = self._create_optimization_request(request, i)
                result = self.optimization_service.optimize(optimization_request)

                selected_courses = [
                    course for course in result.selected_courses if course.selected
                ]
                simulation_results.append(selected_courses)

                schedule = frozenset(course.uniqueid for course in selected_courses)
                schedule_counter[schedule] += 1

            except Exception:
                continue

        return simulation_results, schedule_counter

    def _create_optimization_request(self, request: SimulationRequest, iteration: int):
        """Create optimization request for a specific iteration."""
        seed = request.seed + iteration if request.seed else iteration + 1

        return OptimizationRequest(
            budget=request.budget,
            max_credits=request.max_credits,
            courses=request.courses,
            seed=seed,
        )

    def _calculate_course_probabilities(
        self, request: SimulationRequest, simulation_results, successful_simulations
    ):
        """Calculate probability statistics for each course."""
        all_course_ids = [course.uniqueid for course in request.courses]
        course_counts = {course_id: 0 for course_id in all_course_ids}

        for result in simulation_results:
            for course in result:
                course_counts[course.uniqueid] += 1

        return [
            CourseStatistics(
                uniqueid=uniqueid,
                probability=(
                    count / successful_simulations if successful_simulations > 0 else 0
                ),
                selection_count=count,
            )
            for uniqueid, count in course_counts.items()
        ]

    def _calculate_schedule_probabilities(
        self, schedule_counter, successful_simulations
    ):
        """Calculate probability statistics for schedule combinations."""
        return [
            ScheduleStatistics(
                courses=list(schedule),
                probability=(
                    count / successful_simulations if successful_simulations > 0 else 0
                ),
                count=count,
            )
            for schedule, count in schedule_counter.most_common()
        ]
