import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaDetails, type MediaType } from "../../../../lib/tmdb-discovery";

export const revalidate = 3600;

function runtimeLabel(minutes: number | null) {
  if (!minutes) return "Runtime not listed";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours}h ${remaining ? `${remaining}m` : ""}`.trim() : `${remaining}m`;
}

export default async function TitlePage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if ((type !== "movie" && type !== "tv") || !/^\d+$/.test(id)) notFound();

  const media = await getMediaDetails(type as MediaType, Number(id));
  if (!media) notFound();
  const trailer = media.trailers[0];

  return <main className="title-page">
    <nav className="title-nav" aria-label="Title navigation">
      <Link className="brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link>
      <div className="title-nav-links"><Link href="/">Browse</Link><Link href="/signup">Create your diary</Link></div>
    </nav>

    <section className="title-hero">
      <div className="title-backdrop" aria-hidden="true">{media.backdropUrl && <Image src={media.backdropUrl} alt="" fill priority sizes="100vw" />}<div className="title-backdrop-shade" /></div>
      <div className="title-hero-inner">
        <div className="title-poster">{media.posterUrl ? <Image src={media.posterUrl} alt={`${media.title} poster`} fill priority sizes="(max-width: 700px) 46vw, 260px" /> : <span>{media.title}</span>}</div>
        <div className="title-copy">
          <div className="eyebrow">{media.kind}</div>
          <h1>{media.title}</h1>
          {media.tagline && <p className="title-tagline">{media.tagline}</p>}
          <div className="title-meta"><span>{media.year || "Year unknown"}</span><span>{runtimeLabel(media.runtime)}</span>{media.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
          <div className="title-rating"><strong>&#9733; {media.rating}</strong><span>TMDB rating{media.voteCount ? ` · ${media.voteCount} votes` : ""}</span></div>
          <p className="title-overview">{media.overview}</p>
          <div className="actions"><Link className="button primary" href={`/signup?title=${media.id}`}>Log this title</Link><Link className="button" href={`/signup?title=${media.id}`}>Add to watchlist</Link>{trailer && <a className="button" href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer">Watch trailer ↗</a>}</div>
        </div>
      </div>
    </section>

    <div className="title-content">
      <section className="title-section title-facts-section">
        <div><div className="eyebrow">The details</div><h2>Everything worth remembering.</h2></div>
        <dl className="title-facts">
          <div><dt>{media.kind === "Movie" ? "Director" : "Created by"}</dt><dd>{media.director ?? (media.creators.length ? media.creators.join(", ") : "Not listed")}</dd></div>
          <div><dt>Release date</dt><dd>{media.releaseDate || "Not listed"}</dd></div>
          <div><dt>Genres</dt><dd>{media.genres.length ? media.genres.join(" · ") : "Not listed"}</dd></div>
          <div><dt>Runtime</dt><dd>{runtimeLabel(media.runtime)}{media.kind === "Series" ? " per episode" : ""}</dd></div>
        </dl>
      </section>

      <section className="title-section cast-section"><div className="section-heading"><div><div className="eyebrow">In the film</div><h2>Cast</h2></div></div><div className="cast-grid">{media.cast.length ? media.cast.map((member) => <article className="cast-card" key={member.id}><div className="cast-photo">{member.profileUrl ? <Image src={member.profileUrl} alt={member.name} fill sizes="88px" /> : <span>{member.name.slice(0, 1)}</span>}</div><strong>{member.name}</strong><span>{member.character}</span></article>) : <p className="muted-copy">Cast details will appear here when TMDB provides them.</p>}</div></section>

      <section className="title-section title-diary-section"><div><div className="eyebrow">Your CineSense record</div><h2>Make it yours.</h2><p className="muted-copy">Log when you watched it, rate it, write a review, and add the cinema, format, screen, and aspect ratio when you want the memory to be complete.</p></div><div className="diary-actions"><Link className="button primary" href={`/signup?title=${media.id}`}>Start your entry</Link><span>Free forever · your diary stays yours</span></div></section>

      {media.providers.length > 0 && <section className="title-section"><div className="eyebrow">Availability</div><h2>Where to watch</h2><p className="muted-copy">Available in India on {media.providers.join(", ")}.</p></section>}
    </div>
  </main>;
}
