import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogPost } from "../../../db/public-content";
import { brand } from "../../brand";
import SiteHeader from "../../SiteHeader";
import { posts } from "../posts";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let managed: Awaited<ReturnType<typeof getPublishedBlogPost>> = null;
  try { managed = await getPublishedBlogPost(slug); } catch { managed = null; }
  const post = managed || posts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: [] },
    twitter: { title: post.title, description: post.excerpt, images: [] },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  let managed: Awaited<ReturnType<typeof getPublishedBlogPost>> = null;
  try { managed = await getPublishedBlogPost(slug); } catch { managed = null; }
  const fallback = posts.find((item) => item.slug === slug);
  const post = managed ? {
    ...managed,
    date: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(managed.publish_at || managed.created_at)),
    readingTime: `${Math.max(2, Math.ceil(managed.content.split(/\s+/).length / 200))} min read`,
    sections: managed.content.split(/\n{2,}/).filter(Boolean).map((copy, index) => [index === 0 ? "The perspective" : `Part ${index + 1}`, copy] as [string, string]),
  } : fallback;
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: managed?.publish_at || managed?.created_at || "2026-07-30",
    author: { "@type": "Organization", name: brand.name },
    publisher: { "@type": "Organization", name: brand.name },
  };

  return (
    <main className="blog-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="article-shell">
        <div className="service-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog">Insights</Link><span>/</span><span>{post.category}</span></div>
        <h1>{post.title}</h1>
        <p className="article-meta">ARTH by ANTRIKSH · {post.date} · {post.readingTime}</p>
        <div className="article-body">
          <p>{post.excerpt}</p>
          {post.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}
        </div>
      </article>
    </main>
  );
}
