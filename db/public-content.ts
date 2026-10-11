import { database, ensureDatabaseSchema } from "./mysql";

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicPortfolioProject = {
  id: string;
  name: string;
  slug: string;
  service: string;
  result: string;
  summary: string;
  project_url: string;
  status: string;
};

export async function getPublishedBlogPosts() {
  await ensureDatabaseSchema();
  const result = await database().prepare(`SELECT id, title, slug, category, excerpt, content, publish_at, created_at, updated_at
    FROM blog_posts WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP)
    ORDER BY COALESCE(publish_at, created_at) DESC`).all<PublicBlogPost>();
  return result.results ?? [];
}

export async function getPublishedBlogPost(slug: string) {
  await ensureDatabaseSchema();
  return database().prepare(`SELECT id, title, slug, category, excerpt, content, publish_at, created_at, updated_at
    FROM blog_posts WHERE slug = ? AND status = 'published' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP)
    LIMIT 1`).bind(slug).first<PublicBlogPost>();
}

export async function getPublishedPortfolioProjects() {
  await ensureDatabaseSchema();
  const result = await database().prepare(`SELECT id, name, slug, service, result, summary, project_url, status
    FROM portfolio_projects WHERE status IN ('published', 'featured')
    ORDER BY CASE WHEN status = 'featured' THEN 0 ELSE 1 END, updated_at DESC LIMIT 6`).all<PublicPortfolioProject>();
  return result.results ?? [];
}

export async function getPublishedWebsiteContent(websiteId: string, pageSlug?: string) {
  await ensureDatabaseSchema();
  const sql = pageSlug
    ? "SELECT page_name, slug, title, summary, seo_title, meta_description, version, updated_at FROM website_content WHERE website_id = ? AND slug = ? AND status = 'published' LIMIT 1"
    : "SELECT page_name, slug, title, summary, seo_title, meta_description, version, updated_at FROM website_content WHERE website_id = ? AND status = 'published' ORDER BY slug ASC";
  if (pageSlug) return database().prepare(sql).bind(websiteId, pageSlug).first<Record<string, unknown>>();
  const result = await database().prepare(sql).bind(websiteId).all<Record<string, unknown>>();
  return result.results ?? [];
}
