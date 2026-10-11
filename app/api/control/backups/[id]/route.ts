import { getAdminUser } from "../../../../admin-auth";
import { getBackupPayload } from "../../../../../db/control";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const { id } = await context.params;
  const backup = await getBackupPayload({ email: user.email, displayName: user.displayName }, id);
  if (!backup) return Response.json({ error: "Backup not found." }, { status: 404 });
  return new Response(backup.payload, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="antriksh-backup-${id}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
