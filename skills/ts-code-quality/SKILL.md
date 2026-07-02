---
name: ts-code-quality
description: >-
  Sets up and enforces ESLint, Prettier, and TypeScript configuration for
  TypeScript projects, including VS Code settings and extension
  recommendations. Use this when the user wants to configure linting,
  formatting, or type-checking rules, set up a .vscode folder, add or
  recommend ESLint plugins, or improve code quality tooling in a TypeScript
  project. Does not handle commit hooks, commitlint, or lint-staged — that's
  a separate skill.
---

# TS Code Quality Skill

Sets up best-in-class ESLint, Prettier, TypeScript, EditorConfig, and Knip
configuration for TypeScript projects, plus matching VS Code
settings and extension recommendations.

## Detection logic (run first)

Run detection per **package** (each workspace in a monorepo, or once for a
single-repo project). Read the target project's `package.json`(s) and
workspace config first.

### 1. Is this a monorepo?

Check if `pnpm-workspace.yaml` has a `packages` field listing multiple
workspace directories, or if `turbo.json` defines workspace tasks via a
`pipeline` or `tasks` block. If either has workspace definitions:

- Per-package detection runs for each workspace to choose the right
  ESLint + tsconfig variant.
- Create shared config packages (`packages/eslint-config/`,
  `packages/typescript-config/`) instead of using root-level configs.
- Do **not** create root-level `tsconfig.json` or `eslint.config.js` —
  Turborepo recommends against them as they cause cache misses.

### 2. Per-package framework detection

Read `package.json` `dependencies` and `devDependencies`:

| If dep found                 | ESLint layer           | TypeScript config              |
| ---------------------------- | ---------------------- | ------------------------------ |
| `next`                       | base + nextjs          | `tsconfig.nextjs.json`         |
| `@tanstack/react-start`      | react + tanstack-start | `tsconfig.tanstack-start.json` |
| `fastify`                    | node + fastify         | `tsconfig.fastify.json`        |
| `express`                    | node + express         | `tsconfig.express.json`        |
| `react` (none of above)      | react only             | `tsconfig.react.json`          |
| none, but `"type": "module"` | node only              | `tsconfig.node.json`           |
| otherwise                    | base only              | `tsconfig.base.json`           |

> **Important:** `next` already bundles React + React Hooks rules via `eslint-config-next`.
> Do **not** add the `react` layer for Next.js projects — only `base + nextjs`.

### 3. Tailwind check

If `tailwindcss` is in deps AND the framework layer is react-based (react /
nextjs / tanstack-start):

- Merge `assets/eslint/tailwind.config.js`
- Merge `assets/prettier/.prettierrc.tailwind.json`'s fields into the
  base `.prettierrc.json` (adds `prettier-plugin-tailwindcss` and
  `tailwindFunctions`). Also add `tailwindStylesheet` pointing to the
  project's main CSS entry — detect the actual CSS entry file in the
  project (look for files like `globals.css`, `index.css`, `styles.css` in
  common locations) and use its path relative to the project/package root.

### 4. Package manager detection

**Default to pnpm** unless the user explicitly states they use npm or yarn.
Read `packageManager` field or check for lock files to confirm. Use the
detected manager in all install commands and script examples.

## Composition model

ESLint configs are flat config arrays that get spread together:

```
base.config.js         ← always (shared rules for all projects)
  + react layer        ← only for react / tanstack-start (adds JSX, a11y rules)
  + framework layer    ← one of: nextjs / tanstack-start / node / fastify / express
  + tailwind.config.js ← only if tailwindcss + react-based framework
```

> **Next.js note:** Since `eslint-config-next` already bundles React + React Hooks
> rules, Next.js gets `base + nextjs` — no separate `react` layer.
> TanStack Start IS NOT Next.js, so it still needs the `react` layer.

In practice, the agent should **copy the relevant asset files** into the
target project's directory structure, then create the project's
`eslint.config.js` that imports and composes them. The tsconfig files are
used via `extends`.

## Existing projects

When the target project already has config files (e.g., an existing monorepo
or a project that already has some tooling), do not blindly overwrite them.

### Existing eslint.config.js

The project may already have an ESLint flat config. **Replace it** with the
layered approach (base + framework) from this skill — this is a replacement,
not a merge. The old config's custom rules should be reviewed and ported if
still relevant. If the user has custom rules they want to keep, add them to
the appropriate layer config or as a separate config object in
`eslint.config.js`.

### Existing tsconfig.json

If the project already has a `tsconfig.json` with custom `compilerOptions`:
- Copy the relevant tsconfig variants (base, node, react, etc.) to
  `tsconfig/` as described below.
- Update the project's `tsconfig.json` to `extends` the correct variant.
- Preserve the project's existing `compilerOptions` (paths, outDir, etc.),
  only adding missing strictness flags from the variant.
- Add `include`/`exclude` patterns matching the project's structure.

### Existing package.json

Only add the code quality scripts and devDependencies listed below. Do **not**
remove or modify existing scripts or dependencies. Merge the new scripts into
the existing `scripts` block.

### Existing .vscode/

If `.vscode/settings.json` or `.vscode/extensions.json` already exist:
- Merge the recommended settings into the existing file.
- Preserve any custom settings the user already has.
- Only add the extension IDs that are missing from `extensions.json`.
- Do not remove any existing extension recommendations.

### Existing monorepo config

If `turbo.json` or `pnpm-workspace.yaml` already exist:
- Add the new tasks (`lint`, `lint:fix`, `typecheck`, `format`, `knip`) to
  the existing `turbo.json` pipeline.
- Ensure `pnpm-workspace.yaml` includes the packages that need tooling.
- Do not restructure the existing workspace layout.

### Existing .prettierrc / .editorconfig

If `.prettierrc.json` (or `.prettierrc` / `.prettierrc.yaml`) already exists:
- Compare the existing settings with the skill's recommended settings.
- Add missing options, but keep the user's existing preferences.

If `.editorconfig` already exists, compare and add any missing rules from
the skill's `.editorconfig`.

## File-by-file instructions

### Read the reference docs

Read the relevant reference files in `references/` for deeper rationale on
plugin choices, rule decisions, and config trade-offs:

- `references/eslint.md` — Plugin selection rationale, rule details,
  framework-specific tuning
- `references/prettier.md` — Prettier config details, Tailwind variant
- `references/knip.md` — Knip usage patterns and customization
- `references/editorconfig.md` — EditorConfig settings rationale
- `references/typescript.md` — TypeScript strictness philosophy, config
  hierarchy, per-variant details
- `references/vscode.md` — VS Code settings and extension recommendations

### 1. .editorconfig

Copy `assets/editorconfig/.editorconfig` to `<project-root>/.editorconfig`.

### 2. VS Code

Copy the `.vscode/` directory:

- `assets/vscode/settings.json` → `<project-root>/.vscode/settings.json`
- `assets/vscode/extensions.json` → `<project-root>/.vscode/extensions.json`

Then apply these **per-detection** modifications:

**Tailwind CSS** — If Tailwind is detected, add `tailwindCSS.experimental.configFile`
pointing to the project's main CSS entry point. Detect the actual CSS entry
file in the project (look for `globals.css`, `global.css`, `index.css`,
`styles.css` in common locations) and use its path relative to the project
or package root.

**TanStack Start** — If `@tanstack/react-start` is detected, merge these
entries to ignore the generated route file (`search.exclude` already
covered by base settings):

```json
{
  "files.watcherExclude": { "**/routeTree.gen.ts": true },
  "files.readonlyInclude": { "**/routeTree.gen.ts": true }
}
```

### 3. TypeScript configs

Copy the relevant tsconfig asset files to the project's `tsconfig/` directory
(or alongside the project's `tsconfig.json`). The choice of which variant
depends on the detection step above.

**TypeScript version**: Always install the latest TypeScript version.
Do not pin to a specific major — use whatever is current.

**File extension convention**: Use `.js` for all config files when
`"type": "module"` is set. Do NOT use `.mjs` extension — `.js` is correct
in ESM packages.

**No jsx/tsx in non-React projects**: For projects without React (base,
node, fastify, express variants), the `include` pattern must be only
`src/**/*.ts` — no `.tsx` or `.jsx` references. React-based variants
(react, nextjs, tanstack-start) should use `src/**/*.{ts,tsx}`.

Use `extends` in the project's actual `tsconfig.json`:

```json
{
  "extends": "./tsconfig/tsconfig.<variant>.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```

For monorepos, each package's `tsconfig.json` extends its variant. Create the
shared eslint config as a `packages/eslint-config/` package (exporting
`base.js`, `react.js`, `node.js`, etc.) and the shared tsconfig as
`packages/typescript-config/` (exporting `base.json`, `react.json`,
`node.json`, etc.), following the workspace package convention used in
projects like Turborepo. This allows packages to reference them via
workspace protocol (`"@workspace/eslint-config": "workspace:*"`).

### 4. ESLint config

Copy the relevant ESLint asset files to `<project-root>/eslint/`. Create
`<project-root>/eslint.config.js` that imports the selected layers based on
the detection table above:

**For Next.js:**
```js
import base from "./eslint/base.config.js";
import nextjs from "./eslint/nextjs.config.js";

export default [...base, ...nextjs];
```

**For TanStack Start or plain React:**
```js
import base from "./eslint/base.config.js";
import react from "./eslint/react.config.js";
import tanstackStart from "./eslint/tanstack-start.config.js";

export default [...base, ...react, ...tanstackStart];
```

**For backend frameworks (express / fastify):**
```js
import base from "./eslint/base.config.js";
import node from "./eslint/node.config.js";
import express from "./eslint/express.config.js";

export default [...base, ...node, ...express];
```

Always spread `base.config.js` first. For Next.js, do **not** include the
`react` layer — `eslint-config-next` already bundles React + React Hooks rules.
For TanStack Start and plain React, include both `base + react` (and optionally
`tanstack-start`).

### 5. Prettier

Copy `assets/prettier/.prettierrc.json` to `<project-root>/.prettierrc.json`.
If Tailwind is detected, merge the fields from
`assets/prettier/.prettierrc.tailwind.json` into the base config so the
final file includes `"plugins": ["prettier-plugin-tailwindcss"]` and
`"tailwindFunctions"`. Also add a `tailwindStylesheet` field with the
correct path to the project's main CSS entry — detect the actual CSS
entry file in the project (look for `globals.css`, `index.css`, `styles.css` in
common locations) and use its path relative to the project/package root. Always
use the `.json` extension — do NOT omit it.

Also create a `.prettierignore`:

```
dist
build
.next
out
pnpm-lock.yaml
**/routeTree.gen.ts
coverage
```

### 6. Knip

Run `pnpm create @knip/config` to generate a `knip.json` tailored to the
project's detected frameworks and structure. Add the script:

```json
"scripts": { "knip": "knip" }
```

### 7. Add dependencies

Run `pnpm add -D` to install the packages matching the detected layers. The
reference doc `eslint.md` lists every package grouped by layer. Install only
what's needed based on detection.

**Version policy**: Always install the latest version of every package. Do
not pin to specific versions unless the user explicitly requests a particular
version.

### 8. Add scripts to package.json

**Always create or update** the target project's `package.json` with scripts.
Do not skip this step — every project needs a `package.json` with scripts for
the code quality tooling to be usable.

For single-package projects, add scripts to the root `package.json`:

```json
{
  "scripts": {
    "lint": "eslint --max-warnings=0 .",
    "lint:fix": "eslint --max-warnings=0 --fix .",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "knip": "knip"
  }
}
```

For monorepos, add scripts to each package's `package.json` AND to the root
`package.json` using `turbo run` for lint/typecheck and direct commands for
format/knip.

### 9. Add CI workflow (optional, suggest to user)

Suggest adding a `.github/workflows/ci.yaml` that runs lint, format,
typecheck, and knip on push/PR. Do NOT create this file without asking —
some users have existing CI pipelines.

## Example scenarios

### Plain TS library

- Detection: no framework deps, no tailwind
- Configs: base eslint + node eslint, tsconfig.node.json
- Installed packages: core 9 + node plugins

### Next.js app with Tailwind

- Detection: next, tailwindcss
- Configs: base eslint + nextjs eslint + tailwind eslint,
  tsconfig.nextjs.json, .prettierrc.json (with tailwind plugin merged)
- Installed packages: core 9 + react/next + tailwind

### TanStack Start monorepo frontend + Fastify backend

- Root: no root configs (Turborepo guidance)
- Frontend pkg (react + tanstack-start + tailwind):
  base + react + tanstack-start + tailwind eslint,
  tsconfig.tanstack-start.json, .prettierrc.json (with tailwind plugin merged)
- Backend pkg (fastify):
  base + node + fastify eslint, tsconfig.fastify.json
- Shared config packages: `packages/eslint-config/` and `packages/typescript-config/`
- Installed packages: core 9 + all react + all node + tailwind
