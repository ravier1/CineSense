import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { SignOutButton } from "../components/sign-out-button";
import { getDiscovery, type DiscoveryItem } from "../../lib/tmdb-discovery";

export const dynamic = "force-dynamic";

function MediaCard({ item }: { item: DiscoveryItem }) {
  return <article className="media-card"><div className="media-poster">{item.posterUrl ? <Image src={item.posterUrl} alt={`${item.title} poster`} fill sizes="(max-width: 700px) 42vw, 170px" /> : <span>{item.title}</span>}<span className="media-rating">★ {item.rating}</span></div><h3>{item.title}</h3><p>{item.year || "Coming soon"} · {item.kind}</p></article>;
}

function MediaSection({ title, description, items }: { title: string; description: string; items: DiscoveryItem[] }) {
  if (!items.length) return null;
  return <section className="media-section"><div className="section-heading"><div><h2>{title}</h2><p>{description}</p></div><Link className="text-link" href="/">See all →</Link></div><div className="media-grid">{items.map((item) => <MediaCard item={item} key={`${item.kind}-${item.id}`} />)}</div></section>;
}

export default async function DashboardPage() {
  const discovery = await getDiscovery();

  return <main className="dashboard-page"><nav className="nav"><Link className="brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link><div className="dashboard-nav"><span>Your home</span><SignOutButton /></div></nav><section className="dashboard-hero"><div><div className="eyebrow">Find something to watch</div><h1>A good film is waiting.</h1><p className="hero-copy">Browse what people are watching, keep track of what catches your eye, and make your next choice easier.</p><div className="actions"><Link className="button primary" href="/">Search films and shows</Link><Link className="button" href={"/import/trakt" as Route}>Import Trakt data</Link></div></div><div className="dashboard-stat"><span>THIS YEAR</span><strong>0</strong><p>films logged</p></div></section><div className="discovery-sections"><MediaSection title="Trending this week" description="A few things getting attention right now." items={discovery.trending} /><MediaSection title="Popular movies" description="Films people are adding to their lists." items={discovery.movies} /><MediaSection title="Popular shows" description="Series worth making time for." items={discovery.shows} /></div></main>;
}
