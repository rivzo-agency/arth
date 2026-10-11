import { getAdminUser } from "../../../../admin-auth";
import { deleteMediaAsset, getMediaAsset } from "../../../../../db/control";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const { id } = await context.params;
  const asset = await getMediaAsset({ email: user.email, displayName: user.displayName }, id);
  if (!asset) return Response.json({ error: "Media file not found." }, { status: 404 });
  return new Response(new Uint8Array(asset.binary_data), {
    headers: {
      "Content-Type": asset.mime_type,
      "Content-Length": String(asset.file_size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.file_name)}`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const { id } = await context.params;
  await deleteMediaAsset({ email: user.email, displayName: user.displayName }, id);
  return Response.json({ ok: true });
}
