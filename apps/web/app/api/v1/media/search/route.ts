const demoResults = [
  { id: "demo-dune-2", title: "Dune: Part Two", year: 2024, runtimeSeconds: 9960, source: "demo" },
  { id: "demo-past-lives", title: "Past Lives", year: 2023, runtimeSeconds: 6360, source: "demo" },
  { id: "demo-perfect-days", title: "Perfect Days", year: 2023, runtimeSeconds: 7440, source: "demo" },
];

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return Response.json({ results: [] });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json({ results: demoResults.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), source: "demo" });
  }

  const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&include_adult=false&page=1`, { next: { revalidate: 3600 } });
  if (!response.ok) return Response.json({ error: { code: "TMDB_UNAVAILABLE", message: "Movie search is temporarily unavailable." } }, { status: 502 });
  const data = await response.json();
  return Response.json({ results: data.results ?? [], source: "tmdb" });
}
