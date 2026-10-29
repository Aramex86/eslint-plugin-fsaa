# Changelog

## 0.1.1 — 2026-10-29

- **boundary-imports: self-alias ban** — `@features/<own-slice>` inside a feature file is now a violation (message `selfAlias`). Parity with drift-check v4.5: in the template canon own-slice imports are relative; the alias form always signals drift (v0.1.0 only caught imports into OTHER slices).
- No changes to other rules. Zero runtime deps unchanged (peer `eslint >= 9` only).

## 0.1.0 — 2026-10-28

- Initial public release: rules `fsaa/no-raw-fetch`, `fsaa/boundary-imports`, `fsaa/ui-location`, `fsaa/feature-naming` + `fsaa/recommended` / `fsaa/strict` flat configs.
