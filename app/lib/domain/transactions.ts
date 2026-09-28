export type SaleLine = { productId: string; quantity: number; unitPrice: number };
export type PurchaseLine = { productId: string; quantity: number; unitPrice: number };

export function calculateSubtotal(lines: Array<{ quantity:number; unitPrice:number }>): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function calculateTotals(input: {
  lines:Array<{quantity:number;unitPrice:number}>;
  discount:number;
  paidAmount:number;
}) {
  if (input.lines.length === 0) throw new Error("At least one line is required");
  for (const line of input.lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) throw new Error("Quantity must be greater than zero");
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) throw new Error("Unit price cannot be negative");
  }
  if (!Number.isFinite(input.discount) || input.discount < 0) throw new Error("Discount cannot be negative");
  if (!Number.isFinite(input.paidAmount) || input.paidAmount < 0) throw new Error("Paid amount cannot be negative");

  const subtotal = calculateSubtotal(input.lines);
  if (input.discount > subtotal) throw new Error("Discount cannot exceed subtotal");
  const total = subtotal - input.discount;
  if (input.paidAmount > total) throw new Error("Paid amount cannot exceed total");

  return { subtotal, discount:input.discount, total, paidAmount:input.paidAmount, balanceAmount:total-input.paidAmount };
}

export function validateCollection(input: {
  saleTotal:number;
  customerId?:string|null;
  collectionTotal?:number;
  installmentAmount?:number;
}) {
  if (input.collectionTotal === undefined) return;
  if (!input.customerId) throw new Error("A customer is required for scheduled collections");
  if (Math.abs(input.collectionTotal - input.saleTotal) > 0.01) {
    throw new Error("Collection total must equal the sale total");
  }
  if (!input.installmentAmount || input.installmentAmount <= 0) {
    throw new Error("Installment amount must be greater than zero");
  }
}