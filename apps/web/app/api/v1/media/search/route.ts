const demoResults = [
  { id: "demo-dune-2", title: "Dune: Part Two", year: 2024, runtimeSeconds: 9960, source: "demo" },
  { id: "demo-past-lives", title: "Past Lives", year: 2023, runtimeSeconds: 6360, source: "demo" },
  { id: "demo-perfect-days", title: "Perfect Days", year: 2023, runtimeSeconds: 7440, source: "demo" },
];

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return Response.json({ results: [] });

  const apiKey = process.env.TMDB_API_KEY;
  const readAccessToken = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!apiKey && !readAccessToken) {
    return Response.json({ results: demoResults.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), source: "demo" });
  }

  const url = new URL("https://api.themoviedb.org/3/search/multi");
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("page", "1");
  if (apiKey && !readAccessToken) url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, { headers: readAccessToken ? { Authorization: `Bearer ${readAccessToken}` } : undefined, next: { revalidate: 3600 } });
  if (!response.ok) return Response.json({ error: { code: "TMDB_UNAVAILABLE", message: "Movie search is temporarily unavailable." } }, { status: 502 });
  const data = await response.json();
  return Response.json({ results: data.results ?? [], source: "tmdb" });
}
