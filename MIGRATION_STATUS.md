# SUTRA migration status

## Source of truth

- Original builder: Floot
- Floot project ID: fd647e4e-1943-4af0-814d-46dfba6a3607
- Last verified Floot source version: 1790538046131
- GitHub repository: nanaji19166-boop/SUTRA-Small-Business-OS

## Current state

The GitHub repository now contains a floot-source/ snapshot of the production-relevant SUTRA source migrated from Floot, including the database schema helper, authentication/session code, business/customer/product/transaction endpoints, dashboard, core pages, and the UI components required by those pages.

The source is intentionally kept under floot-source/ during migration. This prevents accidental loss of the original Floot structure while we build the independent deployable runtime.

## Verification

- Floot typecheck: clean
- Floot production data was not copied into this public repository.
- No passwords, session tokens, database credentials, API keys, or other secrets belong in this repository.

## Remaining migration work

1. Complete the source snapshot for any non-production/example design-system files useful for archival completeness.
2. Reconstruct an independent React/TypeScript runtime around the migrated source.
3. Replace Floot-specific runtime services and environment variables.
4. Establish a new PostgreSQL target and migrate schema/data securely without putting database rows in Git.
5. Add automated tests for sales, purchases, payments, collections, expenses and inventory.
6. Validate the application end-to-end before production deployment or APK generation.

## Safety rule

The Floot application remains the operational backup until the independent deployment is verified. Do not delete, unpublish, or overwrite the Floot project as part of this migration.
