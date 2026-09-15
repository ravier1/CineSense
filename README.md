# CineSense

CineSense is a free, donation-supported social movie and TV diary. It combines the diary experience of Letterboxd with Trakt-style watch history, Jellyfin/Stremio integrations, cinema visit logging, and friend activity.

## Repository layout

```text
apps/web                 Next.js website and versioned API
packages/shared          Shared TypeScript types and validation contracts
packages/database        Database migrations and Supabase helpers
packages/integrations    Trakt, Jellyfin, and Stremio adapters
outputs                  Product, API, and database design documents
```

## Local setup

```text
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` when connecting external services. The initial home page and health endpoint work without credentials.

## Deployment

The `apps/web` app is designed for GitHub-connected Vercel deployment. After pushing this repository to GitHub, import it into Vercel and set the root directory to `apps/web` if Vercel does not detect the workspace automatically.

## Product documents

- [MVP blueprint](outputs/CineSense_MVP_Blueprint.md)
- [API contract](outputs/CineSense_API_Spec.md)
- [Initial database schema](outputs/CineSense_schema.sql)
