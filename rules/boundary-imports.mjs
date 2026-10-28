/* fsaa/rule boundary-imports — imports flow only downward.
   Layer order: app → pages → features → entities → shared.
   Mirrors drift-check v4.4 boundary scan: alias targets AND relative
   specifiers are RESOLVED (a "../.." may legally point down to entities —
   regex cannot tell it from a cross-slice hop). */

const LAYERS = ["shared", "entities", "features", "pages", "app"];

import path from "node:path";

export default {
  meta: {
    type: "problem",
    docs: { description: "imports flow only downward (app > pages > features > entities > shared)" },
    schema: [],
    messages: {
      upward:
        "FSAA boundary: '{{from}}' (layer {{fromLayer}}) imports '{{target}}' (layer {{targetLayer}}) — only layers BELOW yours.",
      crossSlice:
        "FSAA boundary: feature '{{fromSlice}}' imports into feature '{{targetSlice}}' — graduate the code via @entities (data) or @shared (UI).",
    },
  },
  create(context) {
    const filename = context.filename.replace(/\\/g, "/");
    const fromLayer = layerOf(filename);
    if (!fromLayer) return {};
    const fromIndex = LAYERS.indexOf(fromLayer);
    const ownSlice = fromLayer === "features" ? sliceOf(filename) : null;

    function checkSource(node, spec) {
      const target = resolveTarget(filename, spec);
      if (!target) return;
      // alias handled via tsconfig-style path mapping, relative via dirname
      const tLayer = layerOf(target);
      if (!tLayer) return;
      if (fromLayer === "features" && tLayer === "features") {
        const tSlice = sliceOf(target);
        if (tSlice && ownSlice && tSlice !== ownSlice) {
          context.report({ node, messageId: "crossSlice", data: { fromSlice: ownSlice, targetSlice: tSlice } });
        }
        return;
      }
      if (LAYERS.indexOf(tLayer) > fromIndex) {
        context.report({
          node,
          messageId: "upward",
          data: { from: filename.split("/").slice(-1)[0], fromLayer, target: spec, targetLayer: tLayer },
        });
      }
    }

    return {
      ImportDeclaration(node) { checkSource(node, String(node.source.value)); },
      ImportExpression(node) { checkSource(node, String(node.source.value)); },
      ExportNamedDeclaration(node) {
        if (node.source) checkSource(node, String(node.source.value));
      },
      ExportAllDeclaration(node) { checkSource(node, String(node.source.value)); },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "require")
          checkSource(node, String(node.arguments[0]?.value ?? ""));
      },
    };
  },
};

/** Which FSAA layer does this file/import path belong to? */
export function layerOf(p) {
  if (/(^|\/)src\/shared(\/|$)/.test(p)) return "shared";
  if (/(^|\/)src\/entities(\/|$)/.test(p)) return "entities";
  if (/(^|\/)src\/features(\/|$)/.test(p)) return "features";
  if (/(^|\/)src\/pages(\/|$)/.test(p)) return "pages";
  if (/(^|\/)src\/app(\/|$)/.test(p)) return "app"; // vite bootstrap (src/app)
  if (/(^|\/)app(\/|$)/.test(p) && !/\/src\//.test(p)) return "app"; // next.js route tree
  return null;
}

/** The feature slice name for a path under src/features, else null. */
function sliceOf(p) {
  const m = p.match(/src\/features\/([^/]+)(\/|$)/);
  return m ? m[1] : null;
}

/**
 * Resolve an import specifier to a repo path:
 * - '@features/x'  -> src/features/x
 * - '@entities/y'  -> src/entities/y
 * - '@shared/ui'   -> src/shared/ui
 * - '@pages/z'     -> src/pages/z
 * - '@app/..'      -> src/app/.. (vite) — in the Next template app/ is the route tree
 * - './a/b' '../'  -> resolved against the importing file's dirname
 */
function resolveTarget(importingFile, spec) {
  const aliasMap = {
    "@features/": "src/features/",
    "@entities/": "src/entities/",
    "@shared/": "src/shared/",
    "@pages/": "src/pages/",
    "@app/": "src/app/",
  };
  for (const [alias, targetPrefix] of Object.entries(aliasMap)) {
    if (spec === alias.slice(0, -1) || spec.startsWith(alias)) {
      return "/fsaa/" + targetPrefix + spec.slice(alias.length);
    }
  }
  if (spec.startsWith(".") || spec.startsWith("/")) {
    const dir = importingFile.slice(0, importingFile.lastIndexOf("/"));
    const joined = spec.startsWith("/") ? "/fsaa/src/" + spec.slice(1) : path.posix.normalize(dir + "/" + spec);
    return joined.replace(/^\/fsaa\/?/, "");
  }
  return null; // bare package imports (react, axios-as-dep) are out of scope here
}