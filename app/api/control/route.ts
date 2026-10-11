import { getAdminUser } from "../../admin-auth";
import {
  createBackup,
  createClient,
  createWebsite,
  deleteBackup,
  deleteBlogPost,
  deleteClient,
  deleteContent,
  deleteDeployment,
  deleteDomain,
  deleteLead,
  deletePayment,
  deletePortfolioProject,
  deleteSubscription,
  deleteSupportTicket,
  deleteWebsite,
  getControlSnapshot,
  recordPayment,
  renewSubscription,
  rotateSubscriptionKey,
  runSeoAudit,
  saveBlogPost,
  saveContent,
  saveDeployment,
  saveDomain,
  savePortfolioProject,
  saveSettings,
  saveSubscription,
  saveSupportTicket,
  setSubscriptionActive,
  updateClient,
  updateLead,
  updatePayment,
  updateWebsite,
} from "../../../db/control";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function actorOrNull() {
  const user = await getAdminUser();
  if (!user) return null;
  return { email: user.email, displayName: user.displayName };
}

export async function GET() {
  const actor = await actorOrNull();
  if (!actor) return Response.json({ error: "Sign in is required." }, { status: 401 });

  try {
    const snapshot = await getControlSnapshot(actor);
    return Response.json({ ok: true, user: actor, ...snapshot });
  } catch (error) {
    console.error("ANTRIKSH Control snapshot failed", error);
    return Response.json({ error: "ANTRIKSH Control could not load its database." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const actor = await actorOrNull();
  if (!actor) return Response.json({ error: "Sign in is required." }, { status: 401 });

  try {
    const payload = (await request.json()) as { action?: string; data?: Record<string, unknown> };
    const data = payload.data ?? {};
    let result: unknown = null;

    switch (payload.action) {
      case "createClient":
        result = await createClient(actor, data);
        break;
      case "updateClient":
        result = await updateClient(actor, data);
        break;
      case "deleteClient":
        result = await deleteClient(actor, String(data.id ?? ""));
        break;
      case "createWebsite":
        result = await createWebsite(actor, data);
        break;
      case "updateWebsite":
        result = await updateWebsite(actor, data);
        break;
      case "deleteWebsite":
        result = await deleteWebsite(actor, String(data.id ?? ""));
        break;
      case "renewSubscription":
        result = await renewSubscription(actor, String(data.subscriptionId ?? ""));
        break;
      case "setSubscriptionActive":
        result = await setSubscriptionActive(actor, String(data.subscriptionId ?? ""), data.active === true || String(data.active) === "true");
        break;
      case "rotateSubscriptionKey":
        result = await rotateSubscriptionKey(actor, String(data.subscriptionId ?? ""));
        break;
      case "saveSubscription":
        result = await saveSubscription(actor, data);
        break;
      case "deleteSubscription":
        result = await deleteSubscription(actor, String(data.id ?? ""));
        break;
      case "saveContent":
        result = await saveContent(actor, data);
        break;
      case "deleteContent":
        result = await deleteContent(actor, String(data.id ?? ""));
        break;
      case "recordPayment":
        result = await recordPayment(actor, data);
        break;
      case "updatePayment":
        result = await updatePayment(actor, data);
        break;
      case "deletePayment":
        result = await deletePayment(actor, String(data.id ?? ""));
        break;
      case "updateLead":
        result = await updateLead(actor, data);
        break;
      case "deleteLead":
        result = await deleteLead(actor, String(data.id ?? ""));
        break;
      case "saveBlogPost":
        result = await saveBlogPost(actor, data);
        break;
      case "deleteBlogPost":
        result = await deleteBlogPost(actor, String(data.id ?? ""));
        break;
      case "savePortfolioProject":
        result = await savePortfolioProject(actor, data);
        break;
      case "deletePortfolioProject":
        result = await deletePortfolioProject(actor, String(data.id ?? ""));
        break;
      case "saveDomain":
        result = await saveDomain(actor, data);
        break;
      case "deleteDomain":
        result = await deleteDomain(actor, String(data.id ?? ""));
        break;
      case "saveDeployment":
        result = await saveDeployment(actor, data);
        break;
      case "deleteDeployment":
        result = await deleteDeployment(actor, String(data.id ?? ""));
        break;
      case "saveSupportTicket":
        result = await saveSupportTicket(actor, data);
        break;
      case "deleteSupportTicket":
        result = await deleteSupportTicket(actor, String(data.id ?? ""));
        break;
      case "createBackup":
        result = await createBackup(actor, data);
        break;
      case "deleteBackup":
        result = await deleteBackup(actor, String(data.id ?? ""));
        break;
      case "runSeoAudit":
        result = await runSeoAudit(actor);
        break;
      case "saveSettings":
        await saveSettings(actor, data);
        result = { saved: true };
        break;
      default:
        return Response.json({ error: "Unsupported control action." }, { status: 400 });
    }

    return Response.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The action could not be completed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
