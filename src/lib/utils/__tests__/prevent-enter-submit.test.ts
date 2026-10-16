import { describe, it, expect } from "vitest";
import type { KeyboardEvent } from "react";

import { preventEnterSubmit } from "../prevent-enter-submit";

/**
 * Enter in a text field must not save the form, while Enter on a button, in a
 * textarea or during IME composition has to keep working.
 */

function press(
  target: Element,
  { key = "Enter", isComposing = false } = {},
): boolean {
  let prevented = false;
  preventEnterSubmit({
    key,
    target,
    nativeEvent: { isComposing },
    preventDefault: () => {
      prevented = true;
    },
  } as unknown as KeyboardEvent<HTMLFormElement>);
  return prevented;
}

const input = (type: string) => {
  const element = document.createElement("input");
  element.type = type;
  return element;
};

describe("preventEnterSubmit", () => {
  it("stops Enter in a text field", () => {
    expect(press(input("text"))).toBe(true);
    expect(press(input("url"))).toBe(true);
    expect(press(input("search"))).toBe(true);
  });

  it("leaves other keys alone", () => {
    expect(press(input("text"), { key: "a" })).toBe(false);
  });

  it("leaves Enter on buttons and submit inputs alone", () => {
    expect(press(document.createElement("button"))).toBe(false);
    expect(press(input("submit"))).toBe(false);
    expect(press(input("button"))).toBe(false);
  });

  it("leaves Enter in a textarea alone, where it adds a line", () => {
    expect(press(document.createElement("textarea"))).toBe(false);
  });

  it("leaves Enter during IME composition alone", () => {
    expect(press(input("text"), { isComposing: true })).toBe(false);
  });
});
