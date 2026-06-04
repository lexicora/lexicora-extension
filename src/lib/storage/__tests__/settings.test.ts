import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing";
import {
  themeStorage,
  captureSuggestionStorage,
  captureSuggestionDelayMultiplierStorage,
  sidePanelStateStorage,
} from "../settings";

describe("settings storage", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe("themeStorage", () => {
    it("defaults to system", async () => {
      expect(await themeStorage.getValue()).toBe("system");
    });

    it("persists a set value", async () => {
      await themeStorage.setValue("dark");
      expect(await themeStorage.getValue()).toBe("dark");
    });

    it("can be reset to default", async () => {
      await themeStorage.setValue("light");
      await themeStorage.removeValue();
      expect(await themeStorage.getValue()).toBe("system");
    });
  });

  describe("captureSuggestionStorage", () => {
    it("defaults to true", async () => {
      expect(await captureSuggestionStorage.getValue()).toBe(true);
    });

    it("can be disabled", async () => {
      await captureSuggestionStorage.setValue(false);
      expect(await captureSuggestionStorage.getValue()).toBe(false);
    });
  });

  describe("captureSuggestionDelayMultiplierStorage", () => {
    it("defaults to 5", async () => {
      expect(await captureSuggestionDelayMultiplierStorage.getValue()).toBe(5);
    });

    it("persists custom multiplier", async () => {
      await captureSuggestionDelayMultiplierStorage.setValue(10);
      expect(await captureSuggestionDelayMultiplierStorage.getValue()).toBe(10);
    });
  });

  describe("sidePanelStateStorage", () => {
    it("defaults to false", async () => {
      expect(await sidePanelStateStorage.getValue()).toBe(false);
    });

    it("can be set to open", async () => {
      await sidePanelStateStorage.setValue(true);
      expect(await sidePanelStateStorage.getValue()).toBe(true);
    });
  });
});
