# CineSense

CineSense is a free, donation-supported social movie and TV diary. It combines the diary experience of Letterboxd with Trakt-style watch history, Jellyfin/Stremio integrations, cinema visit logging, and friend activity.

## Repository layout

```text
apps/web                 Next.js website and versioned API
packages/shared          Shared TypeScript types and validation contracts
packages/database        Database migrations and Supabase helpers
packages/integrations    Trakt export, Jellyfin, and Stremio adapters
outputs                  Product, API, and database design documents
```

## Local setup

```text
pnpm install
pnpm dev
```

The web app reads `apps/web/.env.local` during local development. Keep real keys there and keep `.env.example` as a blank template. The initial home page and health endpoint work without credentials.

## Deployment

The `apps/web` app is designed for GitHub-connected Vercel deployment. After pushing this repository to GitHub, import it into Vercel and set the root directory to `apps/web` if Vercel does not detect the workspace automatically.

For the production CineSense domain, add `cinesense.stream` in Vercel → Project Settings → Domains, then add the exact DNS record Vercel requests in Cloudflare. Vercel provisions HTTPS after the domain verifies.

Add these production environment values in Vercel:

```text
NEXT_PUBLIC_APP_URL=https://cinesense.stream
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
TMDB_API_KEY=your-tmdb-key
TMDB_READ_ACCESS_TOKEN=your-tmdb-read-token
```

In Supabase → Authentication → URL Configuration, set the Site URL to `https://cinesense.stream` and add these redirect URLs:

```text
https://cinesense.stream/auth/callback
http://localhost:3000/auth/callback
```

Keep “Allow new users to sign up” enabled under the email provider. If email confirmation is enabled, users must click the confirmation email before their first login. The confirmation email subject and content can be customized under Supabase → Authentication → Email Templates so it says CineSense rather than using the default wording.

## Product documents

- [MVP blueprint](outputs/CineSense_MVP_Blueprint.md)
- [API contract](outputs/CineSense_API_Spec.md)
- [Initial database schema](outputs/CineSense_schema.sql)
