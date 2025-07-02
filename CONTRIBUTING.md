# Contributing

Thank you for improving **LogPanel**!  We follow a strict layering model so that any feature can be implemented (or reviewed) in predictable steps.

## Layer boundaries

| Layer | Package | May import | **May NOT import** |
|-------|---------|------------|--------------------|
| **Schema** | `@logpanel/schema` | – | anything local |
| **Service** | `@logpanel/service` | `@logpanel/schema`, external SDKs | `@logpanel/ui` |
| **Contract** | `@logpanel/contract` | `@logpanel/schema` | `@logpanel/service`, `@logpanel/ui` |
| **UI** | `@logpanel/ui` | `@logpanel/contract`, React libs | `@logpanel/service`, `@supabase/*` |

The ESLint rule `no-restricted-imports` (see `.eslintrc.json`) enforces these boundaries automatically.

## Working in `packages/ui/src/hooks`

`hooks/` is the **only** place where React components can touch the contract.  Each hook encapsulates a specific `LogService` call and supplies React-Query caching logic:

```ts
export const useRuns = () => {
  const service = useLogService();
  return useQuery({ queryKey: ['runs'], queryFn: () => service.getRuns() });
};
```

Why?

1. **Separation of concerns** – Components remain declarative and stateless; data-fetching concerns live in hooks.
2. **Testability** – Hooks can be unit-tested against the mock service without mounting UI.
3. **Swapability** – If we swap the implementation (Supabase → WebSocket streaming) only the hooks change; components stay intact.

When adding a new feature:

1. Extend `@logpanel/schema` and/or `@logpanel/contract` as needed.
2. Update or add a hook under `packages/ui/src/hooks/`.
3. Use the hook in components.

Please run `npm run lint` and `npm test` before opening a PR. 