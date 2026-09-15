import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function LoginPage() {
  return <main className="auth-page"><div className="auth-card"><Link className="brand auth-brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link><div className="eyebrow">Welcome back</div><h1>Return to your film life.</h1><p className="auth-copy">Sign in to your diary, watch plans, and friend activity.</p><AuthForm mode="login" /><p className="auth-switch">New to CineSense? <Link href="/signup">Create an account</Link></p></div></main>;
}
