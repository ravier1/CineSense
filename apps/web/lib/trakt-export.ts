import JSZip from "jszip";

export type TraktImportCategory = "history" | "ratings" | "watchlist" | "lists" | "other";

export interface TraktImportRecord {
  category: TraktImportCategory;
  kind: "movie" | "show" | "episode";
  title: string;
  year?: number;
  watchedAt?: string;
  rating?: number;
  ids: { trakt?: number; tmdb?: number; imdb?: string; tvdb?: number };
  sourceFile: string;
}

export interface TraktImportSummary {
  files: string[];
  records: TraktImportRecord[];
  counts: Record<TraktImportCategory, number>;
  ignoredFiles: string[];
}

function categoryForFile(name: string): TraktImportCategory {
  const lower = name.toLowerCase();
  if (lower.includes("history") || lower.includes("watched")) return "history";
  if (lower.includes("rating")) return "ratings";
  if (lower.includes("watchlist")) return "watchlist";
  if (lower.includes("list")) return "lists";
  return "other";
}

function objectValue(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = (value as Record<string, unknown>)[key];
  return candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate as Record<string, unknown> : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  const result = typeof value === "number" ? value : Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function normalizeRecord(value: unknown, category: TraktImportCategory, sourceFile: string): TraktImportRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  const media = objectValue(item, "movie") ?? objectValue(item, "show") ?? objectValue(item, "episode") ?? item;
  const episode = objectValue(item, "episode");
  const show = objectValue(item, "show");
  const ids = objectValue(media.ids) ?? {};
  const title = stringValue(media.title) ?? stringValue(item.title) ?? stringValue(show?.title);
  if (!title) return undefined;

  const kind = episode ? "episode" : objectValue(item, "movie") ? "movie" : objectValue(item, "show") ? "show" : category === "history" ? "movie" : "movie";
  const rating = numberValue(item.rating);
  return {
    category,
    kind,
    title,
    year: numberValue(media.year),
    watchedAt: stringValue(item.watched_at) ?? stringValue(item.last_watched_at) ?? stringValue(item.rated_at) ?? stringValue(item.created_at),
    rating: rating && rating <= 5 ? rating : rating ? rating / 2 : undefined,
    ids: {
      trakt: numberValue(ids.trakt),
      tmdb: numberValue(ids.tmdb),
      imdb: stringValue(ids.imdb),
      tvdb: numberValue(ids.tvdb),
    },
    sourceFile,
  };
}

function recordsFromJson(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  for (const key of ["data", "items", "history", "ratings", "watchlist", "lists"]) {
    if (Array.isArray(object[key])) return object[key] as unknown[];
  }
  return [value];
}

export async function parseTraktExport(buffer: ArrayBuffer): Promise<TraktImportSummary> {
  const zip = await JSZip.loadAsync(buffer);
  const summary: TraktImportSummary = {
    files: [],
    records: [],
    counts: { history: 0, ratings: 0, watchlist: 0, lists: 0, other: 0 },
    ignoredFiles: [],
  };

  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir || !name.toLowerCase().endsWith(".json")) continue;
    summary.files.push(name);
    try {
      const parsed = JSON.parse(await file.async("text")) as unknown;
      const category = categoryForFile(name);
      for (const item of recordsFromJson(parsed)) {
        const record = normalizeRecord(item, category, name);
        if (record) summary.records.push(record);
      }
      summary.counts[category] += summary.records.filter((record) => record.sourceFile === name).length;
    } catch {
      summary.ignoredFiles.push(name);
    }
  }

  return summary;
}

export function parseTraktJson(value: unknown, sourceFile = "upload.json"): TraktImportSummary {
  const category = categoryForFile(sourceFile);
  const records = recordsFromJson(value).flatMap((item) => {
    const record = normalizeRecord(item, category, sourceFile);
    return record ? [record] : [];
  });
  return { files: [sourceFile], records, counts: { history: category === "history" ? records.length : 0, ratings: category === "ratings" ? records.length : 0, watchlist: category === "watchlist" ? records.length : 0, lists: category === "lists" ? records.length : 0, other: category === "other" ? records.length : 0 }, ignoredFiles: [] };
}
