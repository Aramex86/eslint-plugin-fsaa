import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.mjs"],
    environment: "node",
    globals: true, // eslint RuleTester registers cases through global it/describe
  },
});