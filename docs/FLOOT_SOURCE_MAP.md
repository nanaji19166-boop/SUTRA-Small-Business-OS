# Floot source map

The original SUTRA project is stored in Floot as a virtual project. During migration, files are preserved under floot-source/ using the same project-relative paths.

## Main areas

- floot-source/pages/ — SUTRA screens and protected layouts
- floot-source/endpoints/ — server API handlers and request schemas
- floot-source/helpers/ — database, auth/session, business access and client hooks
- floot-source/components/ — reusable UI components
- floot-source/base.css — SUTRA design tokens
- floot-source/static/__dev/dependencies.json — dependency inventory
- floot-source/static/__dev/design-principles.md — design principles
- floot-source/static/__dev/system-prompt.md — product requirements captured in the original project

## Floot-specific pieces to replace

The migrated source currently references Floot conventions such as FLOOT_DATABASE_URL and the Floot session cookie name. These are preserved in the source snapshot for traceability; the independent runtime must replace them with deployment-specific configuration.

Do not treat the Floot source snapshot as a finished standalone build until the runtime, database, authentication and deployment layers have been reconstructed and tested.
