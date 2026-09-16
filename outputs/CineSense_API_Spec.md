# CineSense API v1 — Initial Contract

Base URL: `https://cinesense.stream/api/v1`

Authenticated requests use `Authorization: Bearer <session-token>`. Connector writes also require an `Idempotency-Key` header.

## Media

### `GET /media/search?q={query}&page={page}`

Searches CineSense’s media index and TMDB. Returns canonical CineSense media records with TMDB, IMDb, and TVDB identifiers where available.

### `GET /media/{mediaId}`

Returns metadata, runtime, credits, poster, backdrop, and the user’s current status.

## Diary

### `GET /diary?userId={id}&cursor={cursor}`

Returns diary entries visible to the authenticated user.

### `POST /diary`

```json
{
  "mediaId": "media_uuid",
  "watchedAt": "2026-09-16T15:30:00Z",
  "rating": 4.5,
  "review": "A concise review.",
  "containsSpoilers": false,
  "venue": "PVR IMAX",
  "format": "imax-laser",
  "screen": "Screen 4",
  "aspectRatio": "1.90:1",
  "soundFormat": "dolby-atmos",
  "visibility": "friends"
}
```

### `PATCH /diary/{entryId}`

Updates a review, rating, viewing details, or visibility.

### `DELETE /diary/{entryId}`

Deletes the user’s diary entry and its associated play record.

## Watch plans

### `POST /watch-plans`

```json
{
  "mediaId": "media_uuid",
  "plannedStart": "2026-09-20T15:00:00Z",
  "venue": "PVR IMAX",
  "format": "imax-laser",
  "screen": "Screen 4",
  "aspectRatio": "1.90:1",
  "soundFormat": "dolby-atmos",
  "runtimeSeconds": 9960,
  "visibility": "friends",
  "notifyFriends": true
}
```

### `GET /watch-plans`

Returns the user’s plans and plans shared with them.

## Playback

### `POST /playback/sessions`

Starts or resumes a playback session.

```json
{
  "mediaId": "media_uuid",
  "source": "jellyfin",
  "externalItemId": "jellyfin-item-id",
  "deviceName": "Living room TV",
  "positionSeconds": 0,
  "durationSeconds": 9960,
  "visibility": "friends"
}
```

### `POST /playback/sessions/{sessionId}/events`

```json
{
  "type": "progress",
  "positionSeconds": 2520,
  "durationSeconds": 9960,
  "occurredAt": "2026-09-16T16:12:00Z"
}
```

Allowed event types: `start`, `progress`, `pause`, `resume`, `stop`, `complete`.

The server maintains one active session per user/media/source combination, deduplicates repeated connector events, and creates a diary play on `complete` or a configured completion threshold.

### `GET /playback/active`

Returns active sessions visible to the user and their friends.

## Trakt

### `POST /imports/trakt`

Accepts a user-provided Trakt ZIP or JSON export. The first response is a preview containing detected records and matching issues. A confirmed request commits watched history, ratings, watchlist, and lists to CineSense. No Trakt API credentials are used.

## Social

### `POST /follows/{userId}`

Follows a user, subject to their follow/privacy setting.

### `GET /feed?cursor={cursor}`

Returns visible plans, playback activity, diary entries, reviews, and follows.

### `GET /notifications`

Returns in-app notifications such as a friend’s shared watch plan or live viewing activity.

## Error format

```json
{
  "error": {
    "code": "MEDIA_NOT_FOUND",
    "message": "The requested media could not be found."
  }
}
```
