import { getAdminUser } from "../../../admin-auth";
import { createMediaAsset } from "../../../../db/control";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Sign in is required." }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await createMediaAsset(
      { email: user.email, displayName: user.displayName },
      { name: file.name, type: file.type || "application/octet-stream", bytes, altText: String(form.get("altText") ?? "") },
    );
    return Response.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The file could not be uploaded.";
    return Response.json({ error: message }, { status: 400 });
  }
}
