# Log Viewer Application

## Overview

This is a full-stack log management application built with React frontend and Express backend. The application provides a comprehensive log viewing interface with features like real-time log filtering, run management, and detailed log inspection. It's designed as a developer tool for monitoring and analyzing application logs across different runs or deployments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom VS Code-inspired dark theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite integration in development mode

### Build & Deployment Strategy
- **Development**: Vite dev server with Express API proxy
- **Production**: Static frontend build served by Express with API routes
- **Bundle**: esbuild for server-side bundling
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Database Schema
- **logs table**: Stores log entries with id, timestamp, level, message, data (JSON), and run_id
- **users table**: Basic user management (username/password) - appears to be placeholder for future auth
- Uses PostgreSQL with JSONB for flexible log data storage

### API Endpoints
- `POST /api/logs` - Create new log entries
- `GET /api/logs/:runId` - Retrieve logs for a specific run with filtering
- `GET /api/runs` - List all available runs with summary statistics
- `GET /api/runs/:runId/stats` - Get detailed statistics for a run
- Query parameters support for search and log level filtering

### Frontend Features
- **Log Table**: Tabular view of logs with level-based color coding
- **Run Selector**: Interface for switching between different log runs
- **Search & Filter**: Real-time search with log level filtering (INFO, WARN, ERROR)
- **Log Inspector**: Modal for viewing detailed log data including JSON payloads
- **Statistics Panel**: Real-time statistics showing log counts by level and duration
- **Demo Controls**: Built-in demo data generation for testing (referenced but not implemented)

## Data Flow

1. **Log Ingestion**: External applications POST log data to `/api/logs` endpoint
2. **Storage**: Logs stored in PostgreSQL with run_id for grouping
3. **Real-time Updates**: Frontend polls every second for fresh data using React Query
4. **Filtering**: Server-side filtering by search terms and log levels
5. **Display**: Logs rendered in table format with VS Code-inspired styling

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **express**: Web framework
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Frontend build tool with React plugin
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

The application uses a unified deployment approach:
- Single server serves both API and static frontend files
- Environment-based configuration (development vs production)
- Database URL provided via environment variables
- Vite handles frontend bundling, esbuild handles server bundling
- Suitable for deployment on platforms like Replit, Railway, or traditional VPS

Key deployment considerations:
- Requires PostgreSQL database (configured for Neon Database)
- Environment variable `DATABASE_URL` must be set
- Production build creates optimized bundles for both client and server
- Session storage requires database connection

## Changelog

```
Changelog:
- July 02, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```