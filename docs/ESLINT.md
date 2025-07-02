# ESLint in LogPanel

## 1. What is ESLint?
ESLint is a static-analysis tool for JavaScript / TypeScript. It:

1. Parses each source file into an **AST** (abstract syntax tree).
2. Executes a configurable set of **rules**—small JavaScript functions that walk the AST and report problems.
3. Reports the findings:
   * In the terminal (`npm run lint`).
   * Inline squiggles in editors like VS Code (via an ESLint extension).
   * In CI pipelines (a non-zero exit code fails the build).

Nothing is compiled or executed; ESLint looks only at source text.

## 2. Who runs it?
* **Developers**: run `npm run lint` or rely on the editor plugin.
* **CI**: a job such as `npm ci && npm run lint` blocks PRs that introduce errors.
* **Cursor / LLM Agent**: before opening PRs or committing, the agent invokes the same script—so it immediately sees boundary violations.

## 3. ESLint configuration in this repo

File: `.eslintrc.json`
```json
{
  "root": true,
  "plugins": ["import"],
  "extends": ["eslint:recommended", "plugin:import/typescript"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": ["packages/ui/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": [
          "error",
          { "patterns": ["@logpanel/service*", "@supabase/*"] }
        ]
      }
    }
  ]
}
```

### Key pieces
* **`overrides.files`** – limits the rule to UI source code.
* **`no-restricted-imports`** – built-in ESLint rule that blocks certain `import` specifiers.
* **`patterns`** – glob patterns; any matching import triggers an error.

### What it prevents
```
// ❌ This will fail linting inside packages/ui
import { supabase } from '@supabase/supabase-js';
import { logService } from '@logpanel/service/supabase';
```
The rule emits:
```
error  Import from '@supabase/supabase-js' is restricted; ...
```

### Why we enforce this
1. **Layer purity** – React components must talk only to the typed contract (`@logpanel/contract`), never directly to the service implementation or the database SDK.
2. **Swapability** – You can replace Supabase with another backend without touching UI code.
3. **LLM guidance** – When Cursor tries to add an invalid import, the linter fails, steering it back to the intended architecture.

## 4. Running ESLint
```bash
# once, to install dev deps
npm install

# check entire repo
npm run lint
```
The command expands to:
```
eslint . --ext .ts,.tsx
```

No errors → exit code 0.  Errors → non-zero exit code; CI fails.

## 5. Extending
* To forbid more paths, add them to `patterns`.
* To relax the restriction for a specific file, use an ESLint directive at the top:
  ```ts
  /* eslint-disable import/no-restricted-imports */
  ```
  (Avoid unless absolutely necessary.) 