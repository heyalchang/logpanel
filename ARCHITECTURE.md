# LogPanel Architecture

A contract-driven log viewer with clean separation of concerns.

## Packages

### @logpanel/schema
Pure TypeScript types for the domain model:
- `LogRow` - Individual log entry
- `LogLevel` - INFO, WARN, ERROR
- `RunMeta` - Metadata about a log run

### @logpanel/contract
Service interfaces that define capabilities:
- `LogService` - Methods for querying and managing logs
- `DemoType` - Types of demo data that can be generated

### @logpanel/service  
Implementations of the contract:
- `supabase.ts` - Production implementation using Supabase
- `mock.ts` - In-memory implementation for testing
- `demo-data.ts` - Realistic demo log templates

### @logpanel/ui
React application that only imports from the contract:
- Uses `LogServiceProvider` to inject the service
- All data access through `useLogService()` hook
- Zero knowledge of Supabase or implementation details

## Key Benefits

1. **Parallel Development** - UI and service teams can work independently
2. **Easy Testing** - Swap implementations via provider
3. **Clear Boundaries** - Contract enforces clean architecture
4. **Type Safety** - TypeScript ensures compatibility

## Running the App

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm test
``` 