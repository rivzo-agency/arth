"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StaticBrand from "./StaticBrand";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`antriksh-header ${scrolled ? "is-scrolled" : ""} ${open ? "menu-open" : ""}`}>
      <div className="antriksh-wrap antriksh-header-inner">
        <StaticBrand className="antriksh-header-brand antriksh-header-static-brand" href="/#top" onClick={close} />
        <nav className="antriksh-header-links" aria-label="Primary navigation">
          <Link href="/#services">Services</Link>
          <Link href="/#work">Work</Link>
          <Link href="/blog">Insights</Link>
        </nav>
        <Link className="antriksh-header-cta" href="/#contact">Start a project <span aria-hidden="true">↗</span></Link>
        <button
          className={`antriksh-menu-button ${open ? "is-open" : ""}`}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span />
        </button>
      </div>
      <div className={`antriksh-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="antriksh-wrap antriksh-menu-grid">
          <p>Explore ARTH</p>
          <div className="antriksh-menu-links">
            <Link href="/#services" onClick={close}>Services<i>↗</i></Link>
            <Link href="/#work" onClick={close}>Selected work<i>↗</i></Link>
            <Link href="/blog" onClick={close}>Insights<i>↗</i></Link>
          </div>
          <Link className="antriksh-menu-project" href="/#contact" onClick={close}>Tell us what you are building <span>→</span></Link>
          <div className="antriksh-menu-meta"><span>Jaipur · India</span><span>Purpose, shaped into progress.</span></div>
        </div>
      </div>
    </header>
  );
}
