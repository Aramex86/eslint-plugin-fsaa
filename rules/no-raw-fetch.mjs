/* fsaa/lib/boundary-imports — no raw fetch/axios in UI layers.
   Mirrors the AGENTS.md rule `no-ui-fetch` (both starter templates). */

export default {
  meta: {
    type: "problem",
    docs: { description: "no direct fetch/axios calls in UI layers (features ui, shared ui, pages, app routes)" },
    schema: [],
    messages: {
      rawFetch:
        "FSAA no-ui-fetch: '{{name}}' must not be called inside UI ({{file}}) — data access belongs to entities (data) or feature logic.",
      axios:
        "FSAA no-ui-fetch: axios import inside UI ({{file}}) — data access belongs to entities (data) or feature logic.",
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, "/");
    if (!isUiLayer(file)) return {};
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type === "Identifier" && callee.name === "fetch")
          context.report({ node, messageId: "rawFetch", data: { name: "fetch", file } });
        if (callee.type === "MemberExpression" && callee.object.type === "Identifier" && callee.object.name === "axios")
          context.report({ node, messageId: "axios", data: { file } });
        if (callee.type === "Identifier" && callee.name === "axios")
          context.report({ node, messageId: "axios", data: { file } });
      },
      ImportDeclaration(node) {
        if (/^axios(\b|\/)/.test(String(node.source.value)))
          context.report({ node, messageId: "axios", data: { file } });
      },
      ImportExpression(node) {
        if (/^axios(\b|\/)/.test(String(node.source.value)))
          context.report({ node, messageId: "axios", data: { file } });
      },
    };
  },
};

/** UI layers of both starter templates (next: app/ at root; vite: src/app). */
function isUiLayer(file) {
  return (
    /\/src\/features\/[^/]+\/ui\//.test(file) ||
    /\/src\/shared\/ui\//.test(file) ||
    /\/src\/pages\//.test(file) ||
    /\/src\/app\//.test(file) ||
    /(^|\/)app\/[^/]+\/page\.tsx$/.test(file) || // next.js route pages
    /(^|\/)app\/layout\.tsx$/.test(file)
  );
}