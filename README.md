# eslint-plugin-fsaa

ESLint plugin for **FSAA** (Feature-Sliced Atomic Architecture). The same rules the starter templates ship in their `AGENTS.md` contract — as an npm package, for projects that were not scaffolded from the templates.

> Docs: https://aramex86.github.io/fsaa/agentic/ · Methodology: https://aramex86.github.io/fsaa/

## Rules

| Rule | Enforces |
|---|---|
| `fsaa/no-raw-fetch` | No direct `fetch`/`axios` calls in UI layers (`features/**/ui`, `shared/ui`, `pages`, route pages). Data access belongs to entities / feature logic. |
| `fsaa/boundary-imports` | Imports flow only downward (app → pages → features → entities → shared), including resolved relative paths — a feature can never import another feature, even through `../..`. |
| `fsaa/ui-location` | `.tsx` component files live only in UI directories (`src/pages`, `app/`, `features/<slice>/{ui,config}`, `shared/ui`). |
| `fsaa/feature-naming` | Slices under `features/` and `entities/` are `kebab-case`. |

## Usage (flat config, ESLint 9)

```js
// eslint.config.mjs
import fsaa from "eslint-plugin-fsaa";

export default [
  // your parser/settings blocks (TypeScript etc.) come first
  ...fsaa.configs.recommended,
];
```

`fsaa.configs.recommended` turns all four rules on. The pair partner — the `fsaa` CLI — scaffolds projects that already include this plugin's config; the AGENTS.md drift-check mirrors these rules server-side (one contract, two enforcers).

MIT © Veaceslav Bezusco