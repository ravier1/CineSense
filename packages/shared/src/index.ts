export type MediaKind = "movie" | "show" | "season" | "episode";
export type PlaybackSource = "manual" | "trakt" | "jellyfin" | "stremio";
export type PlaybackEventType = "start" | "progress" | "pause" | "resume" | "stop" | "complete";
export type ProjectionFormat = "standard" | "2k-laser" | "4k-laser" | "imax-digital" | "imax-laser" | "imax-70mm" | "4dx" | "screenx" | "dolby-cinema" | "other";
export type ScreenAspectRatio = "1.43:1" | "1.90:1" | "2.39:1" | "other";
export type SoundFormat = "standard" | "dolby-atmos" | "dolby-7.1" | "dts" | "other";

export interface CinemaViewingDetails {
  venue?: string;
  screen?: string;
  projectionFormat?: ProjectionFormat;
  aspectRatio?: ScreenAspectRatio;
  soundFormat?: SoundFormat;
}

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
