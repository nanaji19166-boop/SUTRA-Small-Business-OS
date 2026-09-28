# SUTRA — Small Business OS

SUTRA is a mobile-first, industry-neutral operating system for micro and small businesses.

## Architecture

- **Source of truth:** GitHub
- **Web runtime:** Next.js + TypeScript
- **Database/Auth target:** Supabase PostgreSQL + Supabase Auth
- **UI direction:** mobile-first, Telugu-first, accessible, low-tech friendly
- **Android:** planned after the web/PWA runtime and engine are production-verified
- **Floot:** preserved as an operational backup during migration

The original Floot source is retained separately under `floot-source/` for traceability. The independent runtime is being built under `app/`.

## Current implementation

- Transaction calculation and validation engine
- Inventory quantity and weighted-average primitives
- Calendar-aware collections
- Receivables, payables and gross-profit calculations
- Business role permissions
- Supabase-ready database schema and RLS migration
- Supabase SSR authentication foundation
- Mobile-first dashboard foundation
- UI design system and roadmap

## UI references

The interface direction uses open-source dashboard patterns from shadcn/ui and the Lumen UI dashboard/commerce recipes, while keeping SUTRA's own visual language and workflow rules.

See:
- `docs/UI_SYSTEM.md`
- `docs/ENGINE_RULES.md`
- `docs/ROADMAP.md`

## Development principle

Do not put production credentials, database rows, session tokens or API keys in this repository.
