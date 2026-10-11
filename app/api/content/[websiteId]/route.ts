import { getPublishedWebsiteContent } from "../../../../db/public-content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ websiteId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { websiteId } = await context.params;
    const pageSlug = new URL(request.url).searchParams.get("slug") || undefined;
    const content = await getPublishedWebsiteContent(websiteId, pageSlug);
    if (pageSlug && !content) return Response.json({ error: "Published page not found." }, { status: 404 });
    return Response.json({ websiteId, content }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ error: "Published content is temporarily unavailable." }, { status: 503 });
  }
}
