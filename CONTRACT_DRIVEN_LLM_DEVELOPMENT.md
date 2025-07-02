# Contract-Driven Multi-Agent Development: A Systems Approach

## Introduction

This document captures a conversation about solving a fundamental problem in LLM-assisted software development: how to have multiple language models (or human teams) work on the same codebase without creating chaos. It proposes a contract-layer architecture that enables true parallel development while maintaining system coherence.

---

## The Problem: Why We Need This

When language models edit complete applications, they often get lost in the details. They're simultaneously adjusting UI styling, tweaking API logic, and modifying database schemas. This creates several problems:

1. **Context pollution** - The model tries to hold too many concerns in its working memory
2. **Merge conflicts** - Changes sprawl across multiple layers, creating complex diffs
3. **Regression cycles** - Fixing one thing breaks another because everything is intertwined
4. **Serial bottlenecks** - Can't parallelize work when every change touches every layer

The traditional human solution—careful API design and team boundaries—works but requires extensive coordination overhead that negates the speed advantage of using LLMs.

---

## The Insight: What Makes This Different

Language models have three unique characteristics we can exploit:

1. **They don't mind writing boilerplate** - Creating explicit contracts and adapters is cheap
2. **They can regenerate quickly** - If an interface changes, updating implementations takes seconds
3. **They respect hard boundaries** - A TypeScript compiler error is unambiguous, unlike natural language instructions

This means we can use an "over-defined" architecture that would be too verbose for human teams but perfect for LLM agents.

---

## The Architecture: How It Works

### Core Concept: Three Layers, Three Agents

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Schema Layer  │     │  Service Layer  │     │    UI Layer     │
│                 │     │                 │     │                 │
│ Owns:           │     │ Owns:           │     │ Owns:           │
│ - DB tables     │     │ - Implementations│     │ - Components    │
│ - Types         │     │ - Business logic │     │ - User flows    │
│ - Contracts     │     │ - API adapters  │     │ - Presentation  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                              meets at
                         TypeScript Contract
```

### The Contract: Minimal Shared Truth

The contract is just TypeScript interfaces—no implementation, no side effects:

```typescript
export interface LogService {
  getRuns(): Promise<RunMeta[]>;
  getLogs(runId: string, opts?: LogQuery): Promise<LogRow[]>;
  createLog(log: NewLog): Promise<LogRow>;
}
```

This is the ONLY code all three agents must agree on. Everything else can vary.

### Version Coordination

Each layer tracks versions:
- `SCHEMA_VERSION` - Changes when database structure changes
- `CONTRACT_VERSION` - Changes when interfaces change  
- `IMPLEMENTATION_VERSION` - Must match CONTRACT_VERSION to compile

The compiler and CI enforce these automatically—no human coordination needed.

---

## The Process: From Story to System

### Phase 1: Parallel First Drafts
Given a user story, all three agents work simultaneously:
- **Schema agent** drafts tables and types
- **Service agent** sketches the contract interface
- **UI agent** mocks up screens with stub data

### Phase 2: Contract Negotiation
The first compilation attempt reveals mismatches. Each agent adjusts:
- Schema agent finalizes types
- Service agent locks the contract
- UI agent conforms to available methods

### Phase 3: Implementation Sprint
With contracts frozen:
- Service agent implements real data access
- UI agent builds real components
- Schema agent writes migration tests

### Phase 4: Integration
CI runs the full stack. Type errors surface immediately. Agents fix their own layers.

---

## Practical Outcomes: Speed vs. Safety

### What Gets Faster
- **Cross-layer features**: 2-10× faster than serial human handoffs
- **Iteration cycles**: Minutes instead of hours between proposal and running code
- **Conflict resolution**: Compiler decides instantly, no meetings

### What Stays the Same  
- **Human review**: Still needed for product decisions and quality gates
- **Architecture decisions**: Humans set the initial boundaries
- **Performance optimization**: Requires human judgment about trade-offs

### What Gets Harder
- **Tiny changes**: More ceremony for one-line fixes
- **Exploratory coding**: Boundaries can feel restrictive during prototyping

---

## Q&A: Common Concerns

**Q: Isn't this just traditional N-tier architecture?**  
A: Yes, but optimized for LLM workflows. The contracts are more granular and versioning more aggressive than humans would tolerate.

**Q: Won't we end up with contract explosion?**  
A: Potentially, but LLMs can manage hundreds of small contracts easily. The cognitive load shifts from humans to compilers.

**Q: How do you handle contract changes?**  
A: Bump version → CI fails → regenerate implementations. The whole cycle takes minutes, not days.

**Q: What about complex business logic?**  
A: Goes in the service layer. The UI literally cannot access the database, so there's no ambiguity.

**Q: Can humans work this way too?**  
A: They can, but usually won't. The overhead of writing contracts and adapters frustrates humans but costs LLMs nothing.

---

## Systems View: Emergence and Boundaries

Looking at this systemically, we're creating an environment where:

1. **Local complexity is allowed** - Each layer can be messy internally
2. **Global coherence is enforced** - Contracts create hard boundaries
3. **Evolution is cheap** - Changing contracts just triggers regeneration
4. **Failure is visible** - Type errors can't hide

The system exhibits emergent properties:
- **Parallel development** emerges from clear boundaries
- **Quality** emerges from automated testing at boundaries  
- **Speed** emerges from removing human coordination overhead
- **Flexibility** emerges from cheap regeneration

---

## Conclusion: A New Development Paradigm

This approach inverts traditional software development wisdom. Instead of minimizing layers and abstractions, we embrace them. Instead of careful upfront API design, we iterate rapidly. Instead of human coordination, we use compiler enforcement.

The result is a development process optimized for the strengths of language models: perfect memory for interfaces, unlimited patience for boilerplate, and instant regeneration when things change.

For teams willing to rethink their architecture around LLM capabilities rather than human preferences, this pattern offers a path to genuinely parallel, genuinely fast development without sacrificing correctness.

---

*The future of software development may not be AI replacing humans, but AI and humans working in fundamentally different patterns that play to each participant's strengths.*

---

## Guard-Rails Against Interface Drift

The contract pattern works only if layers can't "slip" changes past each other.  Below are concrete, automatable mechanisms you can drop into any CI pipeline.

1. **Package-level Versioning**  
   • Publish each layer as an internal npm workspace (`@app/schema`, `@app/contract`, `@app/service-supabase`, `@app/ui`).  
   • Semver rules enforced by a CI script:  
   ```text
   contract.major == service.major
   contract.minor <= service.minor
   ui depends on exact contract version
   ```

2. **Public-API Diff Gate**  
   Run `tsc --declaration` or `api-extractor` to produce `*.d.ts` bundles on every PR, then structural-diff against `main`.  Any change in a *public* symbol without a version bump blocks merge.

3. **Type Expectation Tests**  
   ```ts
   import { expectType } from 'tsd';
   expectType<LogService>(supabaseLogService); // fails if shapes diverge
   ```
   The UI compiles only if `import { logService }` matches the contract types.

4. **Mock-Driven UI Snapshots**  
   • Auto-generate an `inMemoryLogService` from the contract.  
   • Mount every component with this mock and run Jest/React-Testing-Library snapshots.  
   • If a contract change breaks rendering, the snapshot diff fails instantly.

5. **Property-Based Smoke Tests**  
   Use `fast-check` (or similar) to create random—but type-correct—objects and feed them into service functions and UI components. Crashes reveal hidden assumptions.

6. **OpenAPI / GraphQL Code-Gen Option**  
   Make the contract schema itself be the single source of truth (OAS file or GraphQL SDL). `yarn generate` re-creates types and stubs; CI refuses to merge if generated files are out of date.

7. **Isolated Test Universes**  
   • Schema tests run against SQLite or a throw-away Postgres container.  
   • Service tests mock Supabase via a local stub.  
   • UI tests never hit the network.  
   This ensures fails are local, not cascading.

8. **Controlled Churn**  
   It's OK for interfaces to change daily *provided* version constants bump and the full CI matrix passes. Regeneration is cheap for LLMs; instability only hurts when humans fix conflicts manually.

Implementing even half of these guard-rails virtually eliminates silent contract drift while preserving the rapid, parallel iteration that makes LLM-assisted development attractive. 

---

## Simplified Adoption Path

Not every project needs the full suite of version constants, CI gates, and package boundaries from day one.  Start with the *minimum that buys safety*, then add guard-rails only when the pain justifies the ceremony.

### 1  Minimal-Viable Setup (4 files)

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Single source of DB tables & Zod types |
| `contract/logs.ts` | **One** TypeScript interface (e.g. `LogService`) |
| `impl/supabaseLogService.ts` | Real implementation that talks to Supabase |
| `ui/…` | Components that import `logService` and render data |

Run `tsc`. If someone changes the contract or schema without updating the other layer, the compile fails—80 % of drift is caught.

### 2  Add Guard-Rails When Pain Appears

| Pain | First Aid |
|------|-----------|
| Accidental API changes land on `main` | Add a semver bump script & public-API diff gate |
| UI breaks silently after contract tweak | Add an in-memory mock + Jest snapshot test |
| Parallel PRs collide in the same folder | Split layers into workspaces, enforce version constraints |
| Complex data rules duplicated in UI | Promote that calculation to the service layer and expose via contract |

### 3  Mental Model

```
story/requirements
        │
        ▼
┌─── schema.ts ─┐   (owned by one agent)
│  contract.ts  │   ← minimal shared truth
└──────┬────────┘
       │
       ▼
 ui & service code  (each free to evolve)
```

Only the single contract file is global; everything below it can churn independently.

### 4  Heuristic

*If a guard-rail feels heavier than the bug it prevents, delay it.*  Compiler errors alone catch most mismatches; layer on extra CI gates only when you actually hit related bugs. 