import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function SignupPage() {
  return <main className="auth-page"><div className="auth-card"><Link className="brand auth-brand" href="/"><Image className="brand-mark" src="/brand/cinesense-mark.svg" alt="" width={32} height={32} /><span>CineSense</span></Link><div className="eyebrow">Start your diary</div><h1>Make every watch count.</h1><p className="auth-copy">Keep your films, memories, and people in one place.</p><AuthForm mode="signup" /><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></div></main>;
}
