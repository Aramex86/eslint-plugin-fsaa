# Changelog

## 0.2.0 — 2026-11-02

- **boundary-imports: bare `@/…` alias form resolved.** Repos mapping `"@/*" → "./src/*"` in tsconfig (instead of `@features/…`-style scopes) previously resolved to nothing — `fsaa/boundary-imports` ran effectively blind on them while reporting clean. Probed and verified against a real repo (etf-rebalancer): a `shared/` barrel re-exporting a feature via `@/features/…` now correctly reports `upward`; downward `@/…` imports stay legal.
- **self-alias parity extended:** `@/features/<own-slice>` inside a feature is flagged same as `@features/<own-slice>` (message `selfAlias`).
- **re-exports covered in tests:** `export … from` is treated as an import (already the rule's behavior since 0.1.0 — now pinned by regression cases, incl. the shared→feature barrel case reported from a community comment).
- +4 test cases for the new forms; 35/35 green. Zero runtime deps unchanged (peer `eslint >= 9` only).

## 0.1.1 — 2026-10-29

- **boundary-imports: self-alias ban** — `@features/<own-slice>` inside a feature file is now a violation (message `selfAlias`). Parity with drift-check v4.5: in the template canon own-slice imports are relative; the alias form always signals drift (v0.1.0 only caught imports into OTHER slices).
- No changes to other rules. Zero runtime deps unchanged (peer `eslint >= 9` only).

## 0.1.0 — 2026-10-28

- Initial public release: rules `fsaa/no-raw-fetch`, `fsaa/boundary-imports`, `fsaa/ui-location`, `fsaa/feature-naming` + `fsaa/recommended` / `fsaa/strict` flat configs.
