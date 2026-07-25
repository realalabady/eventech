import { describe, expect, it } from "vitest";

import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

type Messages = Record<string, unknown>;

function flattenKeys(obj: Messages, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      return flattenKeys(value as Messages, path);
    }
    return [path];
  });
}

function flattenValues(obj: Messages): Array<[string, unknown]> {
  return flattenKeys(obj).map((path) => {
    const value = path
      .split(".")
      .reduce<unknown>((acc, key) => (acc as Messages)[key], obj);
    return [path, value];
  });
}

describe("i18n messages", () => {
  it("keeps ar key-identical to en (no missing or extra translations)", () => {
    expect(flattenKeys(ar).sort()).toEqual(flattenKeys(en).sort());
  });

  it("has no empty or non-string values in any locale", () => {
    for (const locale of [en, ar]) {
      for (const [path, value] of flattenValues(locale as Messages)) {
        expect(typeof value, path).toBe("string");
        expect((value as string).trim().length, path).toBeGreaterThan(0);
      }
    }
  });
});
