from coursematch_solver import CourseMatchSolver
import pandas as pd
from collections import Counter
import json

class MonteCarloSimulator:
    def __init__(self, source_xlsx):
        self.source_xlsx = source_xlsx
        
    def run_simulation(self, base_input, num_simulations, callback=None):
        """
        Runs Monte Carlo simulation multiple times with different seeds
        
        Args:
            base_input (dict): Base input with budget, max_credits, and courses
            num_simulations (int): Number of simulations to run
            callback (function): Optional callback function for progress updates
            
        Returns:
            dict: Course probabilities, schedule probabilities, and raw results
        """
        simulation_results = []
        schedule_counter = Counter()
        
        for i in range(num_simulations):
            # Update seed for this iteration
            current_input = base_input.copy()
            current_input["seed"] = i + 1
            
            # Run solver
            cms = CourseMatchSolver(self.source_xlsx, current_input)
            selected = cms.solve()
            simulation_results.append(selected)
            
            # Create a frozen set of course IDs for this schedule
            schedule = frozenset(course['uniqueid'] for course in selected)
            schedule_counter[schedule] += 1
            
            # Update progress if callback provided
            if callback:
                callback(i + 1, num_simulations)
        
        # Calculate individual course probabilities
        course_counts = {}
        for result in simulation_results:
            for course in result:
                uniqueid = course['uniqueid']
                course_counts[uniqueid] = course_counts.get(uniqueid, 0) + 1
        
        course_probabilities = {
            uniqueid: count/num_simulations 
            for uniqueid, count in course_counts.items()
        }
        
        # Calculate schedule probabilities
        schedule_probabilities = [
            {
                'courses': list(schedule),
                'probability': count/num_simulations,
                'count': count
            }
            for schedule, count in schedule_counter.most_common()
        ]
        
        return {
            'course_probabilities': course_probabilities,
            'schedule_probabilities': schedule_probabilities,
            'raw_results': simulation_results
        }
