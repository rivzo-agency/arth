import { checkWebsiteLicence } from "../../../../db/licence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { websiteId?: unknown; licenceKey?: unknown };
    const websiteId = typeof body.websiteId === "string" ? body.websiteId.trim().slice(0, 128) : "";
    const licenceKey = typeof body.licenceKey === "string" ? body.licenceKey.trim().slice(0, 160) : "";
    if (!websiteId || !licenceKey) return Response.json({ error: "Website ID and licence key are required." }, { status: 400 });
    const licence = await checkWebsiteLicence(websiteId, licenceKey);
    return Response.json(licence, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ active: false, state: "unavailable", error: "Licence service is temporarily unavailable." }, { status: 503 });
  }
}
