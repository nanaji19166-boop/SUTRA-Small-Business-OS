export type InventoryMovementType =
  | "purchase" | "sale" | "adjustment_in" | "adjustment_out"
  | "transfer_in" | "transfer_out" | "opening";

export type InventoryMovement = {
  productId: string;
  locationId: string;
  quantity: number;
  unitCost: number;
  type: InventoryMovementType;
};

export function calculateStock(movements: InventoryMovement[], productId: string, locationId?: string): number {
  return movements
    .filter((m) => m.productId === productId && (!locationId || m.locationId === locationId))
    .reduce((sum, m) => sum + m.quantity, 0);
}

export function calculateWeightedAverageCost(movements: InventoryMovement[], productId: string, locationId?: string): number {
  const relevant = movements.filter(
    (m) => m.productId === productId && (!locationId || m.locationId === locationId) && m.quantity > 0
  );
  const quantity = relevant.reduce((sum, m) => sum + m.quantity, 0);
  if (quantity <= 0) return 0;
  return relevant.reduce((sum, m) => sum + m.quantity * m.unitCost, 0) / quantity;
}