export type CollectionFrequency = "daily" | "weekly" | "fortnightly" | "monthly";

export function nextDueDate(from: Date, frequency: CollectionFrequency): Date {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  if (frequency === "fortnightly") next.setDate(next.getDate() + 14);
  if (frequency === "monthly") {
    const day = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  return next;
}

export function applyCollectionPayment(outstanding: number, amount: number) {
  if (!Number.isFinite(outstanding) || outstanding < 0) throw new Error("Invalid outstanding amount");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment must be greater than zero");
  if (amount > outstanding) throw new Error("Payment exceeds collection outstanding");
  return outstanding - amount;
}
