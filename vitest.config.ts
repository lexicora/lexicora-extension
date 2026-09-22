import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

/*
 * Vitest stays on 4 until WXT supports 5.
 *
 * WXT hands the browser flags to Vite as `define` entries for
 * `import.meta.env.FIREFOX` and friends. Under Vitest 5 those are no longer
 * replaced in the source but collected into Vite's env object, where every
 * value is a string — so `FIREFOX` reads as "false", which is truthy, and the
 * Firefox-only branches run in every test. Neither a setup file nor
 * `vi.stubEnv` can put the types back.
 *
 * Production builds are unaffected: there the define is a real replacement,
 * and the unused branches fold away. WXT 0.21 develops against Vitest 4.
 */

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: "happy-dom",
  },
});
