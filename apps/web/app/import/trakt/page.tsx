import Link from "next/link";
import { TraktImportForm } from "../../components/trakt-import-form";

export default function TraktImportPage() {
  return <main className="auth-page"><div className="auth-card import-card"><Link className="brand auth-brand" href="/"><img className="brand-mark" src="/brand/cinesense-mark.svg" alt="" /><span>CineSense</span></Link><div className="eyebrow">Bring your history</div><h1>Import from Trakt.</h1><p className="auth-copy">Download your Trakt export ZIP from Profile → Settings → Data, then upload it here. No Trakt API key or subscription is needed.</p><TraktImportForm /><p className="auth-switch"><Link href="/dashboard">← Back to dashboard</Link></p></div></main>;
}
