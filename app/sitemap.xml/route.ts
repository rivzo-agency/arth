import { posts } from "../blog/posts";
import { services } from "../data";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const paths = ["", ...services.map((service) => service.slug), "blog", ...posts.map((post) => `blog/${post.slug}`)];
  const now = new Date().toISOString();
  const entries = paths.map((path) => {
    const priority = path === "" ? "1.0" : path === "blog" ? "0.7" : "0.8";
    return `<url><loc>${origin}/${path}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
  }).join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
