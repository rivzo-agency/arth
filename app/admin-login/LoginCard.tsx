"use client";

import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { brand } from "../brand";

export default function LoginCard({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("antriksh-admin-email");
    const timer = saved ? window.setTimeout(() => setEmail(saved), 0) : 0;
    return () => window.clearTimeout(timer);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Sign-in could not be completed.");
      if (remember) window.localStorage.setItem("antriksh-admin-email", email.trim());
      else window.localStorage.removeItem("antriksh-admin-email");
      window.location.assign(returnTo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in could not be completed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <section className="login-story" aria-label="About ANTRIKSH Control">
        <div className="login-lockup"><Image src={brand.mark} width={1338} height={1176} alt="" priority unoptimized /><Image className="login-wordmark" src={brand.wordmark} width={716} height={187} alt="ANTRIKSH" priority unoptimized /></div>
        <div className="login-story-copy">
          <p>Secure operations</p>
          <h1>Your entire agency,<br />under one <em>control.</em></h1>
          <span>Manage every client website, campaign, lead and deployment from one private ANTRIKSH workspace.</span>
        </div>
        <div className="login-points">
          <span><CheckCircle2 size={16} /> Central content management</span>
          <span><CheckCircle2 size={16} /> Transparent 28-day subscriptions</span>
          <span><CheckCircle2 size={16} /> Audited, non-destructive controls</span>
        </div>
        <p className="login-location">ANTRIKSH · Jaipur, Rajasthan, India</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-security"><ShieldCheck size={17} /><span>Protected admin area</span></div>
          <div className="login-card-heading"><span>Welcome back</span><h2>Sign in to ANTRIKSH Control</h2><p>Use your approved admin identity to continue.</p></div>
          <form onSubmit={submit}>
            <label><span>Admin email</span><div><Mail size={16} /><input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="administrator@your-domain.com" required autoComplete="email" /></div></label>
            <label><span>Password</span><div><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your admin password" required autoComplete="current-password" /><button className="login-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
            <div className="login-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Keep me signed in</span></label><span>Encrypted session</span></div>
            {error ? <p className="login-error" role="alert">{error}</p> : null}
            <button type="submit" disabled={submitting}>{submitting ? <KeyRound size={17} className="login-spin" /> : <LockKeyhole size={17} />}<span>{submitting ? "Signing in…" : "Sign in securely"}</span><ArrowRight size={17} /></button>
          </form>
          <div className="login-trust"><KeyRound size={16} /><p><strong>Private authentication</strong>Your password stays on your server and the browser receives only a signed, HTTP-only session cookie.</p></div>
          <p className="login-help">Access is limited to approved ANTRIKSH administrators.<br />Contact your system administrator if you need access.</p>
        </div>
      </section>
    </main>
  );
}
