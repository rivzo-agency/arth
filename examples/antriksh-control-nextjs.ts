import "server-only";

export type AntrikshLicence = {
  active: boolean;
  state: "active" | "grace" | "inactive" | "expired" | "invalid" | "unavailable";
  websiteId?: string;
  planName?: string;
  nextDueDate?: string;
  graceEndDate?: string;
  checkedAt?: string;
};

export async function checkAntrikshLicence(): Promise<AntrikshLicence> {
  const controlUrl = process.env.ANTRIKSH_CONTROL_URL?.replace(/\/$/, "");
  const websiteId = process.env.ANTRIKSH_WEBSITE_ID;
  const licenceKey = process.env.ANTRIKSH_LICENCE_KEY;
  if (!controlUrl || !websiteId || !licenceKey) return { active: false, state: "invalid" };

  try {
    const response = await fetch(`${controlUrl}/api/licence/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId, licenceKey }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return { active: false, state: response.status === 503 ? "unavailable" : "invalid" };
    return await response.json() as AntrikshLicence;
  } catch {
    return { active: false, state: "unavailable" };
  }
}
