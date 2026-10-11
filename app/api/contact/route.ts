import { createLeadRecord } from "../../../db/control";

export const runtime = "nodejs";

type LeadPayload = {
  leadType?: string;
  service?: string;
  name?: string;
  business?: string;
  email?: string;
  phone?: string;
  message?: string;
  companyWebsite?: string;
  submittedAt?: number;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;

    if (payload.companyWebsite) {
      return Response.json({ ok: true }, { status: 201 });
    }

    if (!payload.submittedAt || Date.now() - Number(payload.submittedAt) < 1200) {
      return Response.json({ error: "Please review your details and try again." }, { status: 400 });
    }

    const leadType = clean(payload.leadType, 40) || "project";
    const service = clean(payload.service, 80) || "Not specified";
    const name = clean(payload.name, 80);
    const business = clean(payload.business, 120) || "Not provided";
    const email = clean(payload.email, 160).toLowerCase();
    const phone = clean(payload.phone, 30);
    const message = clean(payload.message, 2000);

    if (!name || !email || !message) {
      return Response.json({ error: "Please complete every required field." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await createLeadRecord({ leadType, service, name, business, email, phone, message });

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "We could not save your request. Please try again shortly." }, { status: 500 });
  }
}
