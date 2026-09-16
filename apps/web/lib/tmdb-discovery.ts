type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

type TmdbCredit = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path?: string | null;
};

type TmdbVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
};

type TmdbEpisode = {
  id: number;
  name?: string;
  air_date?: string;
  episode_number?: number;
  season_number?: number;
  overview?: string;
  still_path?: string | null;
};

type TmdbDetails = TmdbItem & {
  overview?: string;
  tagline?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  in_production?: boolean;
  last_episode_to_air?: TmdbEpisode | null;
  next_episode_to_air?: TmdbEpisode | null;
  vote_count?: number;
  genres?: { id: number; name: string }[];
  created_by?: TmdbCredit[];
  credits?: { cast?: TmdbCredit[]; crew?: TmdbCredit[] };
  videos?: { results?: TmdbVideo[] };
  "watch/providers"?: { results?: Record<string, { flatrate?: { provider_name: string }[]; rent?: { provider_name: string }[] }> };
};

export type DiscoveryItem = {
  id: number;
  title: string;
  year: string;
  kind: "Movie" | "Series";
  posterUrl: string | null;
  rating: string;
};

export type MediaType = "movie" | "tv";

export type MediaDetails = {
  id: number;
  title: string;
  kind: "Movie" | "Series";
  year: string;
  releaseDate: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: string;
  voteCount: string;
  runtime: number | null;
  overview: string;
  tagline: string;
  genres: string[];
  director: string | null;
  creators: string[];
  cast: { id: number; name: string; character: string; profileUrl: string | null }[];
  trailers: { key: string; name: string }[];
  providers: string[];
  seasonCount: number | null;
  episodeCount: number | null;
  status: string;
  inProduction: boolean;
  latestEpisode: EpisodeSummary | null;
  nextEpisode: EpisodeSummary | null;
};

export type EpisodeSummary = {
  name: string;
  airDate: string;
  seasonNumber: number;
  episodeNumber: number;
  overview: string;
  stillUrl: string | null;
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

async function request<T>(path: string) {
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (apiKey && !token) url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("TMDB unavailable");
  return (await response.json()) as T;
}

const fallback: Record<string, DiscoveryItem[]> = {
  trending: [{ id: 693134, title: "Dune: Part Two", year: "2024", kind: "Movie", posterUrl: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg", rating: "8.1" }],
  movies: [],
  shows: [],
};

export async function getDiscovery() {
  if (!process.env.TMDB_API_KEY && !process.env.TMDB_READ_ACCESS_TOKEN) return fallback;
  try {
    const [trending, movies, shows] = await Promise.all([request<{ results?: TmdbItem[] }>("trending/all/week"), request<{ results?: TmdbItem[] }>("movie/popular"), request<{ results?: TmdbItem[] }>("tv/popular")]);
    return {
      trending: normalize(trending.results ?? [], "Movie"),
      movies: normalize(movies.results ?? [], "Movie"),
      shows: normalize(shows.results ?? [], "Series"),
    };
  } catch {
    return fallback;
  }
}

function formatDate(date: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function formatVoteCount(count: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

function normalizeEpisode(episode: TmdbEpisode | null | undefined): EpisodeSummary | null {
  if (!episode) return null;
  return {
    name: episode.name ?? "Untitled episode",
    airDate: formatDate(episode.air_date ?? ""),
    seasonNumber: episode.season_number ?? 0,
    episodeNumber: episode.episode_number ?? 0,
    overview: episode.overview ?? "",
    stillUrl: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : null,
  };
}

export async function getMediaDetails(type: MediaType, id: number): Promise<MediaDetails | null> {
  if (!process.env.TMDB_API_KEY && !process.env.TMDB_READ_ACCESS_TOKEN) {
    if (type === "movie" && id === 693134) {
      return {
        id,
        title: "Dune: Part Two",
        kind: "Movie",
        year: "2024",
        releaseDate: "Mar 1, 2024",
        posterUrl: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
        rating: "8.1",
        voteCount: "",
        runtime: 166,
        overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        tagline: "Long live the fighters.",
        genres: ["Science Fiction", "Adventure"],
        director: "Denis Villeneuve",
        creators: [],
        cast: [],
        trailers: [{ key: "QqmbrvluQRA", name: "Official Trailer" }],
        providers: [],
        seasonCount: null,
        episodeCount: null,
        status: "Released",
        inProduction: false,
        latestEpisode: null,
        nextEpisode: null,
      };
    }
    return null;
  }

  try {
    const details = await request<TmdbDetails>(`${type}/${id}?append_to_response=credits,videos,watch/providers`);
    const releaseDate = details.release_date ?? details.first_air_date ?? "";
    const crew = details.credits?.crew ?? [];
    const director = type === "movie" ? crew.find((member) => member.job === "Director")?.name ?? null : null;
    const providers = details["watch/providers"]?.results?.IN;
    const providerNames = [...(providers?.flatrate ?? []), ...(providers?.rent ?? [])].map((provider) => provider.provider_name).filter((name, index, names) => names.indexOf(name) === index).slice(0, 4);
    const videos = (details.videos?.results ?? []).filter((video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"));

    return {
      id,
      title: details.title ?? details.name ?? "Untitled",
      kind: type === "tv" ? "Series" : "Movie",
      year: releaseDate.slice(0, 4),
      releaseDate: formatDate(releaseDate),
      posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null,
      rating: details.vote_average ? details.vote_average.toFixed(1) : "—",
      voteCount: details.vote_count ? formatVoteCount(details.vote_count) : "",
      runtime: type === "movie" ? details.runtime ?? null : details.episode_run_time?.[0] ?? null,
      overview: details.overview ?? "No overview has been added yet.",
      tagline: details.tagline ?? "",
      genres: (details.genres ?? []).map((genre) => genre.name),
      director,
      creators: type === "tv" ? (details.created_by ?? []).map((creator) => creator.name) : [],
      cast: (details.credits?.cast ?? []).slice(0, 12).map((member) => ({ id: member.id, name: member.name, character: member.character ?? "", profileUrl: member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : null })),
      trailers: videos.slice(0, 3).map((video) => ({ key: video.key, name: video.name })),
      providers: providerNames,
      seasonCount: type === "tv" ? details.number_of_seasons ?? null : null,
      episodeCount: type === "tv" ? details.number_of_episodes ?? null : null,
      status: details.status ?? "",
      inProduction: Boolean(details.in_production),
      latestEpisode: type === "tv" ? normalizeEpisode(details.last_episode_to_air) : null,
      nextEpisode: type === "tv" ? normalizeEpisode(details.next_episode_to_air) : null,
    };
  } catch {
    return null;
  }
}
