---
name: test
description: >-
  Run, write, or debug unit tests for the Lexicora browser extension. Use when
  asked to test, run tests, add tests, check coverage, or verify utility logic.
metadata:
  type: skill
---

## Overview

Tests use **Vitest** with WXT's `WxtVitest()` plugin (`vitest.config.ts`). The plugin polyfills all browser extension APIs with `fakeBrowser` — an in-memory stub — so no real browser is needed.

## Running tests

```bash
bun run test             # single pass (CI)
bun run test:watch       # interactive watch mode (development)
bun run test:coverage    # V8 coverage report
```

To run a single test file:

```bash
bunx vitest run src/db/__tests__/search-blob.test.ts
```

## Test locations

Tests live in `__tests__/` directories co-located with the source:

| Test file | What it covers |
|---|---|
| `src/db/__tests__/search-blob.test.ts` | `buildEntrySearchBlob` / `buildTopicSearchBlob` |
| `src/lib/utils/__tests__/block-converter.test.ts` | `convertBlockNoteBlocks` |
| `src/lib/utils/__tests__/settings.test.ts` | WXT storage items via `fakeBrowser` |

## Writing new tests

**Pure utility functions** — import and call directly, no setup needed:

```typescript
import { describe, it, expect } from "vitest";
import { myUtil } from "../my-util";

describe("myUtil", () => {
  it("does the thing", () => {
    expect(myUtil("input")).toBe("expected");
  });
});
```

**Storage / browser API tests** — use `fakeBrowser.reset()` in `beforeEach` to isolate test state:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { myStorageItem } from "../storage/settings";

describe("myStorageItem", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("has correct default", async () => {
    expect(await myStorageItem.getValue()).toBe(expectedDefault);
  });
});
```

## What's testable (and what isn't)

**Good candidates:**
- Pure utility functions in `src/lib/utils/` and `src/db/`
- WXT `storage.defineItem` items — fully supported by `fakeBrowser`
- RxDB schema definitions (validate structure without a real DB)

**Not suited for unit tests:**
- React components — use integration/E2E for those
- `src/entrypoints/` code that calls `browser.*` APIs not covered by `fakeBrowser`
- Anything needing a real DOM with extension context (content scripts, sidepanel)
