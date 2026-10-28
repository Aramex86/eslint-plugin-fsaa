/* fsaa/rule feature-naming — entities and features are named in kebab-case
   (lowercase words, digits, single dashes). A slice named "Checkout" or
   "check_out" will eventually collide with an import specifier. */

import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const cache = new Map(); // repo dir -> violations, computed once per run

export default {
  meta: {
    type: "problem",
    docs: { description: "features/ and entities/ slice names are kebab-case (feature-naming)" },
    schema: [],
    messages: {
      naming:
        "FSAA feature-naming: slice '{{name}}' — lowercase kebab-case only ([a-z][a-z0-9-]*).",
    },
  },
  create(context) {
    const filename = context.filename.replace(/\\/g, "/");
    const filesRoot = context.cwd.replace(/\\/g, "/");
    for (const layer of ["features", "entities"]) {
      const root = filesRoot + "/src/" + layer;
      for (const bad of sliceNameViolations(root))
        context.report({
          node: { type: "Program", loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } } },
          messageId: "naming",
          data: { name: bad },
        });
    }
    const fileSlice = filename.match(/src\/(features|entities)\/([^/]+)/);
    if (fileSlice && !/^[a-z][a-z0-9-]*$/.test(fileSlice[2])) {
      context.report({
        node: { type: "Program", loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } } },
        messageId: "naming",
        data: { name: fileSlice[2] },
      });
    }
    return {};
  },
};

function sliceNameViolations(root) {
  try {
    return readdirSync(root).filter((s) => statSync(path.join(root, s)).isDirectory() && !/^[a-z][a-z0-9-]*$/.test(s));
  } catch {
    return [];
  }
}