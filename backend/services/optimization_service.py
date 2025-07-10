"""
Optimization service for course schedule optimization using linear programming.
"""

import pulp
import pandas as pd
from typing import List
from services.data_service import DataService
from models.optimization_models import (
    OptimizationRequest,
    OptimizationResponse,
    OptimizedCourse,
)


class OptimizationService:
    """Service for optimizing course schedules using linear programming."""

    def __init__(self, data_service: DataService):
        """Initialize the optimization service."""
        self.data_service = data_service

    def optimize(self, request: OptimizationRequest) -> OptimizationResponse:
        """Optimize course selection using linear programming."""
        
        # Process course data through DataService
        course_ids = [course.uniqueid for course in request.courses]
        course_utilities = {course.uniqueid: course.utility for course in request.courses}
        
        # Get processed course data from DataService
        course_data = self.data_service.process_course_data(
            course_ids=course_ids,
            seed=request.seed,
            budget=request.budget
        )
        
        # Add utility values to course data
        course_data['utility'] = course_data['uniqueid'].map(course_utilities)
        
        # Create Linear Programming problem
        problem = pulp.LpProblem("CourseOptimization", pulp.LpMaximize)
        
        # Create binary decision variables for each course
        course_vars = {}
        for _, course in course_data.iterrows():
            course_vars[course['uniqueid']] = pulp.LpVariable(
                f"course_{course['uniqueid']}", cat='Binary'
            )
        
        # Objective function: maximize total utility * credits
        problem += pulp.lpSum([
            course_vars[course['uniqueid']] * course['utility'] * course['credits']
            for _, course in course_data.iterrows()
        ])
        
        # Budget constraint
        problem += pulp.lpSum([
            course_vars[course['uniqueid']] * course['price']
            for _, course in course_data.iterrows()
        ]) <= request.budget
        
        # Credit constraint
        problem += pulp.lpSum([
            course_vars[course['uniqueid']] * course['credits']
            for _, course in course_data.iterrows()
        ]) <= request.max_credits
        
        # Time conflict constraints (for each class time slot)
        time_columns = [col for col in course_data.columns if col.startswith('ct_')]
        for time_col in time_columns:
            # For each time slot, at most one course can be selected
            problem += pulp.lpSum([
                course_vars[course['uniqueid']] * course[time_col]
                for _, course in course_data.iterrows()
            ]) <= 1
        
        # Course duplicate constraint (max one section per course)
        unique_course_ids = course_data['course_id'].unique()
        for course_id in unique_course_ids:
            # For each unique course, at most one section can be selected
            sections = course_data[course_data['course_id'] == course_id]
            problem += pulp.lpSum([
                course_vars[section['uniqueid']]
                for _, section in sections.iterrows()
            ]) <= 1
        
        # Solve the problem
        problem.solve(pulp.PULP_CBC_CMD(msg=0))
        
        # Process results
        selected_courses = []
        total_cost = 0
        total_credits = 0
        total_utility = 0
        
        for _, course in course_data.iterrows():
            course_id = course['uniqueid']
            is_selected = course_vars[course_id].varValue == 1
            
            if is_selected:
                total_cost += course['price']
                total_credits += course['credits']
                total_utility += course['utility']
            
            selected_courses.append(OptimizedCourse(
                uniqueid=course_id,
                price=course['price'],
                credits=course['credits'],
                utility=course['utility'],
                selected=is_selected
            ))
        
        # Determine optimization status
        status_map = {
            pulp.LpStatusOptimal: "Optimal",
            pulp.LpStatusInfeasible: "Infeasible",
            pulp.LpStatusUnbounded: "Unbounded",
            pulp.LpStatusUndefined: "Undefined",
            pulp.LpStatusNotSolved: "Not Solved"
        }
        
        optimization_status = status_map.get(problem.status, "Unknown")
        
        return OptimizationResponse(
            selected_courses=selected_courses,
            total_cost=total_cost,
            total_credits=total_credits,
            total_utility=total_utility,
            optimization_status=optimization_status
        )