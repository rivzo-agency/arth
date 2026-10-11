import type { Metadata } from "next";
import { brand } from "./brand";
import ZeroGravity from "./ZeroGravity";
import "./globals.css";
import "./digital.css";

export async function generateMetadata(): Promise<Metadata> {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const metadataBase = new URL(configuredOrigin || (vercelOrigin ? `https://${vercelOrigin}` : "http://localhost:3000"));

  return {
    metadataBase,
    title: {
      default: `${brand.name} — ${brand.tagline}`,
      template: `%s | ${brand.name}`,
    },
    description: `${brand.name} creates high-converting websites, social media, digital campaigns and brand systems.`,
    keywords: [
      "web design company Jaipur",
      "website developer Jaipur",
      "SEO company Jaipur",
      "digital marketing agency Jaipur",
      "UI UX design Jaipur",
      "branding agency Jaipur",
    ],
    alternates: { canonical: "/" },
    icons: { icon: brand.mark, shortcut: brand.mark, apple: brand.mark },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: brand.name,
      title: `${brand.name} — ${brand.tagline}`,
      description: "Web development, social media management, performance campaigns and branding from one focused team.",
    },
    twitter: {
      card: "summary",
      title: `${brand.name} — ${brand.tagline}`,
      description: "Web development, social media management, performance campaigns and branding from one focused team.",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <ZeroGravity />
      </body>
    </html>
  );
}
