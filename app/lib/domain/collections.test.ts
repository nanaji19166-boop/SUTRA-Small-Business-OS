import { describe, expect, it } from "vitest";
import { applyCollectionPayment, nextDueDate } from "./collections";

describe("collection engine", () => {
  it("moves weekly schedules by seven days", () => {
    expect(nextDueDate(new Date("2026-09-28T00:00:00Z"), "weekly").toISOString().slice(0,10)).toBe("2026-10-05");
  });

  it("handles end-of-month monthly schedules", () => {
    expect(nextDueDate(new Date("2026-01-31T00:00:00Z"), "monthly").toISOString().slice(0,10)).toBe("2026-02-28");
  });

  it("never allows collection payment above outstanding", () => {
    expect(() => applyCollectionPayment(500,501)).toThrow("Payment exceeds collection outstanding");
  });
});