# LLM-Aided Development Playbook

A repeatable pattern for letting **two language-model agents** (or two human teams) work in parallel on the *same* application without stepping on each other.

> TL;DR Freeze the **contract layer**. Feed the back-end LLM the schema + contract, feed the front-end LLM **only** the contract, and enforce the boundary with TypeScript types + CI checks.

---

## 1  Philosophy

| Concern | Human-team past (Gen X) | LLM-team future |
|---------|------------------------|-----------------|
| Schema stability | "DBA freezes tables, devs call stored procs." | Keep `shared/schema.ts` authoritative, but *don't* fear generating adapters around it. |
| API churn | Hard to version → avoid nested APIs. | Cheap to regenerate → treat contract as code, bump daily if useful. |
| Parallelism | Spec first, then implement. | Generate both sides in parallel; compiler + tests catch drift. |

Key insight: **type systems and CI are cheap referees**. We can allow the contract to evolve quickly because the compiler guarantees both sides stay in sync.

---

## 2  The Layer Cake

```
┌──────────────────────────────┐
│  React UI (renderer)         │  ← LLM-B edits here
│  *never imports Supabase*    │
└──────────┬───────────────────┘
           │ calls
┌──────────▼───────────────────┐
│  Contract Layer (TS types)   │  ← FROZEN during a PR
│  /client/src/contract/*.ts   │
└──────────┬───────────────────┘
           │ implements
┌──────────▼───────────────────┐
│  Impl 1: supabaseLogService  │  ← LLM-A owns
│  Impl 2: httpLogService      │
│  Impl 3: inMemoryLogService  │
└──────────────────────────────┘
```

*Only* the contract folder is shared between agents; everything else can diverge safely.

---

## 3  Contract Authoring Rules

1. **Pure TypeScript** – interfaces, enums, and doc-comments; no runtime code.
2. **Stateless** – Functions should be easily mocked.
3. **Small-grain** – Prefer a method per use-case over generic `.query()` to keep UI prompts simple.
4. **Version bump** – Changing a function signature requires bumping the exported `CONTRACT_VERSION` string so CI knows to re-run both sides.

Example skeleton:
```ts
// contract/logs.ts
export const CONTRACT_VERSION = "2025-07-02";
export interface RunMeta { … }
export interface LogRow { … }
export interface LogService {
  getRuns(): Promise<RunMeta[]>;
  getLogs(runId: string, opts?: { levels?: string[]; query?: string }): Promise<LogRow[]>;
  …
}
```

---

## 4  Prompt Templates

### 4.1  Back-end LLM ("LLM-A")
> *System*: "You own data & contract implementation. Never touch `client/src/components`. Respect `CONTRACT_VERSION`."
>
> *User*: "Implement all missing methods in `supabaseLogService.ts` to satisfy `contract/`. Write integration test."

### 4.2  Front-end LLM ("LLM-B")
> *System*: "You render UI. Your only data access is `import { logService } from '@/contract'`. Do not reference Supabase or SQL."
>
> *User*: "Create a new component `<RunTimeline>` that shows … using `logService`."

Both prompts can run simultaneously; compilation will fail if either violates the boundary.

---

## 5  CI Enforcement

1. `tsc --noEmit` – catches type drift.  
2. Jest smoke test loads every `impl/*Service` and calls each method with sample args.  
3. If `CONTRACT_VERSION` changed, require both "backend" and "frontend" test suites to pass before merge.

---

## 6  Practical Steps to Introduce This Repo

1. **Create `client/src/contract/` and move the current `LogService` types there.**
2. Refactor existing hooks to call `logService` instead of Supabase directly.
3. Move Supabase calls into `impl/supabaseLogService.ts`; export it via `contract/index.ts`.
4. Add _minimal_ Jest tests exercising each contract method.
5. Update contributing docs so future PRs follow the split.

Once done, you can delete Express or keep it as an alternate implementation—doesn't matter, the UI won't feel the difference.

---

## 7  FAQ

**Q Why not just GraphQL?**  
GraphQL is great, but still mixes transport, auth, and schema decisions. The contract layer here is *in-process* TypeScript—zero network, zero boilerplate, 100 % compiler-checked.

**Q Won't this explode into API-on-API madness?**  
With humans, yes. With LLMs + compiler guardrails, churning a few interfaces daily is cheap and safe. The contract is just code—version it, diff it, revert it like any other file.

**Q What about security?**  
Nothing stops you from plugging in a server-side implementation that uses the Supabase *service-role* key while the browser gets the anon one. The contract makes that swap invisible to the UI.

---

_Use this guide to keep humans and language models focused on their own layer, iterate quickly, and preserve sanity._ 