# SUTRA transaction engine rules

These rules are the contract between UI and persistence.

## Sales
- At least one positive line is required.
- Unit price and quantity are validated server-side.
- Discount cannot exceed subtotal.
- Paid amount cannot exceed total.
- Balance is always total minus paid.
- Stock is checked atomically before inventory is deducted.
- Sale creation is idempotent by business plus sale number.
- Scheduled collection requires a customer.
- Collection total must equal the sale total; outstanding is the sale balance after any upfront payment.

## Purchases
- At least one product line is required.
- Supplier is optional.
- Purchase increases inventory.
- Paid amount cannot exceed purchase total.
- Supplier outstanding is derived from confirmed purchases less supplier-linked payments.
- Purchase creation is idempotent by business plus purchase number.

## Payments
- Payments applied to a sale cannot exceed its current balance.
- Payments applied to a purchase cannot exceed its current outstanding.
- Payment must have a business-scoped target: sale, purchase, customer, or supplier.
- Collection payments must match the schedule customer and cannot exceed schedule outstanding.
- Collection next-due calculation must be calendar-aware; fixed 30-day months are not acceptable for the final implementation.

## Inventory
- Every stock-changing transaction creates an inventory movement.
- Sale movements are negative; purchase, opening and adjustment-in movements are positive.
- Transfers create paired out/in movements.
- Inventory valuation will use weighted-average cost unless a later product configuration explicitly selects another method.
- Location is part of stock identity; business-wide stock is the sum of location balances.

## Security
- Every query is business-scoped.
- Every mutation verifies active membership and role where required.
- RLS will be the final database enforcement layer.
- No production credentials, tokens or data belong in Git.
