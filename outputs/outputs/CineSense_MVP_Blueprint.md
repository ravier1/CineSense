# CineSense MVP Blueprint

## Product

CineSense is a free, donation-supported social movie and TV diary. Users can import their existing Trakt history, manually log cinema visits, review films, follow friends, and optionally share planned or live viewing activity.

## MVP scope

- Email sign-up and login
- TMDB-powered movie and TV search
- Watched diary with individual plays and rewatches
- Ratings, reviews, spoiler marking, tags, and favorites
- Viewing details: date, cinema/venue, format, and runtime
- Watchlist and custom lists
- Profiles, follows, activity feed, and privacy controls
- “Plan to watch” activity with optional friend notifications
- Trakt ZIP/JSON export import only; no Trakt API credentials required
- Shared playback event model for Jellyfin, Trakt, Stremio, and manual logging

## Deliberately postponed

- Ticket-photo storage
- AI-written reviews and advanced recommendations
- Native iOS and Android apps
- Email, SMS, and push notifications
- Direct live Stremio progress unless a supported client-side connector is available

## Core user flows

### Log a film

Search a title → choose watched date → choose rating/review → optionally add venue and format → select visibility → save to diary.

### Plan a cinema visit

Choose title → choose date/time, venue, format, and sharing audience → create plan → notify selected friends → convert to a playback session or completed diary entry.

### Live playback

A connector sends start/progress/pause/resume/stop/complete events. CineSense updates one active session, shows an optional activity card to friends, and creates a diary play when complete.

## Architecture

- Next.js + TypeScript web app and API
- Supabase Auth, PostgreSQL, and Storage
- TMDB identifiers and metadata with required attribution
- Cloudflare DNS for `cinesense.stream`
- Vercel for the initial private/personal beta, with a portable deployment path if the project becomes public or donation-funded
- REST API under `/api/v1`, designed for future mobile clients

## Integration strategy

| Source | First implementation | Activity quality |
|---|---|---|
| Trakt | User-uploaded ZIP/JSON export | History, ratings, watchlist, and lists; no API connection |
| Jellyfin | Plugin/webhook/API adapter | Live start, pause, progress, stop, completion |
| Stremio | Trakt-backed sync and CineSense catalog | Watched/continue-watching; direct live progress requires a companion/client integration |
| Manual | Website controls | Full planned and live session support |

## Privacy defaults

- Diary entries are private unless shared.
- Live activity is visible only to accepted friends when explicitly enabled.
- Planned cinema visits are private until shared.
- Exact venue and progress can each be hidden separately.
- No location tracking.
- Connector tokens are never exposed to the browser after setup.

## Build sequence

1. Create Supabase project and schema.
2. Scaffold the Next.js web app and authentication.
3. Add TMDB search and media pages.
4. Add diary, ratings, reviews, lists, profiles, and follows.
5. Add watch plans, active sessions, and in-app notifications.
6. Add Trakt export import and matching/deduplication.
7. Add Jellyfin adapter.
8. Add Stremio/Trakt-export guidance and investigate direct client-side scrobbling.
9. Design the mobile apps against the stable API.

## Legal/product guardrails

- Do not scrape IMDb or copy third-party user reviews.
- Use TMDB metadata within its terms and display its attribution notice.
- Label AI-generated content clearly if AI is added later.
- Provide account deletion, data export, privacy controls, terms, and reporting/moderation tools before opening the service broadly.
