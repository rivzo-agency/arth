import AntrikshStudio from "./AntrikshStudio";
import { brand } from "./brand";
import { homeFaqs, services } from "./data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const resolvedSearchParams = await searchParams;
  const requestedService = Array.isArray(resolvedSearchParams.service)
    ? resolvedSearchParams.service[0]
    : resolvedSearchParams.service;
  const initialService = services.find(
    (service) => service.slug === requestedService || service.title === requestedService,
  )?.title ?? "";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
        "@id": "#organization",
        name: brand.name,
        alternateName: brand.shortName,
        slogan: brand.tagline,
        description: `${brand.descriptor} building brands, websites, SEO, and digital marketing systems in Jaipur, India.`,
        ...(brand.email ? { email: brand.email } : {}),
        telephone: brand.phoneHref,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
        areaServed: ["Jaipur", "Rajasthan", "India"],
        ...(brand.instagram ? { sameAs: [brand.instagram] } : {}),
      },
      {
        "@type": "WebSite",
        "@id": "#website",
        name: brand.name,
        publisher: { "@id": "#organization" },
        inLanguage: "en-IN",
      },
      {
        "@type": "ItemList",
        name: `${brand.name} digital services`,
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            name: service.title,
            description: service.short,
            provider: { "@id": "#organization" },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: homeFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AntrikshStudio initialService={initialService} />
    </>
  );
}
