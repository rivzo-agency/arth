"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, ArrowUpRight, BarChart3, Code2, Gauge, Globe2, LayoutTemplate, Megaphone, PenTool, Search, Sparkles } from "lucide-react";
import { brand } from "./brand";
import { services } from "./data";
import SiteHeader from "./SiteHeader";
import StaticBrand from "./StaticBrand";
import Starfield from "./Starfield";
import "./launch.css";

const capabilityIcons = [LayoutTemplate, Code2, PenTool, Search, BarChart3, Gauge, Megaphone, Globe2];

const clientBrands = [
  {
    name: "SSC",
    fullName: "Suneja Sales Corporation",
    descriptor: "Stone commerce",
    className: "ssc",
    href: "https://kota-five-virid.vercel.app/",
  },
  {
    name: "Daily Dose",
    fullName: "Daily Dose Physiotherapy",
    descriptor: "Healthcare experience",
    className: "daily-dose",
    href: "https://dailydose-tawny.vercel.app/",
  },
  {
    name: "ZEVLY",
    fullName: "Zevly Clothing",
    descriptor: "Fashion commerce",
    className: "zevly",
    href: "https://zevly.co/",
  },
];

function ClientWordmark({ client, decorative = false }: { client: (typeof clientBrands)[number]; decorative?: boolean }) {
  const contents = (
    <>
      <span className="antriksh-client-symbol" aria-hidden="true">
        {client.className === "ssc" && <><i /><i /><i /></>}
        {client.className === "daily-dose" && <Activity size={31} strokeWidth={1.7} />}
        {client.className === "zevly" && <Sparkles size={28} strokeWidth={1.5} />}
      </span>
      <span className="antriksh-client-type"><strong>{client.name}</strong><small>{client.fullName}</small></span>
      <span className="antriksh-client-open"><ArrowUpRight size={17} /></span>
    </>
  );

  if (decorative) {
    return <span className={`antriksh-client-mark ${client.className}`} aria-hidden="true">{contents}</span>;
  }

  return (
    <a className={`antriksh-client-mark ${client.className}`} href={client.href} target="_blank" rel="noreferrer" aria-label={`Visit ${client.fullName}`}>
      {contents}
    </a>
  );
}

function ClientMarquee() {
  const repeatedClients = [...clientBrands, ...clientBrands];
  return (
    <section className="antriksh-client-worlds" id="work">
      <div className="antriksh-wrap antriksh-client-heading" data-reveal>
        <p>Selected client worlds</p>
        <h2>Different businesses.<br /><em>Distinct digital identities.</em></h2>
        <span>Every experience is designed from zero—around the audience, offer and ambition behind the brand.</span>
      </div>
      <div className="antriksh-marquee-shell" aria-label="Selected ARTH clients">
        <div className="antriksh-marquee-line">
          <div className="antriksh-marquee-track">
            {repeatedClients.map((client, index) => <ClientWordmark client={client} decorative={index >= clientBrands.length} key={`forward-${client.name}-${index}`} />)}
          </div>
        </div>
        <div className="antriksh-marquee-line reverse" aria-hidden="true">
          <div className="antriksh-marquee-track">
            {repeatedClients.map((client, index) => <ClientWordmark client={client} decorative key={`reverse-${client.name}-${index}`} />)}
          </div>
        </div>
      </div>
      <div className="antriksh-wrap antriksh-client-proof" data-reveal>
        <div><strong>Strategy first</strong><span>Built around a clear commercial goal.</span></div>
        <div><strong>Original by default</strong><span>No themes. No recycled visual systems.</span></div>
        <div><strong>Made to perform</strong><span>Responsive, fast and ready to grow.</span></div>
      </div>
    </section>
  );
}

function ContactForm({ initialService }: { initialService: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [selectedService, setSelectedService] = useState(initialService);
  const loadedAt = useRef<number | null>(null);

  useEffect(() => { loadedAt.current = Date.now(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, submittedAt: loadedAt.current ?? 0 }),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setSelectedService("");
      loadedAt.current = Date.now();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="antriksh-contact-form" onSubmit={submit} aria-label="Start an ARTH project">
      <input type="hidden" name="leadType" value="project" />
      <div className="form-honeypot" aria-hidden="true"><label htmlFor="companyWebsite">Company website</label><input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" /></div>
      <div className="antriksh-form-intro"><span>✦</span><div><strong>Start with the essentials.</strong><p>Share the signal. We will help shape the next move.</p></div></div>
      <div className="antriksh-form-grid">
        <label><span>Your name</span><input name="name" autoComplete="name" required maxLength={80} placeholder="How should we address you?" /></label>
        <label><span>Email address</span><input name="email" type="email" autoComplete="email" required maxLength={160} placeholder="you@company.com" /></label>
        <label><span>What do you need?</span><select name="service" value={selectedService} onChange={(event) => setSelectedService(event.target.value)} required><option value="" disabled>Select a service</option>{services.map((service) => <option value={service.title} key={service.slug}>{service.title}</option>)}</select></label>
        <label><span>A short brief</span><textarea name="message" required maxLength={1800} rows={5} placeholder="What are you building, and what should improve?" /></label>
      </div>
      <div className="antriksh-form-submit">
        <p className={`antriksh-form-status ${status}`} aria-live="polite">
          {status === "idle" && "Four fields. One clear next step."}
          {status === "sending" && "Sending your brief…"}
          {status === "success" && "Received. We will respond shortly."}
          {status === "error" && "Something went wrong. Please try again."}
        </p>
        <button type="submit" disabled={status === "sending"}>Send brief <ArrowRight size={18} /></button>
      </div>
    </form>
  );
}

export default function AntrikshStudio({ initialService = "" }: { initialService?: string }) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: .14 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="antriksh-site" id="top">
      <SiteHeader />

      <section className="antriksh-hero launch-hero" aria-labelledby="launch-title">
        <Starfield />
        <div className="antriksh-hero-grid" aria-hidden="true" />
        <div className="antriksh-wrap antriksh-hero-inner">
          <div className="antriksh-hero-copy">
            <p className="antriksh-hero-brandline"><span /> Independent digital studio · Jaipur / India</p>
            <p className="launch-coordinate">CREATIVE THINKING. COSMIC POSSIBILITIES.</p>
            <h1 id="launch-title">Your next<br />digital <em>universe.</em></h1>
            <p className="antriksh-hero-lead">Websites that work. Socials that connect. One creative partner to build, manage and grow your world online.</p>
            <div className="antriksh-hero-actions">
              <a className="antriksh-button antriksh-button-gold" href="#contact">Build with ARTH <ArrowRight size={18} /></a>
              <a className="antriksh-text-link" href="#services">Explore services <ArrowUpRight size={17} /></a>
            </div>
            <nav className="launch-shortcuts" aria-label="Explore digital services">
              <Link href="/?service=web-development#contact"><Code2 size={16} /> Websites <ArrowUpRight size={13} /></Link>
              <Link href="/?service=social-media-marketing#contact"><Megaphone size={16} /> Social media <ArrowUpRight size={13} /></Link>
              <Link href="/admin-login"><Gauge size={16} /> My workspace <ArrowUpRight size={13} /></Link>
            </nav>
          </div>

          <div className="antriksh-core antriksh-studio-board" data-reveal>
            <div className="antriksh-core-header"><span>ARTH digital workspace</span><span className="antriksh-live"><i /> Creative preview</span></div>
            <div className="antriksh-studio-canvas">
              <div className="antriksh-studio-browser">
                <div className="antriksh-window-bar"><span /><span /><span /><b>LAUNCH / 01</b></div>
                <div className="antriksh-browser-layout">
                  <aside><i /><i /><i /><i /></aside>
                  <div><small>Conversion-led design</small><strong>Digital experiences<br />with a point of view.</strong><Link className="launch-preview-link" href="/?service=web-design#contact">Explore <ArrowUpRight size={13} /></Link></div>
                </div>
              </div>
              <div className="antriksh-studio-social">
                <span>Social / creative</span>
                <strong>Ideas people<br />want to share.</strong>
                <div><i /><i /><i /></div>
              </div>
              <div className="antriksh-studio-growth">
                <span><BarChart3 size={15} /> Growth signal</span>
                <strong>Built to grow.</strong>
                <small>From first click to lasting connection</small>
                <svg viewBox="0 0 190 52" aria-hidden="true"><path d="M2 47 C28 42, 35 24, 58 31 S90 44, 108 22 S147 30, 188 4" /></svg>
              </div>
              <div className="antriksh-studio-cursor"><span>ARTH</span></div>
            </div>
            <div className="antriksh-studio-footer"><span>01 / Imagine</span><span>02 / Build</span><span>03 / Launch</span></div>
          </div>
        </div>
        <div className="antriksh-capability-rail"><div>WEB DESIGN <i>●</i> DEVELOPMENT <i>●</i> SOCIAL MEDIA <i>●</i> SEO <i>●</i> PAID GROWTH <i>●</i> BRANDING <i>●</i> WEB DESIGN <i>●</i> DEVELOPMENT <i>●</i></div></div>
      </section>

      <section className="antriksh-services" id="services">
        <div className="antriksh-wrap">
          <div className="antriksh-section-head" data-reveal>
            <div><h2>A senior digital team.<br /><em>Without the agency maze.</em></h2></div>
            <p>Bring us one challenge or the whole digital picture. We connect creative thinking with execution that ships.</p>
          </div>
          <div className="antriksh-service-grid">
            {services.map((service, index) => {
              const Icon = capabilityIcons[index % capabilityIcons.length];
              return (
                <Link href={`/?service=${service.slug}#contact`} className="antriksh-service-card" key={service.slug} data-reveal>
                  <div className={`antriksh-service-motion motion-${(index % 4) + 1}`} aria-hidden="true">
                    <span className="antriksh-motion-orbit" />
                    <span className="antriksh-motion-scan" />
                    <Icon size={38} strokeWidth={1.15} />
                    <span className="antriksh-motion-particles"><i /><i /><i /></span>
                  </div>
                  <small className="antriksh-service-index">0{index + 1}</small>
                  <h3>{service.title}</h3>
                  <p>{service.short}</p>
                  <div className="antriksh-service-bottom"><span>View service</span><ArrowUpRight size={18} /></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ClientMarquee />

      <section className="antriksh-contact" id="contact">
        <div className="antriksh-wrap antriksh-contact-grid">
          <div className="antriksh-contact-copy" data-reveal>
            <p className="antriksh-contact-intro">Let’s make it clear.</p>
            <h2>Tell us what<br />needs to <em>move.</em></h2>
            <p>A short brief is enough. We will come back with focused questions and the clearest useful next step.</p>
            <div className="antriksh-contact-direct"><a href={`tel:${brand.phoneHref}`}><span>Direct line</span><strong>{brand.phoneDisplay}</strong></a><span>Jaipur, Rajasthan · Working across India</span></div>
          </div>
          <div data-reveal><ContactForm key={initialService} initialService={initialService} /></div>
        </div>
      </section>

      <footer className="antriksh-footer">
        <div className="antriksh-wrap">
          <div className="antriksh-footer-top">
            <div><StaticBrand /><p>Websites, social media, campaigns and brand systems built to move businesses forward.</p></div>
            <div><small>Navigate</small><a href="#services">Services</a><a href="#work">Work</a><Link href="/blog">Insights</Link></div>
            <div><small>Connect</small><a href={`tel:${brand.phoneHref}`}>Call / WhatsApp</a>{brand.instagram && <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>}<Link href="/admin-login">Admin</Link></div>
          </div>
          <div className="antriksh-footer-word">ARTH<span>®</span></div>
          <div className="antriksh-footer-bottom"><span>© 2026 ARTH by ANTRIKSH</span><span>Jaipur · India</span><a href="#top">Back to top ↑</a></div>
        </div>
      </footer>
    </main>
  );
}
