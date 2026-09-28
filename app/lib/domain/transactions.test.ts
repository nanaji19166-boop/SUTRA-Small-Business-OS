import { describe, expect, it } from "vitest";
import { calculateTotals, validateCollection } from "./transactions";

describe("transaction engine", () => {
  it("calculates sale totals and outstanding balance", () => {
    expect(calculateTotals({
      lines:[{quantity:2,unitPrice:500},{quantity:1,unitPrice:250}],
      discount:100,
      paidAmount:400,
    })).toEqual({
      subtotal:1250, discount:100, total:1150, paidAmount:400, balanceAmount:750,
    });
  });

  it("rejects discount greater than subtotal", () => {
    expect(() => calculateTotals({
      lines:[{quantity:1,unitPrice:100}], discount:101, paidAmount:0,
    })).toThrow("Discount cannot exceed subtotal");
  });

  it("requires a customer for scheduled collections", () => {
    expect(() => validateCollection({
      saleTotal:1000, collectionTotal:1000, installmentAmount:250,
    })).toThrow("A customer is required");
  });

  it("requires collection total to match sale total", () => {
    expect(() => validateCollection({
      saleTotal:1000, customerId:"c1", collectionTotal:900, installmentAmount:225,
    })).toThrow("Collection total must equal");
  });
});