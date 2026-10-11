import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../SiteHeader";
import StaticBrand from "../StaticBrand";
import { brand } from "../brand";
import { services } from "../data";

type PageProps = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};

  return {
    title: `${service.title} Agency in Jaipur`,
    description: `${service.short} Work with ARTH by ANTRIKSH, an independent ${service.title.toLowerCase()} studio in Jaipur, Rajasthan.`,
    alternates: { canonical: `/${service.slug}` },
    openGraph: { title: service.title, description: service.short, images: [] },
    twitter: { title: service.title, description: service.short, images: [] },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { service: slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description: service.description,
        areaServed: ["Jaipur", "Rajasthan", "India"],
        provider: {
          "@type": "Organization",
          name: brand.name,
          ...(brand.email ? { email: brand.email } : {}),
          telephone: brand.phoneHref,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: service.title, item: `/${service.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="service-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />

      <section className="service-hero">
        <div className="container">
          <div className="service-breadcrumb"><Link href="/">Home</Link><span>/</span><span>{service.title}</span></div>
          <div className="service-hero-grid">
            <h1>{service.title}</h1>
            <div className="service-hero-copy">
              <p>{service.promise}</p>
              <div className="service-outcomes">{service.outcomes.map((outcome) => <span key={outcome}>{outcome}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-content">
        <div className="container">
          <div className="service-intro">
            <div><p className="section-kicker">What we solve</p><h2>Built around the<br /><em>business outcome.</em></h2></div>
            <p>{service.description}</p>
          </div>
          <div className="deliverables-grid">
            {service.deliverables.map((deliverable) => (
              <article key={deliverable}><h3>{deliverable}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container faq-grid">
          <div><p className="section-kicker">Questions, answered</p><h2>Know what to<br /><em>expect.</em></h2></div>
          <div className="faq-list">
            {service.faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0}>
                <summary>{faq.question}<i aria-hidden="true">+</i></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="service-next">
        <div className="container">
          <p>Ready when you are</p>
          <h2>Turn your next digital move into a growth advantage.</h2>
          <Link className="button button-light" href={`/?service=${service.slug}#contact`}>Start your project <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand"><StaticBrand /><p>{brand.tagline}</p></div>
            <div><small>Related services</small>{related.map((item) => <Link href={`/${item.slug}`} key={item.slug}>{item.title}</Link>)}</div>
            <div><small>Explore</small><Link href="/#services">Services</Link><Link href="/#work">Work</Link><Link href="/blog">Insights</Link></div>
            <div><small>Connect</small>{brand.email && <a href={`mailto:${brand.email}`}>{brand.email}</a>}<a href={`tel:${brand.phoneHref}`}>{brand.phoneDisplay}</a><span>Jaipur, Rajasthan</span></div>
          </div>
          <div className="footer-bottom"><span>© 2026 {brand.name}. All rights reserved.</span><span>{brand.tagline}</span><Link href="/">Home ↑</Link></div>
        </div>
      </footer>
    </main>
  );
}
