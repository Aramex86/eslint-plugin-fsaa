/* fsaa/rule ui-location — a UI component (anything .tsx) may live only in:
   src/pages/, src/app/ (next route tree / vite bootstrap), src/features/<slice>/ui/ or .../config/,
   src/shared/ui/, or tests. Anything else (e.g. a tsx deep in entities) is a placement violation. */

export default {
  meta: {
    type: "problem",
    docs: { description: ".tsx files must live in designated UI directories (ui-location)" },
    schema: [],
    messages: {
      orphanUi:
        "FSAA ui-location: '{{file}}' — a UI component file is not in any UI layer (src/pages, app/, src/features/<slice>/{ui,config}, src/shared/ui, tests).",
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, "/");
    if (!file.endsWith(".tsx")) return {};
    if (/__tests__\/|\.test\./.test(file)) return {};
    if (isAllowed(file)) return {};
    const short = file.split("/").slice(-3).join("/");
    context.report({ node: { type: "Program", loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } } }, messageId: "orphanUi", data: { file: short } });
    return {};
  },
};

function isAllowed(file) {
  return (
    /\/src\/pages\//.test(file) ||
    /\/src\/app\//.test(file) || // vite: src/app holds main.tsx bootstrap
    /(^|\/)app\//.test(file) || // next: root route tree
    /\/src\/features\/[^/]+\/(ui|config)\//.test(file) ||
    /\/src\/shared\/ui\//.test(file)
  );
}