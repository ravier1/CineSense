import Image from "next/image";
import Link from "next/link";

const roadmap = [
  { status: "Now", title: "Web diary and API", copy: "The free CineSense home for logging films and shows, writing reviews, importing history, planning cinema visits, and following friends.", state: "current" },
  { status: "Next", title: "Media-service connections", copy: "Plex, Stremio, and Jellyfin connections to sync watched history, continue-watching progress, current runtime, and live viewing activity where each service allows it.", state: "next" },
  { status: "After that", title: "Better social watching", copy: "Richer friend activity, watch-together plans, notifications, recommendations, cinema details, and more ways to choose what to watch next.", state: "planned" },
  { status: "Coming soon", title: "iOS and Android apps", copy: "Native mobile apps for logging on the go, checking your diary, sharing a cinema plan, and getting updates from your people.", state: "planned" },
];

export default function RoadmapPage() {
  return <main className="roadmap-page"><nav className="nav"><Link className="brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link><Link className="button" href="/">Back home</Link></nav><section className="roadmap-hero"><div className="eyebrow">Where we are going</div><h1>A better home for your watch history.</h1><p className="hero-copy">CineSense is being built in public, one useful piece at a time. The core stays free while we make it easier to carry your watch life with you.</p></section><section className="roadmap-list" aria-label="CineSense roadmap">{roadmap.map((item) => <article className={`roadmap-item roadmap-${item.state}`} key={item.title}><div className="roadmap-marker" aria-hidden="true" /><div><div className="roadmap-status">{item.status}</div><h2>{item.title}</h2><p>{item.copy}</p></div></article>)}</section><p className="roadmap-note">Dates will become clearer as each part is tested properly. Follow along, share feedback, and help shape what comes next.</p></main>;
}
