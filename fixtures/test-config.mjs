import fsaa from "../index.mjs";
export default [
  { ignores: ["**/node_modules/**"] },
  ...fsaa.configs.recommended,
];
