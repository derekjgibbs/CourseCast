# CourseCast

CourseCast helps you get better results from Wharton's CourseMatch by showing you how your utility inputs translate into actual schedules, taking into account historical price patterns and variability.

## How It Works

CourseCast runs Monte Carlo simulations in your browser to predict possible schedule outcomes from the CourseMatch system. Each simulation uses a model that predicts closing prices for courses, then solves a linear programming problem to determine which classes get selected.

After running multiple simulations, CourseCast aggregates the results to show you:

- **Probability of obtaining each course** based on your utility allocations
- **Likely schedule configurations** you might end up with
- **Trade-offs** between different utility distributions

This allows you to iteratively refine your course utilities and see how changes affect your chances before submitting to the real CourseMatch system.

## Getting Started

The main application is a Next.js web app located in the [`web/`](./web) directory. See [`web/README.md`](./web/README.md) for setup instructions.

## Repository Structure

- **`web/`** - Next.js web application (main app)
- **`data/`** - Historical data exports (preserved for reference)
