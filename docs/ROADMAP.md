# SUTRA build roadmap

## Completed in the independent runtime

- GitHub is the source of truth for the new runtime.
- Next.js + TypeScript application foundation.
- Supabase-ready SSR authentication client and route protection.
- PostgreSQL schema migration with business isolation and RLS.
- Deterministic sales and purchase calculations.
- Inventory quantity and weighted-average cost primitives.
- Calendar-aware collection schedule calculations.
- Receivable, payable and gross-profit primitives.
- Central role-permission contract.
- Mobile-first dashboard foundation.
- UI system documentation based on shadcn/ui blocks and Lumen UI recipes.

## Next implementation sequence

1. Connect a dedicated Supabase production project after the project owner confirms the organization/cost for creation.
2. Implement server-side repositories and transactional mutations against the schema.
3. Build sale entry workflow with customer/product selection, stock checks, partial payment and collection schedule.
4. Build purchase workflow with supplier/product selection and stock-in.
5. Build payment/collection workflow with due/overdue states.
6. Build stock ledger, adjustments and location transfer workflow.
7. Build expenses and finance summary.
8. Build reports and export.
9. Add business setup, team roles, settings and Telugu translations.
10. Add automated integration tests and security/performance review.
11. Deploy preview, perform mobile QA, then production deploy.
12. Generate Android APK only after the web/PWA runtime and data engine pass the production checklist.

## Safety

Floot remains untouched as the operational backup. The new runtime is additive and does not copy production data into GitHub.
