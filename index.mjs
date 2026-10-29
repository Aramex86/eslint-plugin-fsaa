/* eslint-plugin-fsaa — the FSAA architecture rules as an ESLint plugin.
   One source of truth with the AGENTS.md contract: the drift-check and this
   plugin enforce the same rules. Zero runtime deps; needs eslint >= 9 (flat config). */
import noRawFetch from "./rules/no-raw-fetch.mjs";
import boundaryImports from "./rules/boundary-imports.mjs";
import uiLocation from "./rules/ui-location.mjs";
import featureNaming from "./rules/feature-naming.mjs";

const plugin = {
  meta: {
    name: "eslint-plugin-fsaa",
    version: "0.1.1",
  },
  rules: {
    "no-raw-fetch": noRawFetch,
    "boundary-imports": boundaryImports,
    "ui-location": uiLocation,
    "feature-naming": featureNaming,
  },
};

const recommended = {
  name: "fsaa/recommended",
  files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
  plugins: { fsaa: plugin },
  rules: {
    "fsaa/no-raw-fetch": "error",
    "fsaa/boundary-imports": "error",
    "fsaa/ui-location": "error",
    "fsaa/feature-naming": "error",
  },
};

plugin.configs = {
  recommended: [recommended],
  /** strict = recommended + comments on violations also fail (W4 item 16 groundwork) */
  strict: [
    {
      name: "fsaa/strict",
      files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
      plugins: { fsaa: plugin },
      rules: {
        "fsaa/no-raw-fetch": "error",
        "fsaa/boundary-imports": "error",
        "fsaa/ui-location": "error",
        "fsaa/feature-naming": "error",
      },
    },
  ],
};

export default plugin;