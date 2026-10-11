import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "../../db/public-content";
import SiteHeader from "../SiteHeader";
import { posts } from "./posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights on Web Design, SEO & Growth",
  description: "Practical perspectives from ARTH by ANTRIKSH on websites, social media, campaigns, identity, search and sustainable growth.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  let managed: Awaited<ReturnType<typeof getPublishedBlogPosts>> = [];
  try { managed = await getPublishedBlogPosts(); } catch { managed = []; }
  const managedSlugs = new Set(managed.map((post) => post.slug));
  const displayPosts = [
    ...managed.map((post) => ({
      slug: post.slug,
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      readingTime: `${Math.max(2, Math.ceil(post.content.split(/\s+/).length / 200))} min read`,
    })),
    ...posts.filter((post) => !managedSlugs.has(post.slug)),
  ];
  return (
    <main className="blog-page">
      <SiteHeader />
      <section className="blog-hero">
        <div className="container">
          <p className="section-kicker">Ideas and observations</p>
          <h1>Useful thinking for<br /><em>ambitious businesses.</em></h1>
          <p>Clear perspectives on design, search, brand, and the digital decisions that turn attention into growth.</p>
        </div>
      </section>
      <section className="container blog-grid">
        {displayPosts.map((post) => (
          <Link className="blog-card" href={`/blog/${post.slug}`} key={post.slug}>
            <div className="blog-card-visual" aria-hidden="true">
              <span className="blog-visual-window"><i /><i /><i /></span>
              <span className="blog-visual-copy"><b /><b /><b /><b /></span>
              <span className="blog-visual-metric">+24%</span>
            </div>
            <small>{post.category} · {post.readingTime}</small>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
