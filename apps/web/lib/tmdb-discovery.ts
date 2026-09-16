type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

export type DiscoveryItem = {
  id: number;
  title: string;
  year: string;
  kind: "Movie" | "Series";
  posterUrl: string | null;
  rating: string;
};

function normalize(items: TmdbItem[], defaultKind: DiscoveryItem["kind"]): DiscoveryItem[] {
  return items.slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title ?? item.name ?? "Untitled",
    year: (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
    kind: item.media_type === "tv" ? "Series" : defaultKind,
    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    rating: item.vote_average ? item.vote_average.toFixed(1) : "—",
  }));
}

async function request(path: string) {
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey && !token) url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("TMDB unavailable");
  return (await response.json()) as { results?: TmdbItem[] };
}

const fallback: Record<string, DiscoveryItem[]> = {
  trending: [{ id: 693134, title: "Dune: Part Two", year: "2024", kind: "Movie", posterUrl: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg", rating: "8.1" }],
  movies: [],
  shows: [],
};

export async function getDiscovery() {
  if (!process.env.TMDB_API_KEY && !process.env.TMDB_READ_ACCESS_TOKEN) return fallback;
  try {
    const [trending, movies, shows] = await Promise.all([request("trending/all/week"), request("movie/popular"), request("tv/popular")]);
    return {
      trending: normalize(trending.results ?? [], "Movie"),
      movies: normalize(movies.results ?? [], "Movie"),
      shows: normalize(shows.results ?? [], "Series"),
    };
  } catch {
    return fallback;
  }
}
