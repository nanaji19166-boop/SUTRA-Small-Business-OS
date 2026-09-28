# SUTRA production checklist

## Completed in this phase
- Purchase UI wired to atomic purchase RPC and stock-in ledger.
- Customer creation and opening balances.
- Collection queue for active schedules and outstanding sales.
- Payment recording through the server-side payment RPC.
- Stock ledger view and low-stock calculation.
- Expense capture and operational finance summary.
- Live reports for sales, purchases, expenses, receivables and collections.
- Collection customer-consistency guard fixed in migration 0003.
- CI workflow added for typecheck, tests and production build.

## Required before production
- [ ] Create a dedicated Supabase production project and configure production environment secrets.
- [ ] Apply migrations in order and verify RLS policies with a non-owner staff account.
- [ ] Run CI successfully on the production branch.
- [ ] Add stock adjustments and location transfers with atomic RPCs.
- [ ] Add supplier management and supplier payable views.
- [ ] Add explicit multi-business selection; do not rely on first accessible business.
- [ ] Add role enforcement at UI and database mutation boundaries for every write path.
- [ ] Decide inventory valuation method (weighted average or FIFO) and replace the provisional movement-sum valuation.
- [ ] Add transaction reversal/cancellation workflows instead of destructive edits.
- [ ] Add automated integration tests for sale, purchase, payment, collection and stock concurrency.
- [ ] Add export/backup workflow and operational audit review.
- [ ] Verify mobile layouts on small Android screens and slow connections.
- [ ] Verify Telugu translations and date/currency formatting.
- [ ] Run security review for RLS, server actions, redirects and environment handling.
- [ ] Only after web/PWA production verification, generate the Android APK.

Floot remains the backup runtime until the independent deployment passes this checklist.
