import { createHash, randomBytes } from "node:crypto";
import { database, ensureDatabaseSchema } from "./mysql";

export type ControlActor = {
  email: string;
  displayName: string;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function ensureControlStore(actor: ControlActor) {
  await ensureDatabaseSchema();
  const db = database();

  const row = await db.prepare("SELECT COUNT(*) AS total FROM clients").first<{ total: number }>();
  const defaults = [
    ["agency_name", "ANTRIKSH"],
    ["agency_email", ""],
    ["agency_phone", "+91 9828823210"],
    ["timezone", "Asia/Kolkata"],
    ["currency", "INR"],
    ["billing_cycle", "28"],
    ["grace_period", "7"],
  ];
  await db.batch(
    defaults.map(([key, value]) =>
      db.prepare(
        "INSERT IGNORE INTO control_settings (`key`, value, updated_by) VALUES (?, ?, ?)",
      ).bind(key, value, actor.email),
    ),
  );

  if (Number(row?.total ?? 0) === 0) {
    const today = new Date();
    const dailyStart = isoDate(addDays(today, -8));
    const dailyDue = isoDate(addDays(today, 20));
    const dailyGrace = isoDate(addDays(today, 27));
    const sunejaStart = isoDate(addDays(today, -22));
    const sunejaDue = isoDate(addDays(today, 6));
    const sunejaGrace = isoDate(addDays(today, 13));

    await db.batch([
    db.prepare(`INSERT INTO clients
      (id, business_name, contact_name, email, phone, industry, location, status, notes, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("cli_daily_dose", "Daily Dose Physiotherapy", "", "", "", "Healthcare", "Jaipur, Rajasthan", "active", "Portfolio website managed by ANTRIKSH.", actor.email, actor.email),
    db.prepare(`INSERT INTO clients
      (id, business_name, contact_name, email, phone, industry, location, status, notes, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("cli_suneja", "Suneja Sales Corporation", "", "", "", "Natural Stone", "Rajasthan, India", "active", "B2B catalogue website managed by ANTRIKSH.", actor.email, actor.email),
    db.prepare(`INSERT INTO websites
      (id, client_id, name, url, platform, environment, status, template, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("web_daily_dose", "cli_daily_dose", "Daily Dose Physiotherapy", "https://dailydose-tawny.vercel.app/", "Vercel", "production", "live", "Custom healthcare", actor.email, actor.email),
    db.prepare(`INSERT INTO websites
      (id, client_id, name, url, platform, environment, status, template, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("web_suneja", "cli_suneja", "Suneja Sales Corporation", "https://kota-five-virid.vercel.app/", "Vercel", "production", "live", "Custom catalogue", actor.email, actor.email),
    db.prepare(`INSERT INTO subscriptions
      (id, client_id, website_id, plan_name, cycle_days, start_date, next_due_date, grace_end_date, fee, status, licence_status, auto_renew, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("sub_daily_dose", "cli_daily_dose", "web_daily_dose", "Website Care", 28, dailyStart, dailyDue, dailyGrace, 0, "active", "active", 0, actor.email),
    db.prepare(`INSERT INTO subscriptions
      (id, client_id, website_id, plan_name, cycle_days, start_date, next_due_date, grace_end_date, fee, status, licence_status, auto_renew, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("sub_suneja", "cli_suneja", "web_suneja", "Website Care", 28, sunejaStart, sunejaDue, sunejaGrace, 0, "expiring", "active", 0, actor.email),
    db.prepare(`INSERT INTO website_content
      (id, website_id, page_name, slug, title, summary, seo_title, meta_description, status, version, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("content_daily_home", "web_daily_dose", "Home", "/", "Daily Dose Physiotherapy", "Physiotherapy and sports rehabilitation website in Jaipur.", "Daily Dose Physiotherapy & Sports Rehab", "Physiotherapy and sports rehabilitation services in Jaipur.", "published", 1, actor.email),
    db.prepare(`INSERT INTO website_content
      (id, website_id, page_name, slug, title, summary, seo_title, meta_description, status, version, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("content_suneja_home", "web_suneja", "Home", "/", "Suneja Sales Corporation", "Natural stone catalogue and bulk quotation experience.", "Suneja Sales Corporation — Natural Stone", "Explore natural stone products and request a bulk quotation.", "published", 1, actor.email),
    db.prepare(`INSERT INTO domains
      (id, client_id, website_id, domain, registrar, dns_provider, ssl_status, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("dom_daily_dose", "cli_daily_dose", "web_daily_dose", "dailydose-tawny.vercel.app", "Not connected", "Vercel", "valid", "verified"),
    db.prepare(`INSERT INTO domains
      (id, client_id, website_id, domain, registrar, dns_provider, ssl_status, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("dom_suneja", "cli_suneja", "web_suneja", "kota-five-virid.vercel.app", "Not connected", "Vercel", "valid", "verified"),
    db.prepare(`INSERT INTO deployments
      (id, website_id, environment, platform, status, production_url, commit_ref, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("dep_daily_initial", "web_daily_dose", "production", "Vercel", "ready", "https://dailydose-tawny.vercel.app/", "", actor.email),
    db.prepare(`INSERT INTO deployments
      (id, website_id, environment, platform, status, production_url, commit_ref, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind("dep_suneja_initial", "web_suneja", "production", "Vercel", "ready", "https://kota-five-virid.vercel.app/", "", actor.email),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), actor.email, "ANTRIKSH Control initialized", "system", "control", "Created the secure private workspace and imported existing website records.", 1),
    ]);
  }

  const [blogCount, projectCount] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS total FROM blog_posts").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM portfolio_projects").first<{ total: number }>(),
  ]);

  if (Number(blogCount?.total ?? 0) === 0) {
    await db.batch([
      db.prepare(`INSERT INTO blog_posts
        (id, title, slug, category, excerpt, content, status, publish_at, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`).bind(
          "post_conversion_2026",
          "What a high-converting website needs in 2026",
          "high-converting-website-2026",
          "Strategy",
          "A practical framework for clearer positioning, stronger trust and more qualified enquiries.",
          "A high-converting website makes the offer clear, earns trust quickly, and gives each visitor a useful next step. Review the message hierarchy, proof, mobile experience and contact journey before increasing traffic.",
          "published",
          actor.email,
          actor.email,
        ),
      db.prepare(`INSERT INTO blog_posts
        (id, title, slug, category, excerpt, content, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          "post_local_seo",
          "Local SEO foundations for Jaipur businesses",
          "local-seo-foundations-jaipur",
          "SEO",
          "Build local relevance with useful service pages, accurate listings and measurable conversion paths.",
          "Start with the searches real customers use, then connect service relevance, location proof, reviews and a clear enquiry path. Measure calls and qualified leads rather than rankings alone.",
          "draft",
          actor.email,
          actor.email,
        ),
    ]);
  }

  if (Number(projectCount?.total ?? 0) === 0) {
    await db.batch([
      db.prepare(`INSERT INTO portfolio_projects
        (id, name, slug, service, result, summary, project_url, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          "project_daily_dose", "Daily Dose Physiotherapy", "daily-dose-physiotherapy",
          "Website design & development", "+38% enquiry intent",
          "A focused healthcare website designed to improve trust and make appointment enquiries easier.",
          "https://dailydose-tawny.vercel.app/", "featured", actor.email, actor.email,
        ),
      db.prepare(`INSERT INTO portfolio_projects
        (id, name, slug, service, result, summary, project_url, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          "project_suneja", "Suneja Sales Corporation", "suneja-sales-corporation",
          "B2B product catalogue", "2.4x faster discovery",
          "A structured catalogue experience for natural stone products and bulk quotation enquiries.",
          "https://kota-five-virid.vercel.app/", "published", actor.email, actor.email,
        ),
    ]);
  }
}

async function rows<T>(statement: string, ...values: unknown[]) {
  const result = await database().prepare(statement).bind(...values).all<T>();
  return result.results ?? [];
}

export async function getControlSnapshot(actor: ControlActor) {
  await ensureControlStore(actor);

  const [clients, websites, subscriptions, payments, content, domains, deployments, backups, leads, activity, settingsRows, blogPosts, portfolioProjects, media, supportTickets, seoAudits] = await Promise.all([
    rows("SELECT * FROM clients ORDER BY created_at DESC"),
    rows("SELECT * FROM websites ORDER BY created_at DESC"),
    rows("SELECT * FROM subscriptions ORDER BY next_due_date ASC"),
    rows("SELECT * FROM payments ORDER BY paid_at DESC LIMIT 100"),
    rows("SELECT * FROM website_content ORDER BY updated_at DESC"),
    rows("SELECT * FROM domains ORDER BY domain ASC"),
    rows("SELECT * FROM deployments ORDER BY deployed_at DESC LIMIT 100"),
    rows("SELECT * FROM backups ORDER BY created_at DESC LIMIT 100"),
    rows("SELECT id, lead_type, service, name, business, email, phone, message, source, status, notes, created_at, updated_at, updated_by FROM leads ORDER BY created_at DESC LIMIT 200"),
    rows("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100"),
    rows<{ key: string; value: string }>("SELECT `key`, value FROM control_settings ORDER BY `key` ASC"),
    rows("SELECT * FROM blog_posts ORDER BY updated_at DESC"),
    rows("SELECT * FROM portfolio_projects ORDER BY updated_at DESC"),
    rows("SELECT id, file_name, mime_type, file_size, alt_text, created_at, created_by FROM media_assets ORDER BY created_at DESC"),
    rows("SELECT * FROM support_tickets ORDER BY updated_at DESC"),
    rows("SELECT * FROM seo_audits ORDER BY created_at DESC LIMIT 10"),
  ]);

  const settings = Object.fromEntries(settingsRows.map((item) => [item.key, item.value]));
  const integrations = {
    database: { state: "connected", detail: "TiDB/MySQL is responding" },
    vercel: { state: process.env.VERCEL ? "connected" : "not_configured", detail: process.env.VERCEL ? "Running on Vercel" : "No Vercel runtime detected" },
    github: { state: process.env.GITHUB_TOKEN ? "configured" : "not_configured", detail: process.env.GITHUB_TOKEN ? "Token configured" : "Add GITHUB_TOKEN to enable repository actions" },
    analytics: { state: process.env.GA_PROPERTY_ID ? "configured" : "not_configured", detail: process.env.GA_PROPERTY_ID ? "Property configured" : "Add GA_PROPERTY_ID to enable analytics" },
    searchConsole: { state: process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS ? "configured" : "not_configured", detail: process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS ? "Credentials configured" : "Search Console is not connected" },
    razorpay: { state: process.env.RAZORPAY_KEY_ID ? "configured" : "not_configured", detail: process.env.RAZORPAY_KEY_ID ? "Key configured" : "Razorpay is not connected" },
    resend: { state: process.env.RESEND_API_KEY ? "configured" : "not_configured", detail: process.env.RESEND_API_KEY ? "Email provider configured" : "Resend is not connected" },
  };
  return { clients, websites, subscriptions, payments, content, domains, deployments, backups, leads, activity, settings, blogPosts, portfolioProjects, media, supportTickets, seoAudits, integrations };
}

async function logActivity(actor: ControlActor, action: string, entityType: string, entityId: string, details: string) {
  await database().prepare(`INSERT INTO activity_logs
    (id, user_email, action, entity_type, entity_id, details, success)
    VALUES (?, ?, ?, ?, ?, ?, 1)`)
    .bind(crypto.randomUUID(), actor.email, action, entityType, entityId, details)
    .run();
}

export async function createClient(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const businessName = clean(input.businessName, 140);
  const contactName = clean(input.contactName, 100);
  const email = clean(input.email, 160).toLowerCase();
  const phone = clean(input.phone, 40);
  const industry = clean(input.industry, 100) || "Not specified";
  const location = clean(input.location, 120);
  const notes = clean(input.notes, 1000);
  if (!businessName) throw new Error("Business name is required.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

  const id = `cli_${crypto.randomUUID()}`;
  const db = database();
  await db.batch([
    db.prepare(`INSERT INTO clients
      (id, business_name, contact_name, email, phone, industry, location, status, notes, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`)
      .bind(id, businessName, contactName, email, phone, industry, location, notes, actor.email, actor.email),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Client added', 'client', ?, ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, id, `${businessName} was added to ANTRIKSH Control.`),
  ]);
  return { id };
}

export async function createWebsite(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const clientId = clean(input.clientId, 100);
  const name = clean(input.name, 140);
  const url = clean(input.url, 500);
  const platform = clean(input.platform, 80) || "Vercel";
  if (!clientId || !name) throw new Error("Client and website name are required.");
  if (url && !/^https?:\/\//i.test(url)) throw new Error("Website URL must start with http:// or https://.");

  const id = `web_${crypto.randomUUID()}`;
  const db = database();
  await db.batch([
    db.prepare(`INSERT INTO websites
      (id, client_id, name, url, platform, environment, status, template, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, 'production', 'draft', 'Custom', ?, ?)`)
      .bind(id, clientId, name, url, platform, actor.email, actor.email),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Website added', 'website', ?, ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, id, `${name} was added in draft status.`),
  ]);
  return { id };
}

export async function renewSubscription(actor: ControlActor, subscriptionId: string) {
  await ensureControlStore(actor);
  const db = database();
  const current = await db.prepare("SELECT id, next_due_date, cycle_days FROM subscriptions WHERE id = ?")
    .bind(subscriptionId)
    .first<{ id: string; next_due_date: string; cycle_days: number }>();
  if (!current) throw new Error("Subscription not found.");

  const today = new Date();
  const existingDue = new Date(`${current.next_due_date}T00:00:00.000Z`);
  const base = existingDue > today ? existingDue : today;
  const nextDue = isoDate(addDays(base, current.cycle_days || 28));
  const graceEnd = isoDate(addDays(new Date(`${nextDue}T00:00:00.000Z`), 7));
  await db.batch([
    db.prepare(`UPDATE subscriptions SET next_due_date = ?, grace_end_date = ?, status = 'active',
      licence_status = 'active', updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?`)
      .bind(nextDue, graceEnd, actor.email, subscriptionId),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Subscription renewed', 'subscription', ?, ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, subscriptionId, `Renewed for 28 days. Next due date: ${nextDue}.`),
  ]);
  return { nextDueDate: nextDue, graceEndDate: graceEnd };
}

export async function setSubscriptionActive(actor: ControlActor, subscriptionId: string, active: boolean) {
  await ensureControlStore(actor);
  const current = await database().prepare("SELECT id, plan_name FROM subscriptions WHERE id = ?")
    .bind(subscriptionId).first<{ id: string; plan_name: string }>();
  if (!current) throw new Error("Subscription not found.");
  const status = active ? "active" : "inactive";
  const licenceStatus = active ? "active" : "inactive";
  await database().prepare(`UPDATE subscriptions SET status = ?, licence_status = ?, updated_at = CURRENT_TIMESTAMP,
    updated_by = ? WHERE id = ?`).bind(status, licenceStatus, actor.email, subscriptionId).run();
  await logActivity(actor, active ? "Subscription activated" : "Subscription inactivated", "subscription", subscriptionId,
    `${current.plan_name} was ${active ? "activated" : "inactivated"}.`);
  return { id: subscriptionId, active };
}

export async function rotateSubscriptionKey(actor: ControlActor, subscriptionId: string) {
  await ensureControlStore(actor);
  const current = await database().prepare("SELECT id FROM subscriptions WHERE id = ?")
    .bind(subscriptionId).first<{ id: string }>();
  if (!current) throw new Error("Subscription not found.");
  const token = `antriksh_${randomBytes(24).toString("base64url")}`;
  const hash = createHash("sha256").update(token).digest("hex");
  const hint = token.slice(-8);
  await database().prepare(`UPDATE subscriptions SET licence_key_hash = ?, licence_key_hint = ?,
    updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?`)
    .bind(hash, hint, actor.email, subscriptionId).run();
  await logActivity(actor, "Licence key rotated", "subscription", subscriptionId, `A new licence key ending in ${hint} was generated.`);
  return { id: subscriptionId, token, hint };
}

export async function saveContent(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = clean(input.id, 120) || `content_${crypto.randomUUID()}`;
  const websiteId = clean(input.websiteId, 120);
  const pageName = clean(input.pageName, 120) || "Home";
  const slug = clean(input.slug, 200) || "/";
  const title = clean(input.title, 200);
  const summary = clean(input.summary, 3000);
  const seoTitle = clean(input.seoTitle, 200);
  const metaDescription = clean(input.metaDescription, 320);
  const status = clean(input.status, 30) === "published" ? "published" : "draft";
  if (!websiteId || !title) throw new Error("Website and page title are required.");

  const db = database();
  await db.batch([
    db.prepare(`INSERT INTO website_content
      (id, website_id, page_name, slug, title, summary, seo_title, meta_description, status, version, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE website_id = VALUES(website_id), page_name = VALUES(page_name),
      slug = VALUES(slug), title = VALUES(title), summary = VALUES(summary),
      seo_title = VALUES(seo_title), meta_description = VALUES(meta_description),
      status = VALUES(status), version = version + 1,
      updated_at = CURRENT_TIMESTAMP, updated_by = VALUES(updated_by)`)
      .bind(id, websiteId, pageName, slug, title, summary, seoTitle, metaDescription, status, actor.email),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Content updated', 'content', ?, ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, id, `${pageName} content saved as ${status}.`),
  ]);
  return { id };
}

export async function recordPayment(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const clientId = clean(input.clientId, 120);
  const subscriptionId = clean(input.subscriptionId, 120);
  const amount = Number(input.amount);
  const method = clean(input.method, 50) || "manual";
  const reference = clean(input.reference, 120);
  if (!clientId || !Number.isFinite(amount) || amount <= 0) throw new Error("Client and a valid amount are required.");

  const id = `pay_${crypto.randomUUID()}`;
  const db = database();
  await db.batch([
    db.prepare(`INSERT INTO payments
      (id, client_id, subscription_id, amount, currency, method, reference, status, created_by)
      VALUES (?, ?, ?, ?, 'INR', ?, ?, 'paid', ?)`)
      .bind(id, clientId, subscriptionId, Math.round(amount * 100), method, reference, actor.email),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Payment recorded', 'payment', ?, ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, id, `Recorded INR ${amount.toFixed(2)} by ${method}.`),
  ]);
  return { id };
}

const allowedSettings = new Set([
  "agency_name",
  "agency_email",
  "agency_phone",
  "timezone",
  "currency",
  "billing_cycle",
  "grace_period",
]);

export async function saveSettings(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const entries = Object.entries(input)
    .filter(([key]) => allowedSettings.has(key))
    .map(([key, value]) => [key, clean(value, 240)] as const);
  if (!entries.length) throw new Error("No supported settings were provided.");

  const db = database();
  await db.batch([
    ...entries.map(([key, value]) =>
      db.prepare(`INSERT INTO control_settings (\`key\`, value, updated_by)
        VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value),
        updated_at = CURRENT_TIMESTAMP, updated_by = VALUES(updated_by)`)
        .bind(key, value, actor.email),
    ),
    db.prepare(`INSERT INTO activity_logs
      (id, user_email, action, entity_type, entity_id, details, success)
      VALUES (?, ?, 'Settings updated', 'settings', 'global', ?, 1)`)
      .bind(crypto.randomUUID(), actor.email, `${entries.length} ANTRIKSH Control settings updated.`),
  ]);
}

export async function addAuditEntry(actor: ControlActor, action: string, entityType: string, entityId: string, details: string) {
  await ensureControlStore(actor);
  await logActivity(actor, clean(action, 120), clean(entityType, 80), clean(entityId, 120), clean(details, 500));
}

export async function createLeadRecord(input: {
  leadType: string;
  service: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  message: string;
  source?: string;
}) {
  await ensureDatabaseSchema();
  const db = database();
  await db.prepare(`INSERT INTO leads
    (lead_type, service, name, business, email, phone, message, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      clean(input.leadType, 40) || "project",
      clean(input.service, 80) || "Not specified",
      clean(input.name, 80),
      clean(input.business, 120),
      clean(input.email, 160).toLowerCase(),
      clean(input.phone, 30),
      clean(input.message, 2000),
      clean(input.source, 60) || "website",
    )
    .run();
}

function existingId(input: Record<string, unknown>, prefix: string) {
  return clean(input.id, 128) || `${prefix}_${crypto.randomUUID()}`;
}

function cleanDateTime(value: unknown) {
  const text = clean(value, 30);
  if (!text) return null;
  return text.replace("T", " ").slice(0, 19);
}

function slug(value: unknown, fallback: string) {
  const normalized = clean(value, 220).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

export async function updateClient(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = clean(input.id, 128);
  const businessName = clean(input.businessName, 140);
  const contactName = clean(input.contactName, 100);
  const email = clean(input.email, 160).toLowerCase();
  const phone = clean(input.phone, 40);
  const industry = clean(input.industry, 100) || "Not specified";
  const location = clean(input.location, 120);
  const status = clean(input.status, 30) || "active";
  const notes = clean(input.notes, 3000);
  if (!id || !businessName) throw new Error("Client and business name are required.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  await database().prepare(`UPDATE clients SET business_name = ?, contact_name = ?, email = ?, phone = ?, industry = ?,
    location = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?`)
    .bind(businessName, contactName, email, phone, industry, location, status, notes, actor.email, id).run();
  await logActivity(actor, "Client updated", "client", id, `${businessName} was updated.`);
  return { id };
}

export async function deleteClient(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  const linked = await database().prepare("SELECT COUNT(*) AS total FROM websites WHERE client_id = ?").bind(id).first<{ total: number }>();
  if (Number(linked?.total ?? 0) > 0) throw new Error("Remove or reassign this client's websites before deleting the client.");
  await database().prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
  await logActivity(actor, "Client deleted", "client", id, "Client record removed after confirmation.");
}

export async function updateWebsite(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = clean(input.id, 128);
  const clientId = clean(input.clientId, 128);
  const name = clean(input.name, 140);
  const url = clean(input.url, 500);
  const platform = clean(input.platform, 80) || "Vercel";
  const environment = clean(input.environment, 40) || "production";
  const status = clean(input.status, 30) || "draft";
  const template = clean(input.template, 120) || "Custom";
  if (!id || !clientId || !name) throw new Error("Client and website name are required.");
  if (url && !/^https?:\/\//i.test(url)) throw new Error("Website URL must start with http:// or https://.");
  await database().prepare(`UPDATE websites SET client_id = ?, name = ?, url = ?, platform = ?, environment = ?, status = ?,
    template = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?`)
    .bind(clientId, name, url, platform, environment, status, template, actor.email, id).run();
  await logActivity(actor, "Website updated", "website", id, `${name} settings were updated.`);
  return { id };
}

export async function deleteWebsite(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  const checks = await Promise.all([
    database().prepare("SELECT COUNT(*) AS total FROM subscriptions WHERE website_id = ?").bind(id).first<{ total: number }>(),
    database().prepare("SELECT COUNT(*) AS total FROM website_content WHERE website_id = ?").bind(id).first<{ total: number }>(),
  ]);
  if (checks.some((item) => Number(item?.total ?? 0) > 0)) throw new Error("Remove this website's plans and content before deleting it.");
  await database().prepare("DELETE FROM websites WHERE id = ?").bind(id).run();
  await logActivity(actor, "Website deleted", "website", id, "Website record removed after confirmation.");
}

export async function saveSubscription(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "sub");
  const clientId = clean(input.clientId, 128);
  const websiteId = clean(input.websiteId, 128);
  const planName = clean(input.planName, 100) || "Website Care";
  const cycleDays = Math.max(1, Math.min(365, Number(input.cycleDays) || 28));
  const startDate = clean(input.startDate, 10) || isoDate(new Date());
  const nextDueDate = clean(input.nextDueDate, 10) || isoDate(addDays(new Date(), cycleDays));
  const graceEndDate = clean(input.graceEndDate, 10) || isoDate(addDays(new Date(`${nextDueDate}T00:00:00Z`), 7));
  const fee = Math.max(0, Math.round((Number(input.fee) || 0) * 100));
  const status = clean(input.status, 30) || "active";
  const licenceStatus = clean(input.licenceStatus, 30) || "active";
  const autoRenew = String(input.autoRenew) === "on" || String(input.autoRenew) === "1" ? 1 : 0;
  if (!clientId || !websiteId) throw new Error("Client and website are required for a subscription.");
  await database().prepare(`INSERT INTO subscriptions
    (id, client_id, website_id, plan_name, cycle_days, start_date, next_due_date, grace_end_date, fee, status, licence_status, auto_renew, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE client_id = VALUES(client_id), website_id = VALUES(website_id), plan_name = VALUES(plan_name),
    cycle_days = VALUES(cycle_days), start_date = VALUES(start_date), next_due_date = VALUES(next_due_date),
    grace_end_date = VALUES(grace_end_date), fee = VALUES(fee), status = VALUES(status),
    licence_status = VALUES(licence_status), auto_renew = VALUES(auto_renew), updated_at = CURRENT_TIMESTAMP,
    updated_by = VALUES(updated_by)`)
    .bind(id, clientId, websiteId, planName, cycleDays, startDate, nextDueDate, graceEndDate, fee, status, licenceStatus, autoRenew, actor.email).run();
  await logActivity(actor, "Subscription saved", "subscription", id, `${planName} was saved.`);
  return { id };
}

export async function deleteSubscription(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM subscriptions WHERE id = ?").bind(id).run();
  await logActivity(actor, "Subscription deleted", "subscription", id, "Subscription record removed after confirmation.");
}

export async function updatePayment(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = clean(input.id, 128);
  const clientId = clean(input.clientId, 128);
  const subscriptionId = clean(input.subscriptionId, 128);
  const amount = Number(input.amount);
  const method = clean(input.method, 50) || "manual";
  const reference = clean(input.reference, 120);
  const status = clean(input.status, 30) || "paid";
  if (!id || !clientId || !Number.isFinite(amount) || amount <= 0) throw new Error("Client and a valid amount are required.");
  await database().prepare(`UPDATE payments SET client_id = ?, subscription_id = ?, amount = ?, method = ?, reference = ?, status = ? WHERE id = ?`)
    .bind(clientId, subscriptionId, Math.round(amount * 100), method, reference, status, id).run();
  await logActivity(actor, "Payment updated", "payment", id, `Payment ${reference || id} was updated.`);
  return { id };
}

export async function deletePayment(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM payments WHERE id = ?").bind(id).run();
  await logActivity(actor, "Payment deleted", "payment", id, "Payment record removed after confirmation.");
}

export async function updateLead(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = clean(input.id, 128);
  const status = clean(input.status, 30) || "new";
  const notes = clean(input.notes, 3000);
  if (!id) throw new Error("Lead is required.");
  await database().prepare("UPDATE leads SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?")
    .bind(status, notes, actor.email, id).run();
  await logActivity(actor, "Lead updated", "lead", id, `Lead moved to ${status}.`);
  return { id };
}

export async function deleteLead(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
  await logActivity(actor, "Lead deleted", "lead", id, "Lead removed after confirmation.");
}

export async function deleteContent(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM website_content WHERE id = ?").bind(id).run();
  await logActivity(actor, "Content deleted", "content", id, "Website content record removed after confirmation.");
}

export async function saveBlogPost(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "post");
  const title = clean(input.title, 220);
  const postSlug = slug(input.slug || title, id);
  const category = clean(input.category, 80) || "Insights";
  const excerpt = clean(input.excerpt, 600);
  const content = clean(input.content, 50000);
  const status = ["draft", "scheduled", "published"].includes(clean(input.status, 30)) ? clean(input.status, 30) : "draft";
  const publishAt = cleanDateTime(input.publishAt);
  if (!title || !content) throw new Error("Post title and content are required.");
  await database().prepare(`INSERT INTO blog_posts
    (id, title, slug, category, excerpt, content, status, publish_at, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), category = VALUES(category), excerpt = VALUES(excerpt),
    content = VALUES(content), status = VALUES(status), publish_at = VALUES(publish_at), updated_at = CURRENT_TIMESTAMP,
    updated_by = VALUES(updated_by)`)
    .bind(id, title, postSlug, category, excerpt, content, status, publishAt, actor.email, actor.email).run();
  await logActivity(actor, "Blog post saved", "blog_post", id, `${title} saved as ${status}.`);
  return { id, slug: postSlug };
}

export async function deleteBlogPost(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM blog_posts WHERE id = ?").bind(id).run();
  await logActivity(actor, "Blog post deleted", "blog_post", id, "Blog post removed after confirmation.");
}

export async function savePortfolioProject(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "project");
  const name = clean(input.name, 180);
  const projectSlug = slug(input.slug || name, id);
  const service = clean(input.service, 160);
  const result = clean(input.result, 220);
  const summary = clean(input.summary, 5000);
  const projectUrl = clean(input.projectUrl, 500);
  const status = clean(input.status, 30) || "draft";
  if (!name || !summary) throw new Error("Project name and summary are required.");
  if (projectUrl && !/^https?:\/\//i.test(projectUrl)) throw new Error("Project URL must start with http:// or https://.");
  await database().prepare(`INSERT INTO portfolio_projects
    (id, name, slug, service, result, summary, project_url, status, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), service = VALUES(service), result = VALUES(result),
    summary = VALUES(summary), project_url = VALUES(project_url), status = VALUES(status), updated_at = CURRENT_TIMESTAMP,
    updated_by = VALUES(updated_by)`)
    .bind(id, name, projectSlug, service, result, summary, projectUrl, status, actor.email, actor.email).run();
  await logActivity(actor, "Portfolio project saved", "portfolio_project", id, `${name} saved as ${status}.`);
  return { id, slug: projectSlug };
}

export async function deletePortfolioProject(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM portfolio_projects WHERE id = ?").bind(id).run();
  await logActivity(actor, "Portfolio project deleted", "portfolio_project", id, "Portfolio project removed after confirmation.");
}

export async function saveDomain(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "domain");
  const clientId = clean(input.clientId, 128);
  const websiteId = clean(input.websiteId, 128);
  const domainName = clean(input.domain, 255).replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const registrar = clean(input.registrar, 100) || "Not connected";
  const dnsProvider = clean(input.dnsProvider, 100) || "Not connected";
  const sslStatus = clean(input.sslStatus, 30) || "unknown";
  const verificationStatus = clean(input.verificationStatus, 30) || "unverified";
  const expiryDate = clean(input.expiryDate, 10);
  if (!clientId || !websiteId || !domainName) throw new Error("Client, website and domain are required.");
  await database().prepare(`INSERT INTO domains
    (id, client_id, website_id, domain, registrar, dns_provider, ssl_status, verification_status, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE client_id = VALUES(client_id), website_id = VALUES(website_id), domain = VALUES(domain),
    registrar = VALUES(registrar), dns_provider = VALUES(dns_provider), ssl_status = VALUES(ssl_status),
    verification_status = VALUES(verification_status), expiry_date = VALUES(expiry_date), updated_at = CURRENT_TIMESTAMP`)
    .bind(id, clientId, websiteId, domainName, registrar, dnsProvider, sslStatus, verificationStatus, expiryDate).run();
  await logActivity(actor, "Domain saved", "domain", id, `${domainName} record was saved.`);
  return { id };
}

export async function deleteDomain(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM domains WHERE id = ?").bind(id).run();
  await logActivity(actor, "Domain deleted", "domain", id, "Domain record removed after confirmation.");
}

export async function saveDeployment(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "deployment");
  const websiteId = clean(input.websiteId, 128);
  const environment = clean(input.environment, 40) || "production";
  const platform = clean(input.platform, 80) || "Vercel";
  const status = clean(input.status, 30) || "ready";
  const productionUrl = clean(input.productionUrl, 500);
  const commitRef = clean(input.commitRef, 160);
  if (!websiteId) throw new Error("Website is required.");
  if (productionUrl && !/^https?:\/\//i.test(productionUrl)) throw new Error("Deployment URL must start with http:// or https://.");
  await database().prepare(`INSERT INTO deployments
    (id, website_id, environment, platform, status, production_url, commit_ref, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE website_id = VALUES(website_id), environment = VALUES(environment), platform = VALUES(platform),
    status = VALUES(status), production_url = VALUES(production_url), commit_ref = VALUES(commit_ref)`)
    .bind(id, websiteId, environment, platform, status, productionUrl, commitRef, actor.email).run();
  await logActivity(actor, "Deployment saved", "deployment", id, `${platform} deployment record saved.`);
  return { id };
}

export async function deleteDeployment(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM deployments WHERE id = ?").bind(id).run();
  await logActivity(actor, "Deployment deleted", "deployment", id, "Deployment history record removed after confirmation.");
}

export async function saveSupportTicket(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = existingId(input, "ticket");
  const clientId = clean(input.clientId, 128);
  const title = clean(input.title, 220);
  const description = clean(input.description, 6000);
  const priority = clean(input.priority, 30) || "normal";
  const status = clean(input.status, 40) || "open";
  const assignee = clean(input.assignee, 120);
  if (!title || !description) throw new Error("Ticket title and description are required.");
  await database().prepare(`INSERT INTO support_tickets
    (id, client_id, title, description, priority, status, assignee, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE client_id = VALUES(client_id), title = VALUES(title), description = VALUES(description),
    priority = VALUES(priority), status = VALUES(status), assignee = VALUES(assignee), updated_at = CURRENT_TIMESTAMP,
    updated_by = VALUES(updated_by)`)
    .bind(id, clientId, title, description, priority, status, assignee, actor.email, actor.email).run();
  await logActivity(actor, "Support ticket saved", "support_ticket", id, `${title} saved as ${status}.`);
  return { id };
}

export async function deleteSupportTicket(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM support_tickets WHERE id = ?").bind(id).run();
  await logActivity(actor, "Support ticket deleted", "support_ticket", id, "Support ticket removed after confirmation.");
}

export async function runSeoAudit(actor: ControlActor) {
  await ensureControlStore(actor);
  const [contentRows, mediaRows] = await Promise.all([
    rows<Record<string, unknown>>("SELECT title, seo_title, meta_description FROM website_content"),
    rows<Record<string, unknown>>("SELECT alt_text FROM media_assets"),
  ]);
  const percentage = (items: Record<string, unknown>[], key: string) => items.length
    ? Math.round(items.filter((item) => clean(item[key], 1000).length > 0).length / items.length * 100)
    : 100;
  const details = {
    pageTitles: percentage(contentRows, "seo_title"),
    metaDescriptions: percentage(contentRows, "meta_description"),
    imageAltText: percentage(mediaRows, "alt_text"),
    pagesChecked: contentRows.length,
    mediaChecked: mediaRows.length,
  };
  const score = Math.round((details.pageTitles + details.metaDescriptions + details.imageAltText) / 3);
  const id = `seo_${crypto.randomUUID()}`;
  await database().prepare("INSERT INTO seo_audits (id, score, details_json, created_by) VALUES (?, ?, ?, ?)")
    .bind(id, score, JSON.stringify(details), actor.email).run();
  await logActivity(actor, "SEO audit completed", "seo_audit", id, `Database content audit completed with a score of ${score}.`);
  return { id, score, details };
}

export async function createBackup(actor: ControlActor, input: Record<string, unknown>) {
  await ensureControlStore(actor);
  const id = `backup_${crypto.randomUUID()}`;
  const websiteId = clean(input.websiteId, 128);
  const type = clean(input.type, 40) || "workspace";
  const [clients, websites, subscriptions, payments, content, domains, deployments, leads, blogPosts, portfolioProjects, supportTickets, settings] = await Promise.all([
    rows("SELECT * FROM clients"), rows("SELECT * FROM websites"), rows("SELECT * FROM subscriptions"),
    rows("SELECT * FROM payments"), rows("SELECT * FROM website_content"), rows("SELECT * FROM domains"),
    rows("SELECT * FROM deployments"), rows("SELECT * FROM leads"), rows("SELECT * FROM blog_posts"),
    rows("SELECT * FROM portfolio_projects"), rows("SELECT * FROM support_tickets"), rows("SELECT * FROM control_settings"),
  ]);
  const payload = JSON.stringify({ version: 1, createdAt: new Date().toISOString(), websiteId, data: { clients, websites, subscriptions, payments, content, domains, deployments, leads, blogPosts, portfolioProjects, supportTickets, settings } });
  const bytes = Buffer.byteLength(payload);
  const sizeLabel = bytes > 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const db = database();
  await db.batch([
    db.prepare("INSERT INTO backups (id, website_id, type, status, size_label, created_by) VALUES (?, ?, ?, 'ready', ?, ?)")
      .bind(id, websiteId, type, sizeLabel, actor.email),
    db.prepare("INSERT INTO backup_payloads (backup_id, payload) VALUES (?, ?)").bind(id, payload),
  ]);
  await logActivity(actor, "Backup created", "backup", id, `${type} backup created (${sizeLabel}).`);
  return { id };
}

export async function getBackupPayload(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  return database().prepare("SELECT payload FROM backup_payloads WHERE backup_id = ?").bind(id).first<{ payload: string }>();
}

export async function deleteBackup(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  const db = database();
  await db.batch([
    db.prepare("DELETE FROM backup_payloads WHERE backup_id = ?").bind(id),
    db.prepare("DELETE FROM backups WHERE id = ?").bind(id),
  ]);
  await logActivity(actor, "Backup deleted", "backup", id, "Backup payload removed after confirmation.");
}

export async function createMediaAsset(actor: ControlActor, file: { name: string; type: string; bytes: Buffer; altText: string }) {
  await ensureControlStore(actor);
  if (!file.name || !file.type || !file.bytes.length) throw new Error("Choose a file to upload.");
  if (file.bytes.length > 4 * 1024 * 1024) throw new Error("Files must be 4 MB or smaller.");
  if (!/^(image\/|video\/|application\/pdf)/i.test(file.type)) throw new Error("Upload an image, video, or PDF file.");
  const id = `media_${crypto.randomUUID()}`;
  await database().prepare(`INSERT INTO media_assets
    (id, file_name, mime_type, file_size, alt_text, binary_data, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, clean(file.name, 255), clean(file.type, 120), file.bytes.length, clean(file.altText, 300), file.bytes, actor.email).run();
  await logActivity(actor, "Media uploaded", "media", id, `${clean(file.name, 255)} uploaded (${file.bytes.length} bytes).`);
  return { id };
}

export async function getMediaAsset(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  return database().prepare("SELECT file_name, mime_type, file_size, binary_data FROM media_assets WHERE id = ?")
    .bind(id).first<{ file_name: string; mime_type: string; file_size: number; binary_data: Buffer }>();
}

export async function deleteMediaAsset(actor: ControlActor, id: string) {
  await ensureControlStore(actor);
  await database().prepare("DELETE FROM media_assets WHERE id = ?").bind(id).run();
  await logActivity(actor, "Media deleted", "media", id, "Uploaded media removed after confirmation.");
}
