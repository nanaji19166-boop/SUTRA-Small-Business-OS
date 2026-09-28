export type LedgerEntry = {
  kind: "sale" | "purchase" | "payment_in" | "payment_out" | "expense";
  amount: number;
};

export function customerReceivable(
  sales: Array<{ totalAmount:number; paidAmount:number }>,
  openingBalance = 0,
) {
  return openingBalance + sales.reduce((sum,s) => sum + (s.totalAmount - s.paidAmount), 0);
}

export function supplierPayable(
  purchases: Array<{ totalAmount:number; paidAmount:number }>,
  openingBalance = 0,
) {
  return openingBalance + purchases.reduce((sum,p) => sum + (p.totalAmount - p.paidAmount), 0);
}

export function grossProfit(
  salesRevenue: number,
  costOfGoodsSold: number,
) {
  if (salesRevenue < 0 || costOfGoodsSold < 0) throw new Error("Financial values cannot be negative");
  return salesRevenue - costOfGoodsSold;
}
