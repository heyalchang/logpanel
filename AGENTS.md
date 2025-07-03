# Agent Guidelines

This repository contains a layered TypeScript monorepo. When making changes, follow these rules:

1. **Respect the architecture** – UI components in `packages/ui` may only import from `@logpanel/contract` or other React libraries. Avoid direct imports from `@logpanel/service` or `@supabase/*` as enforced by ESLint.
2. **Run checks before committing** – execute `npm run lint` and `npm test` from the repo root. Both should succeed.
3. **Keep commits tidy** – do not modify `package-lock.json` unless dependencies change intentionally.
4. **Look for nested `AGENTS.md` files** – they may provide additional instructions for specific directories.

