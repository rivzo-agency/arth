import { createHash } from "node:crypto";
import { database, ensureDatabaseSchema } from "./mysql";

type SubscriptionLicenceRow = {
  id: string;
  website_id: string;
  plan_name: string;
  status: string;
  licence_status: string;
  next_due_date: string;
  grace_end_date: string;
};

export type LicenceCheck = {
  active: boolean;
  state: "active" | "grace" | "inactive" | "expired" | "invalid";
  websiteId: string;
  planName?: string;
  nextDueDate?: string;
  graceEndDate?: string;
  checkedAt: string;
};

export async function checkWebsiteLicence(websiteId: string, token: string): Promise<LicenceCheck> {
  await ensureDatabaseSchema();
  const checkedAt = new Date().toISOString();
  const invalid: LicenceCheck = { active: false, state: "invalid", websiteId, checkedAt };
  if (!websiteId || !token.startsWith("antriksh_") || token.length > 160) return invalid;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await database().prepare(`SELECT id, website_id, plan_name, status, licence_status, next_due_date, grace_end_date
    FROM subscriptions WHERE website_id = ? AND licence_key_hash = ? LIMIT 1`)
    .bind(websiteId, tokenHash).first<SubscriptionLicenceRow>();
  if (!row) return invalid;

  await database().prepare("UPDATE subscriptions SET last_checked_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id).run();
  const today = checkedAt.slice(0, 10);
  const manuallyInactive = ["inactive", "cancelled", "suspended"].includes(row.status) || ["inactive", "suspended"].includes(row.licence_status);
  const expired = Boolean(row.grace_end_date && today > row.grace_end_date);
  const inGrace = Boolean(row.next_due_date && today > row.next_due_date && !expired);
  const state: LicenceCheck["state"] = manuallyInactive ? "inactive" : expired ? "expired" : inGrace ? "grace" : "active";

  return {
    active: state === "active" || state === "grace",
    state,
    websiteId: row.website_id,
    planName: row.plan_name,
    nextDueDate: row.next_due_date,
    graceEndDate: row.grace_end_date,
    checkedAt,
  };
}
