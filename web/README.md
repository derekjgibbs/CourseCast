# CourseCast Web

Next.js web application for CourseCast.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/)

## Quick Start

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Convex Backend

CourseCast uses [Convex](https://convex.dev/) as the backend. To run the Convex development server:

```bash
pnpm convex dev
```

## Build

Build for production:

```bash
pnpm build
```

Run the production build:

```bash
pnpm start
```

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - shadcn/ui components
- `src/convex/` - Convex backend schema and functions
- `src/data/` - Data processing scripts for course metadata
- `src/features/` - Feature modules (vertically sliced architecture)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Shared utilities
- `public/2025C-courses.parquet` - Precomputed course data and price prediction weights for Fall 2025

## Development Guidelines

See [`CLAUDE.md`](./CLAUDE.md) for detailed coding standards and architectural decisions.

## Key Technologies

- [Next.js](https://nextjs.org/) 16 with React 19
- [Convex](https://convex.dev/) for backend
- [TanStack Query](https://tanstack.com/query) and [TanStack Table](https://tanstack.com/table)
- [shadcn/ui](https://ui.shadcn.com/) components
- [Tailwind CSS](https://tailwindcss.com/)
- [Valibot](https://valibot.dev/) for schema validation
