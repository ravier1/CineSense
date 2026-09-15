const features = [
  ["✦", "Keep your watch life", "Every movie, episode, rewatch, rating, and review in one calm, personal diary."],
  ["◌", "Share the moment", "Plan a cinema visit or share what you are watching now with the friends you choose."],
  ["↗", "Bring your history", "Import your Trakt history and keep your media life connected across Jellyfin and Stremio."],
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="/"><img className="brand-mark" src="/brand/cinesense-mark.svg" alt="" /><span>CineSense</span></a>
        <div className="nav-links"><a href="#features">Features</a><a href="#about">About</a><a href="/login">Sign in</a></div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">Your watch life, beautifully kept</div>
          <h1>Films are better when they become memories.</h1>
          <p className="hero-copy">CineSense is a social diary for everything you watch—at the cinema, at home, alone, or with friends.</p>
          <div className="actions"><a className="button primary" href="/signup">Create your diary</a><a className="button" href="#features">See how it works</a></div>
        </div>

        <aside className="dashboard-card" aria-label="Example current viewing card">
          <div className="card-top"><span>FRIEND ACTIVITY</span><span className="live-dot">● LIVE</span></div>
          <div className="poster"><div className="poster-title">Dune:<br />Part Two</div></div>
          <div className="progress-label"><span>Ravi is watching</span><span>1h 12m / 2h 46m</span></div>
          <div className="progress"><span /></div>
          <div className="card-meta"><span>PVR IMAX · IMAX</span><span>8:30 PM</span></div>
        </aside>
      </section>

      <section className="section" id="features">
        <div className="section-heading"><div><h2>A home for your film life.</h2><p>Simple enough to use every day. Thoughtful enough to keep forever.</p></div></div>
        <div className="feature-grid">{features.map(([icon, title, copy]) => <article className="feature" key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
    </main>
  );
}
