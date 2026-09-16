import Image from "next/image";
import Link from "next/link";
import { getDiscovery, type DiscoveryItem } from "../lib/tmdb-discovery";
import { MediaCard as PosterMediaCard } from "./components/media-card";

const features = [
  ["✦", "Keep a proper diary", "Log films, episodes, rewatches, ratings, and the small details you want to remember."],
  ["◌", "Watch together", "Plan a cinema visit or let friends know what you are watching right now."],
  ["↗", "Bring your history", "Start with your Trakt export, then keep everything together across your streaming services and media servers."],
];

function MediaCard({ item }: { item: DiscoveryItem }) {
  return <PosterMediaCard item={item} />;
}

function MediaSection({ title, description, items }: { title: string; description: string; items: DiscoveryItem[] }) {
  if (!items.length) return null;
  return <section className="media-section"><div className="section-heading"><div><h2>{title}</h2><p>{description}</p></div><Link className="text-link" href="/signup">Save your picks →</Link></div><div className="media-grid">{items.map((item) => <MediaCard item={item} key={`${item.kind}-${item.id}`} />)}</div></section>;
}

export default async function Home() {
  const discovery = await getDiscovery();

  return (
    <main className="shell">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link>
        <div className="nav-links"><a href="/roadmap">Roadmap</a><a href="/donate">Donate</a><a href="/login">Sign in</a><a href="/signup">Sign up</a></div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">A home for your film diary</div>
          <h1>Remember what you watched.</h1>
          <p className="hero-copy">Keep a record of the films and shows you love, where you saw them, and who you shared them with.</p>
          <div className="actions"><a className="button primary" href="/signup">Start your diary</a><a className="button" href="#discover">Browse films and shows</a></div>
        </div>

        <aside className="dashboard-card" aria-label="Example current viewing card">
          <div className="card-top"><span>Watching now</span><span className="live-dot">● Live</span></div>
          <a className="poster" href="https://www.youtube.com/watch?v=QqmbrvluQRA" target="_blank" rel="noreferrer" aria-label="Watch the Dune: Part Two official trailer on YouTube"><Image className="poster-image" src="https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg" alt="Dune: Part Two desert scene" fill sizes="(max-width: 800px) 100vw, 420px" priority /><div className="poster-title">Dune:<br />Part Two</div><span className="trailer-pill">Watch trailer ↗</span></a>
          <div className="progress-label"><span>midnightreel is watching</span><span>1h 12m of 2h 46m</span></div>
          <div className="progress"><span /><svg className="progress-ornithopter" viewBox="0 0 112 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Current viewing position">
            <path d="M42 29L10 14L5 17L33 34L42 29ZM70 29L102 14L107 17L79 34L70 29Z" fill="currentColor" />
            <path d="M36 25C40 18 48 15 56 15C64 15 72 18 76 25L69 38H43L36 25Z" fill="currentColor" />
            <path d="M48 22C51 19 61 19 64 22L62 28H50L48 22Z" fill="var(--background)" />
            <path d="M42 38H70L65 44H47L42 38Z" fill="currentColor" />
          </svg></div>
          <div className="card-meta"><span>PVR Nexus, Koramangala · Bengaluru</span><span>Screen 4 · 1.90:1</span><span className="tech-badge" aria-label="IMAX Laser"><strong>IMAX</strong><small>Laser</small></span></div>
        </aside>
      </section>

      <div className="discovery-sections public-discovery" id="discover"><MediaSection title="Trending this week" description="What people are watching right now." items={discovery.trending} /><MediaSection title="Popular movies" description="Films getting added to watchlists." items={discovery.movies} /><MediaSection title="Popular shows" description="Series worth making time for." items={discovery.shows} /></div>

      <section className="section" id="features">
        <div className="section-heading"><div><h2>Made for the way you actually watch.</h2><p>Keep it personal, share what you want, and add detail when it matters.</p></div></div>
        <div className="feature-grid">{features.map(([icon, title, copy]) => <article className="feature" key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
    </main>
  );
}
