# ANTRIKSH — Next.js

Complete, self-hostable ANTRIKSH digital-agency website and administrator control centre built with the Next.js App Router.

## Included

- Responsive ANTRIKSH marketing website with the Hindi “अ” brand mark
- Animated ANTRIKSH identity pairing the Hindi “अ” mark with a particle-assembled wordmark
- Perspective 3D starfield moving toward the screen, optimized for mobile, reduced motion, and offscreen pausing
- Service cards that open the contact form with the chosen service already selected
- Contact enquiries saved to an online MySQL database
- Protected administrator login and control centre
- Working create, edit, delete, export, upload, backup, lead, blog, portfolio, SEO and support workflows
- Subscription Activate/Inactivate controls with secure per-website licence keys
- MySQL storage for clients, websites, subscriptions, payments, content, media, domains, deployments, backups and activity
- Published admin blog posts and portfolio projects displayed on the public website
- Deployment support for Vercel and standard Node.js hosting

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- An online MySQL 8+ database or compatible managed MySQL service

## 1. Create the online database

Create a MySQL database with a provider of your choice. Copy its private connection URL in this format:

```text
mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME
```

The application creates and updates its required tables automatically the first time a contact form or administrator request reaches the database. The database user therefore needs `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` and `INDEX` permissions for the selected database. A read-only or DML-only connection URL will make the control centre fail while creating its missing tables.

## 2. Run locally

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and add your real administrator credentials and MySQL connection URL:

```env
ADMIN_NAME="ANTRIKSH Admin"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="replace-with-a-long-unique-password"
ADMIN_SESSION_SECRET="replace-with-at-least-32-random-characters"

DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME"
MYSQL_CONNECTION_LIMIT="3"
MYSQL_SSL="true"
MYSQL_SSL_REJECT_UNAUTHORIZED="true"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

Most online MySQL providers require SSL. For a local MySQL server, set `MYSQL_SSL="false"`.

Test the database connection:

```bash
npm run db:check
```

Start the website:

```bash
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin-login`

## 3. Deploy on Vercel

1. Import this project from GitHub into Vercel.
2. Open **Project → Settings → Environment Variables**.
3. Add `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `DATABASE_URL`, `MYSQL_CONNECTION_LIMIT`, `MYSQL_SSL`, `MYSQL_SSL_REJECT_UNAUTHORIZED` and `NEXT_PUBLIC_SITE_URL`.
4. Apply the variables to Production and Preview as needed.
5. Redeploy the project.

Keep `DATABASE_URL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` secret. Do not prefix them with `NEXT_PUBLIC_`.

After changing an environment variable, create a new deployment. Existing Vercel deployments do not receive newly added values automatically.

The default pool limit is three connections per application instance to reduce connection pressure on serverless hosting. If your MySQL provider has a low connection allowance, leave this value at three or reduce it.

## 4. Deploy on another Node.js host

Add the same environment variables in your hosting control panel, then run:

```bash
npm install
npm run build
npm run start
```

The production server uses port 3000 unless your host provides a different `PORT` value.

## Main folders

```text
app/                 Next.js pages, components and API routes
app/admin-login/     Administrator login
app/control/         ANTRIKSH administrator control centre
app/api/             Authentication, contact and administrator APIs
db/mysql.ts          MySQL connection pool and automatic setup
db/mysql-schema.ts   Online MySQL table definitions
db/public-content.ts Public blog, portfolio and published-content queries
public/              ANTRIKSH brand assets
```

## Published website content API

The Content hub stores versioned website copy. A connected client website can read only published records from:

```text
GET /api/content/WEBSITE_ID
GET /api/content/WEBSITE_ID?slug=/about
```

Draft content is never returned by this public endpoint.

## Controlling subscriptions for connected websites

ANTRIKSH Control includes a secure server-to-server licence check. This lets another website verify whether its care plan is active without giving that website access to your database or administrator account.

1. In **Control → Subscriptions**, create or open the website subscription.
2. Click **Generate key** and copy the one-time licence key.
3. Add these private server variables to the connected website:

```env
ANTRIKSH_CONTROL_URL="https://your-antriksh-domain.com"
ANTRIKSH_WEBSITE_ID="web_your_website_id"
ANTRIKSH_LICENCE_KEY="antriksh_the_generated_key"
```

4. Copy `examples/antriksh-control-nextjs.ts` into that Next.js website and call `checkAntrikshLicence()` from server-side code.
5. The endpoint returns `active`, `grace`, `inactive`, `expired`, or `invalid`. Clicking **Inactivate** in ANTRIKSH Control makes the next valid check return `inactive`. **Renew** extends the billing dates; **Activate** removes a manual inactivation.

Keep `ANTRIKSH_LICENCE_KEY` server-side. Never expose it through a variable beginning with `NEXT_PUBLIC_`, client JavaScript, HTML, or a URL.

For reliable client websites, do not blank the entire public site when your licence service has a temporary outage. Cache the last successful result for up to 24 hours, keep the seven-day grace period, and use inactive status to disable ANTRIKSH-managed features or show a renewal notice. This prevents an unrelated network problem from taking a client business offline.

## Quality checks

```bash
npm run lint
npm test
```
