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

### Code Clarity

    Class and method names must be self-documenting, short, and descriptive
    Remove all hardcoded values - use configuration or constants instead
    If you have a complicated expression, put the result of the expression or parts of the expression, in a temporary variable with a name that explains the purpose of the expression.

### Code Organization

    Eliminate duplicate code through extraction or abstraction
    If you have a code fragment that can be grouped together, turn the fragment into a method whose name explains the purpose of the method.
    Enforce maximum method length of 60 lines
    Decompose complex methods into smaller, single-purpose functions
    Break down large classes with excessive instance variables (>7-10)

### Code Quality

    Add runtime assertions to critical methods (minimum 2 per critical method)
    Assertions should validate key assumptions about state and parameters
    Consider consolidating scattered minor changes into cohesive classes

### Design Priorities (in order)

    Readability - Code should be immediately understandable
    Simplicity - Choose the least complex solution
    Maintainability - Optimize for future changes
    Performance - Only optimize after the above are satisfied

# TypeScript Best Practices in Convex

## Writing Convex Functions in TypeScript

### Basic TypeScript Integration

You can gradually add TypeScript to a Convex project. The first step is writing Convex functions with `.ts` extension.

#### Argument Validation Example

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  // Convex automatically infers argument type
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});
```

#### Manual Type Annotation

```typescript
import { internalMutation } from "./_generated/server";

export default internalMutation({
  handler: async (ctx, args: { body: string; author: string }) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});
```

## Adding a Schema

When you define a schema, database method return types become more precise:

```typescript
import { query } from "./_generated/server";

export const list = query({
  args: {},
  // Return type is now `Promise<Doc<"messages">[]>`
  handler: ctx => {
    return ctx.db.query("messages").collect();
  },
});
```

## Type Annotating Server-Side Helpers

Use generated types for context and document handling:

```typescript
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

export function myReadHelper(ctx: QueryCtx, id: Id<"channels">) {
  /* ... */
}

export function myActionHelper(ctx: ActionCtx, doc: Doc<"messages">) {
  /* ... */
}
```

### Inferring Types from Validators

```typescript
import { Infer, v } from "convex/values";

export const courseValidator = v.object({
  name: v.string(),
  credits: v.number(),
  prerequisites: v.array(v.string()),
});

export type Course = Infer<typeof courseValidator>;
```

## Best Practices Summary

1. **Use TypeScript files**: Convert `.js` files to `.ts` for better type safety
2. **Define schemas**: Leverage Convex's schema system for automatic type inference
3. **Use generated types**: Import `Doc`, `Id`, and context types from `_generated/`
4. **Validate arguments**: Use `v` validators for function arguments
5. **Type helpers**: Annotate server-side helper functions with proper context types
6. **Infer from validators**: Use `Infer<typeof validator>` for consistent typing

## Additional TypeScript Features

### Optional Arguments

```typescript
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    body: v.optional(v.string()),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TypeScript knows body and author are optional
    await ctx.db.patch(args.id, {
      ...(args.body && { body: args.body }),
      ...(args.author && { author: args.author }),
    });
  },
});
```

### Union Types

```typescript
export const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export type Status = Infer<typeof statusValidator>;
```

### Nested Objects

```typescript
export const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  profile: v.object({
    bio: v.string(),
    avatar: v.optional(v.string()),
  }),
});
```

# The Zen of Convex

## Performance Principles

### Sync Engine Approach

- Center applications around the deterministic, reactive database
- Benefits include:
  - Easier project understanding
  - Faster performance
  - Simplified state management

### Query and Function Best Practices

- Use queries for almost every app read
- Keep sync engine functions:
  - Working with fewer than a few hundred records
  - Completing in under 100ms
- Use actions sparingly and incrementally

### Client-Side State Management

- Leverage built-in Convex caching and consistency controls
- Avoid creating unnecessary local cache layers
- Be cautious with mutation return values for UI updates

## Architecture Guidelines

### Server-Side Development

- Solve composition problems using standard TypeScript methods
- Create frameworks using "just code"
- Leverage community examples for complex implementations

### Action Usage

- Avoid direct action invocations from browsers
- Treat actions as part of a workflow
- Record progress incrementally
- Chain effects and mutations strategically

## Development Workflow

### Recommended Practices

- Actively use the Convex dashboard
- Engage with community resources
- Leverage developer search
- Join the Convex community on Discord

## Key Community Resources

- [Documentation](https://docs.convex.dev)
- [Stack Blog](https://stack.convex.dev)
- [Community Portal](https://convex.dev/community)
- [Developer Search](https://search.convex.dev)

The philosophy emphasizes creating efficient, maintainable applications by leveraging Convex's built-in capabilities and community knowledge.

# TypeScript Best Practices in Convex

## Writing Convex Functions in TypeScript

### Basic TypeScript Integration

You can gradually add TypeScript to a Convex project. The first step is writing Convex functions with `.ts` extension.

#### Argument Validation Example

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  // Convex automatically infers argument type
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});
```

#### Manual Type Annotation

```typescript
import { internalMutation } from "./_generated/server";

export default internalMutation({
  handler: async (ctx, args: { body: string; author: string }) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});
```

## Adding a Schema

When you define a schema, database method return types become more precise:

```typescript
import { query } from "./_generated/server";

export const list = query({
  args: {},
  // Return type is now `Promise<Doc<"messages">[]>`
  handler: ctx => {
    return ctx.db.query("messages").collect();
  },
});
```

## Type Annotating Server-Side Helpers

Use generated types for context and document handling:

```typescript
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

export function myReadHelper(ctx: QueryCtx, id: Id<"channels">) {
  /* ... */
}

export function myActionHelper(ctx: ActionCtx, doc: Doc<"messages">) {
  /* ... */
}
```

### Inferring Types from Validators

```typescript
import { Infer, v } from "convex/values";

export const courseValidator = v.object({
  name: v.string(),
  credits: v.number(),
  prerequisites: v.array(v.string()),
});

export type Course = Infer<typeof courseValidator>;
```

## Best Practices Summary

1. **Use TypeScript files**: Convert `.js` files to `.ts` for better type safety
2. **Define schemas**: Leverage Convex's schema system for automatic type inference
3. **Use generated types**: Import `Doc`, `Id`, and context types from `_generated/`
4. **Validate arguments**: Use `v` validators for function arguments
5. **Type helpers**: Annotate server-side helper functions with proper context types
6. **Infer from validators**: Use `Infer<typeof validator>` for consistent typing

## Additional TypeScript Features

### Optional Arguments

```typescript
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    body: v.optional(v.string()),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TypeScript knows body and author are optional
    await ctx.db.patch(args.id, {
      ...(args.body && { body: args.body }),
      ...(args.author && { author: args.author }),
    });
  },
});
```

### Union Types

```typescript
export const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export type Status = Infer<typeof statusValidator>;
```

### Nested Objects

```typescript
export const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  profile: v.object({
    bio: v.string(),
    avatar: v.optional(v.string()),
  }),
});
```
