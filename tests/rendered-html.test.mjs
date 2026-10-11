import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);

test("ships the standalone protected ANTRIKSH admin gateway and control surface", async () => {
  const [loginPage, loginCard, controlPage, controlPanel, apiRoute, adminAuth, loginRoute] = await Promise.all([
    readFile(fromRoot("app/admin-login/page.tsx"), "utf8"),
    readFile(fromRoot("app/admin-login/LoginCard.tsx"), "utf8"),
    readFile(fromRoot("app/control/page.tsx"), "utf8"),
    readFile(fromRoot("app/control/ControlPanel.tsx"), "utf8"),
    readFile(fromRoot("app/api/control/route.ts"), "utf8"),
    readFile(fromRoot("app/admin-auth.ts"), "utf8"),
    readFile(fromRoot("app/api/auth/login/route.ts"), "utf8"),
  ]);

  assert.match(loginPage, /getAdminUser/);
  assert.match(loginPage, /robots:\s*\{\s*index:\s*false/);
  assert.match(loginCard, /Sign in securely/);
  assert.match(loginCard, /type=\{showPassword \? "text" : "password"\}/);
  assert.match(loginCard, /brand\.mark/);
  assert.match(controlPage, /redirect\("\/admin-login\?return_to=%2Fcontrol"\)/);
  assert.match(adminAuth, /createHmac\("sha256"/);
  assert.match(adminAuth, /antriksh_admin_session/);
  assert.match(loginRoute, /httpOnly:\s*true/);
  assert.match(loginRoute, /sameSite:\s*"strict"/);
  assert.match(controlPanel, /Good evening, Antariksh/);
  assert.match(controlPanel, /\/api\/auth\/logout/);
  assert.match(controlPanel, /CommandPalette/);
  assert.match(controlPanel, /28-day cycle/);
  assert.match(controlPanel, /createClient/);
  assert.match(controlPanel, /recordPayment/);
  assert.match(apiRoute, /case "renewSubscription"/);
  assert.match(apiRoute, /case "saveContent"/);
});

test("keeps the ARTH by ANTRIKSH identity intact across responsive layouts", async () => {
  const [mark, antriksh, animatedBrand, staticBrand, studio, servicePage, globalCss, digitalCss, controlCss, loginCss] = await Promise.all([
    readFile(fromRoot("public/antriksh-mark.png")),
    readFile(fromRoot("public/antriksh-word.png")),
    readFile(fromRoot("app/AnimatedBrand.tsx"), "utf8"),
    readFile(fromRoot("app/StaticBrand.tsx"), "utf8"),
    readFile(fromRoot("app/AntrikshStudio.tsx"), "utf8"),
    readFile(fromRoot("app/[service]/page.tsx"), "utf8"),
    readFile(fromRoot("app/globals.css"), "utf8"),
    readFile(fromRoot("app/digital.css"), "utf8"),
    readFile(fromRoot("app/control/control.css"), "utf8"),
    readFile(fromRoot("app/admin-login/login.css"), "utf8"),
  ]);

  for (const artwork of [mark, antriksh]) {
    assert.equal(artwork.subarray(1, 4).toString("ascii"), "PNG");
  }
  assert.match(animatedBrand, /brand\.mark/);
  assert.match(animatedBrand, /antriksh-logo-particle-canvas/);
  assert.match(animatedBrand, /brand\.wordmark/);
  assert.match(animatedBrand, /BY ANTRIKSH/);
  assert.match(animatedBrand, /BY ANTRIKSH/);
  assert.doesNotMatch(animatedBrand, /drawLogo\(/);
  assert.match(staticBrand, /brand\.mark/);
  assert.match(staticBrand, />RTH</);
  assert.match(staticBrand, /BY ANTRIKSH/);
  assert.match(studio, /<StaticBrand \/>/);
  assert.match(servicePage, /<StaticBrand \/>/);
  assert.doesNotMatch(studio, /<AnimatedBrand \/>/);
  assert.doesNotMatch(servicePage, /<AnimatedBrand \/>/);
  assert.match(digitalCss, /\.antriksh-static-brand\s*\{/);
  assert.match(digitalCss, /\.antriksh-static-word\s*\{/);
  assert.match(digitalCss, /antriksh-runner-hyperspace/);
  assert.match(globalCss, /\.antriksh-logo-symbol img\{[^}]*object-fit:contain/s);
  assert.match(globalCss, /\.antriksh-logo-symbol img\{[^}]*object-fit:contain/s);
  assert.doesNotMatch(globalCss, /\.antriksh-logo-symbol img\{[^}]*transform:scale/s);
  assert.match(controlCss, /\.control-brand img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(controlCss, /@media \(max-width:\s*780px\)/);
  assert.match(controlCss, /@media \(max-width:\s*520px\)/);
  assert.match(loginCss, /\.login-lockup img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(loginCss, /@media\(max-width:520px\)/);
});

test("connects the agency modules to online MySQL", async () => {
  const [schema, controlStore, mysqlConnection] = await Promise.all([
    readFile(fromRoot("db/mysql-schema.ts"), "utf8"),
    readFile(fromRoot("db/control.ts"), "utf8"),
    readFile(fromRoot("db/mysql.ts"), "utf8"),
  ]);

  for (const table of ["clients", "websites", "subscriptions", "payments", "website_content", "domains", "deployments", "backups", "activity_logs"]) {
    assert.match(schema, new RegExp(table.replace("_", "[A-Z_]?"), "i"));
  }
  assert.match(schema, /CREATE TABLE IF NOT EXISTS leads/);
  assert.match(schema, /ENGINE=InnoDB/);
  assert.match(schema, /cycle_days INT NOT NULL DEFAULT 28/);
  assert.match(mysqlConnection, /from "mysql2\/promise"/);
  assert.match(mysqlConnection, /process\.env\.DATABASE_URL/);
  assert.match(mysqlConnection, /connectionLimit/);
  assert.match(mysqlConnection, /beginTransaction/);
  assert.match(controlStore, /ON DUPLICATE KEY UPDATE/);
  assert.doesNotMatch(controlStore, /node:sqlite|legacy\.db|ON CONFLICT/);
});

test("preselects the clicked service in the contact form", async () => {
  const [page, home, servicePage] = await Promise.all([
    readFile(fromRoot("app/page.tsx"), "utf8"),
    readFile(fromRoot("app/AntrikshStudio.tsx"), "utf8"),
    readFile(fromRoot("app/[service]/page.tsx"), "utf8"),
  ]);

  assert.match(page, /resolvedSearchParams\.service/);
  assert.match(page, /initialService/);
  assert.match(home, /name="service" value=\{selectedService\}/);
  assert.match(home, /\?service=\$\{service\.slug\}#contact/);
  assert.match(servicePage, /\?service=\$\{service\.slug\}#contact/);
});

test("presents selected client brands in an accessible moving showcase", async () => {
  const [studio, digitalCss] = await Promise.all([
    readFile(fromRoot("app/AntrikshStudio.tsx"), "utf8"),
    readFile(fromRoot("app/digital.css"), "utf8"),
  ]);

  for (const client of ["Suneja Sales Corporation", "Daily Dose Physiotherapy", "Zevly Clothing"]) {
    assert.match(studio, new RegExp(client));
  }
  assert.match(studio, /function ClientMarquee/);
  assert.match(studio, /decorative=\{index >= clientBrands\.length\}/);
  assert.match(studio, /<span className=\{`antriksh-client-mark/);
  assert.match(digitalCss, /@keyframes antriksh-client-marquee/);
  assert.match(digitalCss, /prefers-reduced-motion: reduce/);
});

test("uses persistent admin workflows instead of showcase notifications", async () => {
  const [panel, api, store, schema, mediaRoute, publicContent] = await Promise.all([
    readFile(fromRoot("app/control/ControlPanel.tsx"), "utf8"),
    readFile(fromRoot("app/api/control/route.ts"), "utf8"),
    readFile(fromRoot("db/control.ts"), "utf8"),
    readFile(fromRoot("db/mysql-schema.ts"), "utf8"),
    readFile(fromRoot("app/api/control/media/route.ts"), "utf8"),
    readFile(fromRoot("db/public-content.ts"), "utf8"),
  ]);

  for (const fakeMessage of ["Actions menu opened", "editor opened", "draft created", "Upload tray opened", "sync queued", "Saved view updated"]) {
    assert.doesNotMatch(panel, new RegExp(fakeMessage, "i"));
  }
  for (const action of ["updateClient", "saveSubscription", "saveBlogPost", "savePortfolioProject", "saveSupportTicket", "createBackup", "runSeoAudit"]) {
    assert.match(api, new RegExp(`case "${action}"`));
    assert.match(store, new RegExp(`function ${action}`));
  }
  for (const table of ["blog_posts", "portfolio_projects", "media_assets", "support_tickets", "seo_audits", "backup_payloads"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(mediaRoute, /request\.formData\(\)/);
  assert.match(publicContent, /WHERE status = 'published'/);
  assert.match(panel, /Delete this record permanently/);
  assert.match(panel, /Download JSON/);
});

test("keeps one primary publish action and provides subscription licensing", async () => {
  const [panel, controlCss, globalCss, api, store, schema, licence, example] = await Promise.all([
    readFile(fromRoot("app/control/ControlPanel.tsx"), "utf8"),
    readFile(fromRoot("app/control/control.css"), "utf8"),
    readFile(fromRoot("app/globals.css"), "utf8"),
    readFile(fromRoot("app/api/control/route.ts"), "utf8"),
    readFile(fromRoot("db/control.ts"), "utf8"),
    readFile(fromRoot("db/mysql-schema.ts"), "utf8"),
    readFile(fromRoot("db/licence.ts"), "utf8"),
    readFile(fromRoot("examples/antriksh-control-nextjs.ts"), "utf8"),
  ]);

  assert.equal((panel.match(/label: "New post"/g) || []).length, 1);
  assert.equal((panel.match(/label: "New project"/g) || []).length, 1);
  assert.equal((panel.match(/label: "Upload files"/g) || []).length, 1);
  assert.match(globalCss, /\.antriksh-menu\{[^}]*z-index:101[^}]*background:#080b0a/s);
  assert.match(globalCss, /\.antriksh-menu\.is-open\{[^}]*visibility:visible[^}]*opacity:1/s);
  assert.match(panel, /"Inactivate"/);
  assert.match(controlCss, /\.licence-key-panel/);
  assert.match(api, /case "setSubscriptionActive"/);
  assert.match(api, /case "rotateSubscriptionKey"/);
  assert.match(store, /function setSubscriptionActive/);
  assert.match(store, /function rotateSubscriptionKey/);
  assert.match(schema, /licence_key_hash CHAR\(64\)/);
  assert.match(licence, /createHash\("sha256"\)/);
  assert.match(licence, /state === "active" \|\| state === "grace"/);
  assert.match(example, /process\.env\.ANTRIKSH_LICENCE_KEY/);
  assert.doesNotMatch(example, /NEXT_PUBLIC_/);
});
