export type MediaKind = "movie" | "show" | "season" | "episode";
export type PlaybackSource = "manual" | "trakt" | "jellyfin" | "stremio";
export type PlaybackEventType = "start" | "progress" | "pause" | "resume" | "stop" | "complete";

export interface MediaRef {
  id: string;
  kind: MediaKind;
  title: string;
  runtimeSeconds?: number;
  tmdbId?: number;
  imdbId?: string;
}

export interface PlaybackEvent {
  type: PlaybackEventType;
  mediaId: string;
  source: PlaybackSource;
  positionSeconds: number;
  durationSeconds?: number;
  occurredAt: string;
  deviceName?: string;
}
