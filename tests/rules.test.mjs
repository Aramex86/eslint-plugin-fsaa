/* Rule tests — flat-config RuleTester (eslint 9). Filenames are the heart of
   FSAA location rules, so every case pins a realistic template-like path. */
import { RuleTester } from "eslint";
import { describe } from "vitest";
import noRawFetch from "../rules/no-raw-fetch.mjs";
import boundaryImports from "../rules/boundary-imports.mjs";
import uiLocation from "../rules/ui-location.mjs";
import featureNaming from "../rules/feature-naming.mjs";

const tester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
  },
});

// ---- no-raw-fetch -------------------------------------------------------------------
tester.run(
  "no-raw-fetch",
  noRawFetch,
  {
    valid: [
      {
        filename: "/proj/src/features/orders-overview/ui/OrdersOverview.tsx",
        code: "export const f = (cb) => cb();",
      },
      {
        filename: "/proj/src/entities/order/api.ts",
        code: "export const getOrders = () => fetch('/api/orders');", // entities MAY fetch
      },
      {
        filename: "/proj/src/shared/ui/molecules/table/DataTable.tsx",
        code: "const table = <div>data</div>;",
      },
    ],
    invalid: [
      {
        filename: "/proj/src/features/orders-overview/ui/OrdersOverview.tsx",
        code: "fetch('/api/orders');",
        errors: [{ messageId: "rawFetch" }],
      },
      {
        filename: "/proj/src/pages/HomePage.tsx",
        code: "axios.get('/x');",
        errors: [{ messageId: "axios" }],
      },
      {
        filename: "/proj/src/app/orders/page.tsx",
        code: "fetch('/x');",
        errors: [{ messageId: "rawFetch" }],
      },
    ],
  },
);

// ---- boundary-imports ----------------------------------------------------------------
tester.run(
  "boundary-imports",
  boundaryImports,
  {
    valid: [
      { // feature -> entity: downward
        filename: "/proj/src/features/orders-overview/ui/Orders.tsx",
        code: "import { getOrders } from '@entities/order';",
      },
      { // page -> feature: downward
        filename: "/proj/src/pages/HomePage.tsx",
        code: "import { ProjectsOverview } from '@features/projects-overview';",
      },
      { // relative cross-slice downward: ui/../.. => src, then entities — LEGAL
        filename: "/proj/src/features/orders-overview/ui/Orders.tsx",
        code: "import { getOrders } from '../../../entities/order';",
      },
      { // own-slice relative
        filename: "/proj/src/features/orders-overview/ui/Orders.tsx",
        code: "import { orderColumns } from '../config/orderColumns';",
      },
      { // entity -> shared: downward
        filename: "/proj/src/entities/order/api.ts",
        code: "import { format } from '@shared/ui/format';",
      },
    ],
    invalid: [
      { // relative cross-SLICE: ui/../.. then ANOTHER feature
        filename: "/proj/src/features/orders-overview/ui/Orders.tsx",
        code: "import { x } from '../../projects-overview';",
        errors: [{ messageId: "crossSlice" }],
      },
      { // feature -> pages: upward
        filename: "/proj/src/features/orders-overview/ui/Orders.tsx",
        code: "import { HomePage } from '@pages/HomePage';",
        errors: [{ messageId: "upward" }],
      },
      { // entity -> feature: upward
        filename: "/proj/src/entities/order/api.ts",
        code: "import { x } from '@features/orders-overview';",
        errors: [{ messageId: "upward" }],
      },
      { // shared -> entities: upward
        filename: "/proj/src/shared/ui/format.ts",
        code: "import { getOrders } from '@entities/order';",
        errors: [{ messageId: "upward" }],
      },
    ],
  },
);

// ---- ui-location -----------------------------------------------------------------------
tester.run(
  "ui-location",
  uiLocation,
  {
    valid: [
      { filename: "/proj/src/pages/HomePage.tsx", code: "const x = 1;" },
      { filename: "/proj/app/orders/page.tsx", code: "const x = 1;" }, // next route tree
      { filename: "/proj/src/features/orders-overview/ui/OrdersOverview.tsx", code: "const x = 1;" },
      { filename: "/proj/src/features/orders-overview/config/columns.tsx", code: "const x = 1;" }, // config holds columns (JSX render fns)
      { filename: "/proj/src/shared/ui/molecules/table/DataTable.tsx", code: "const x = 1;" },
      { filename: "/proj/src/entities/order/tests/order.test.tsx", code: "const x = 1;" }, // tests exempt
      { filename: "/proj/src/entities/order/types.ts", code: "export const TYPE_SHAPE = { a: 'x' };" }, // no tsx
    ],
    invalid: [
      { // UI component file deep in the data layer
        filename: "/proj/src/entities/order/UIOrderBadge.tsx",
        code: "export const Badge = () => null;",
        errors: [{ messageId: "orphanUi" }],
      },
      { // random tsx at layer root
        filename: "/proj/src/features/orders-overview/root.tsx",
        code: "export const X = () => null;",
        errors: [{ messageId: "orphanUi" }],
      },
    ],
  },
);

// ---- feature-naming ----------------------------------------------------------------------
tester.run(
  "feature-naming",
  featureNaming,
  {
    valid: [
      { filename: "/proj/src/features/orders-overview/ui/Orders.tsx", code: "const x = 1;" },
      { filename: "/proj/src/entities/order/api.ts", code: "const x = 1;" },
      { filename: "/proj/src/entities/invoice-report/ui/Report.tsx", code: "const x = 1;" },
    ],
    invalid: [
      {
        filename: "/proj/src/features/Checkout/ui/Checkout.tsx",
        code: "const x = 1;",
        errors: [{ messageId: "naming", data: { name: "Checkout" } }],
      },
      {
        filename: "/proj/src/entities/check_out/ui/T.tsx",
        code: "const x = 1;",
        errors: [{ messageId: "naming", data: { name: "check_out" } }],
      },
    ],
  },
);

import { test, expect } from "vitest";

test("all four rules wired in the plugin", async () => {
  const plugin = (await import("../index.mjs")).default;
  expect(Object.keys(plugin.rules)).toEqual(
    expect.arrayContaining(["no-raw-fetch", "boundary-imports", "ui-location", "feature-naming"]),
  );
  expect(Object.keys(plugin.configs)).toContain("recommended");
});