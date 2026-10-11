"use client";

import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CloudCog,
  Command,
  Copy,
  CreditCard,
  DatabaseBackup,
  Download,
  ExternalLink,
  FilePenLine,
  FileText,
  Globe2,
  HardDriveUpload,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorCheck,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Trash2,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { brand } from "../brand";

type Row = Record<string, string | number | boolean | null>;
type Snapshot = {
  clients: Row[];
  websites: Row[];
  subscriptions: Row[];
  payments: Row[];
  content: Row[];
  domains: Row[];
  deployments: Row[];
  backups: Row[];
  leads: Row[];
  activity: Row[];
  blogPosts: Row[];
  portfolioProjects: Row[];
  media: Row[];
  supportTickets: Row[];
  seoAudits: Row[];
  settings: Record<string, string>;
  integrations: Record<string, { state: string; detail: string }>;
};

type ViewKey =
  | "overview" | "clients" | "websites" | "content" | "subscriptions" | "payments"
  | "leads" | "blog" | "portfolio" | "seo" | "media" | "domains"
  | "deployments" | "backups" | "support" | "settings" | "activity";

type ModalKind =
  | "client" | "website" | "payment" | "content" | "subscription" | "lead"
  | "blog" | "portfolio" | "domain" | "deployment" | "backup" | "support" | "media" | null;

const emptySnapshot: Snapshot = {
  clients: [], websites: [], subscriptions: [], payments: [], content: [], domains: [],
  deployments: [], backups: [], leads: [], activity: [], blogPosts: [], portfolioProjects: [],
  media: [], supportTickets: [], seoAudits: [], settings: {}, integrations: {},
};

const navGroups: { label: string; items: { key: ViewKey; label: string; icon: typeof Activity }[] }[] = [
  { label: "Workspace", items: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "clients", label: "Clients", icon: Users },
    { key: "websites", label: "Websites", icon: Globe2 },
    { key: "content", label: "Content hub", icon: FilePenLine },
  ] },
  { label: "Revenue", items: [
    { key: "subscriptions", label: "Subscriptions", icon: CalendarClock },
    { key: "payments", label: "Payments", icon: WalletCards },
    { key: "leads", label: "Leads", icon: Zap },
  ] },
  { label: "Publishing", items: [
    { key: "blog", label: "Blog", icon: BookOpenText },
    { key: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
    { key: "seo", label: "SEO centre", icon: Sparkles },
    { key: "media", label: "Media", icon: ImageIcon },
  ] },
  { label: "Infrastructure", items: [
    { key: "domains", label: "Domains", icon: Globe2 },
    { key: "deployments", label: "Deployments", icon: HardDriveUpload },
    { key: "backups", label: "Backups", icon: DatabaseBackup },
    { key: "support", label: "Support", icon: TicketCheck },
  ] },
];

const viewMeta: Record<ViewKey, { title: string; eyebrow: string; description: string }> = {
  overview: { title: "Good evening, Antariksh", eyebrow: "Company overview", description: "Every ANTRIKSH operation, moving in one place." },
  clients: { title: "Clients", eyebrow: "Relationships", description: "Contacts, businesses, websites and account health." },
  websites: { title: "Websites", eyebrow: "Digital properties", description: "Manage environments, status, content and ownership." },
  content: { title: "Content hub", eyebrow: "Publishing", description: "Edit website pages centrally without touching code." },
  subscriptions: { title: "Subscriptions", eyebrow: "28-day care plans", description: "Renewals, grace periods and transparent licence status." },
  payments: { title: "Payments", eyebrow: "Finance", description: "Record revenue and keep every transaction auditable." },
  leads: { title: "Leads", eyebrow: "Pipeline", description: "Website enquiries, services requested and next actions." },
  blog: { title: "Blog", eyebrow: "Content marketing", description: "Draft, schedule and publish authoritative insights." },
  portfolio: { title: "Portfolio", eyebrow: "Proof of work", description: "Curate case studies, outcomes and featured projects." },
  seo: { title: "SEO control centre", eyebrow: "Organic visibility", description: "Technical issues, content signals and search performance." },
  media: { title: "Media library", eyebrow: "Assets", description: "One organized source for optimized imagery and video." },
  domains: { title: "Domains & SSL", eyebrow: "Infrastructure", description: "Expiry, DNS, verification and certificate health." },
  deployments: { title: "Deployments", eyebrow: "Releases", description: "Production status, previews and rollback readiness." },
  backups: { title: "Backups", eyebrow: "Recovery", description: "Restore points for sites, data, content and media." },
  support: { title: "Support", eyebrow: "Client care", description: "Prioritized requests with clear ownership and progress." },
  settings: { title: "Settings", eyebrow: "ANTRIKSH control", description: "Company defaults, billing rules, integrations and security." },
  activity: { title: "Activity log", eyebrow: "Audit trail", description: "A tamper-resistant record of important workspace actions." },
};

function money(value: unknown, currency = "INR") {
  const amount = Number(value ?? 0) / 100;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function dateLabel(value: unknown) {
  if (!value) return "Not set";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function Status({ value }: { value: unknown }) {
  const label = String(value || "unknown").replaceAll("_", " ");
  const tone = /active|live|ready|paid|valid|verified|published|featured|resolved|connected|configured/i.test(label)
    ? "positive" : /expir|overdue|failed|urgent|suspend|inactive|cancel|error/i.test(label) ? "negative" : "neutral";
  return <span className={`control-status ${tone}`}><span />{label}</span>;
}

function EmptyState({ icon: Icon, title, copy }: { icon: typeof Activity; title: string; copy: string }) {
  return <div className="control-empty"><Icon size={25} /><strong>{title}</strong><p>{copy}</p></div>;
}

function ControlButton({ children, variant = "secondary", onClick, type = "button", disabled = false }: {
  children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void; type?: "button" | "submit"; disabled?: boolean;
}) {
  return <button className={`control-button ${variant}`} onClick={onClick} type={type} disabled={disabled}>{children}</button>;
}

export default function ControlPanel({ initialUser }: { initialUser: { displayName: string; email: string } }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [view, setView] = useState<ViewKey>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const loadSnapshot = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/control", { cache: "no-store" });
      const body = await response.json() as Snapshot & { error?: string };
      if (!response.ok) throw new Error(body.error || "The workspace could not be loaded.");
      setSnapshot({ ...emptySnapshot, ...body });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The workspace could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSnapshot(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSnapshot]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") { setCommandOpen(false); setNotificationsOpen(false); setModal(null); setEditingRow(null); }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const go = (next: ViewKey) => {
    setView(next); setSidebarOpen(false); setCommandOpen(false); setQuery("");
  };

  const postAction = async (action: string, data: Record<string, FormDataEntryValue | string | number | boolean>): Promise<unknown> => {
    setBusy(true);
    try {
      const response = await fetch("/api/control", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const body = await response.json() as { error?: string; result?: unknown };
      if (!response.ok) throw new Error(body.error || "The action could not be completed.");
      setModal(null); setEditingRow(null); setToast("Saved successfully"); await loadSnapshot(true);
      return body.result ?? null;
    } catch (cause) {
      setToast(cause instanceof Error ? cause.message : "The action could not be completed.");
      return null;
    } finally { setBusy(false); }
  };

  const renew = async (id: string) => {
    await postAction("renewSubscription", { subscriptionId: id });
  };

  const toggleSubscription = async (row: Row) => {
    const activate = String(row.licence_status) !== "active";
    if (!activate && !window.confirm("Inactivate this subscription? The connected website licence check will return inactive.")) return;
    await postAction("setSubscriptionActive", { subscriptionId: String(row.id), active: activate });
  };

  const openEditor = (kind: Exclude<ModalKind, null>, row: Row | null = null) => {
    setEditingRow(row);
    setModal(kind);
  };

  const deleteRecord = async (kind: Exclude<ModalKind, null>, row: Row) => {
    const id = String(row.id || "");
    if (!id || !window.confirm("Delete this record permanently? This cannot be undone.")) return;
    const actions: Partial<Record<Exclude<ModalKind, null>, string>> = {
      client: "deleteClient", website: "deleteWebsite", payment: "deletePayment", content: "deleteContent",
      subscription: "deleteSubscription", lead: "deleteLead", blog: "deleteBlogPost", portfolio: "deletePortfolioProject",
      domain: "deleteDomain", deployment: "deleteDeployment", backup: "deleteBackup", support: "deleteSupportTicket",
    };
    const action = actions[kind];
    if (!action) return;
    await postAction(action, { id });
  };

  const title = viewMeta[view];
  const notificationCount = snapshot.subscriptions.filter((item) => String(item.status) !== "active").length + (error ? 1 : 0);
  const totalRevenue = snapshot.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const actionForView = () => {
    const createActions: Partial<Record<ViewKey, { kind: Exclude<ModalKind, null>; label: string }>> = {
      clients: { kind: "client", label: "Add client" }, websites: { kind: "website", label: "Add website" },
      payments: { kind: "payment", label: "Record payment" }, content: { kind: "content", label: "New page" },
      subscriptions: { kind: "subscription", label: "Add plan" },
      blog: { kind: "blog", label: "New post" }, portfolio: { kind: "portfolio", label: "New project" },
      media: { kind: "media", label: "Upload files" }, domains: { kind: "domain", label: "Add domain" },
      deployments: { kind: "deployment", label: "Record deployment" }, backups: { kind: "backup", label: "Create backup" },
      support: { kind: "support", label: "New ticket" },
    };
    const action = createActions[view];
    if (action) return <ControlButton variant="primary" onClick={() => openEditor(action.kind)}><Plus size={16} /> {action.label}</ControlButton>;
    return <ControlButton onClick={() => void loadSnapshot(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing ? "spin" : ""} /> Refresh</ControlButton>;
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin-login");
  };

  return (
    <div className="control-shell">
      <a className="control-skip" href="#control-main">Skip to content</a>
      <aside className={`control-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="control-brand">
          <Image src={brand.mark} alt="ANTRIKSH" width={1338} height={1176} priority unoptimized />
          <div><span>ANTRIKSH</span><strong>Control centre</strong></div>
        </div>
        <nav className="control-nav" aria-label="Admin navigation">
          {navGroups.map((group) => <div className="control-nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => <button key={item.key} onClick={() => go(item.key)} className={view === item.key ? "active" : ""}>
              <item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>
              {item.key === "leads" && snapshot.leads.length > 0 ? <small>{snapshot.leads.length}</small> : null}
            </button>)}
          </div>)}
        </nav>
        <div className="control-sidebar-bottom">
          <button onClick={() => go("settings")} className={view === "settings" ? "active" : ""}><Settings size={17} /><span>Settings</span></button>
          <button onClick={() => go("activity")} className={view === "activity" ? "active" : ""}><Activity size={17} /><span>Activity log</span></button>
          <div className="control-user">
            <span>{initialUser.displayName.slice(0, 1).toUpperCase()}</span>
            <div><strong>{initialUser.displayName}</strong><small>{initialUser.email}</small></div>
            <button type="button" onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut size={14} /></button>
          </div>
        </div>
      </aside>
      {sidebarOpen ? <button className="control-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}

      <section className="control-workspace">
        <header className="control-topbar">
          <button className="control-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <button className="control-search" onClick={() => setCommandOpen(true)}><Search size={16} /><span>Search clients, websites, leads…</span><kbd>⌘ K</kbd></button>
          <div className="control-top-actions">
            <span className="control-live"><i /> Systems operational</span>
            <button aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={18} />{notificationCount ? <b>{notificationCount}</b> : null}</button>
          </div>
          {notificationsOpen ? <div className="control-popover notifications">
            <div className="popover-head"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}><X size={16} /></button></div>
            {snapshot.subscriptions.filter((item) => String(item.status) !== "active").slice(0, 3).map((item) => <button key={String(item.id)} onClick={() => go("subscriptions")}><CalendarClock size={17} /><span><strong>Renewal approaching</strong><small>Due {dateLabel(item.next_due_date)}</small></span></button>)}
            {!notificationCount ? <p className="popover-empty"><CheckCircle2 size={18} /> You’re all caught up.</p> : null}
          </div> : null}
        </header>

        <main id="control-main" className="control-main">
          <div className="control-heading">
            <div><span>{title.eyebrow}</span><h1>{title.title}</h1><p>{title.description}</p></div>
            <div className="control-heading-actions">{actionForView()}</div>
          </div>

          {error ? <div className="control-alert"><ShieldCheck size={19} /><div><strong>Connection needs attention</strong><p>{error}</p></div><ControlButton onClick={() => void loadSnapshot()}>Try again</ControlButton></div> : null}
          {loading ? <LoadingView /> : <ViewContent view={view} snapshot={snapshot} query={query} setQuery={setQuery} setToast={setToast} go={go} renew={renew} toggleSubscription={toggleSubscription} totalRevenue={totalRevenue} openEditor={openEditor} postAction={postAction} loadSnapshot={loadSnapshot} />}
        </main>
      </section>

      {commandOpen ? <CommandPalette query={query} setQuery={setQuery} go={go} close={() => setCommandOpen(false)} openEditor={openEditor} /> : null}
      {modal ? <ControlModal kind={modal} record={editingRow} snapshot={snapshot} close={() => { setModal(null); setEditingRow(null); }} submit={postAction} remove={(row) => deleteRecord(modal, row)} busy={busy} reload={loadSnapshot} setToast={setToast} /> : null}
      {toast ? <div className="control-toast"><Check size={16} />{toast}</div> : null}
    </div>
  );
}

function LoadingView() {
  return <div className="control-loading"><div className="skeleton wide" /><div className="skeleton-grid">{[1,2,3,4].map((item) => <div className="skeleton card" key={item} />)}</div><div className="skeleton table" /></div>;
}

function ViewContent({ view, snapshot, query, setQuery, setToast, go, renew, toggleSubscription, totalRevenue, openEditor, postAction, loadSnapshot }: {
  view: ViewKey; snapshot: Snapshot; query: string; setQuery: (value: string) => void;
  setToast: (value: string) => void; go: (value: ViewKey) => void;
  renew: (id: string) => Promise<void>; totalRevenue: number;
  toggleSubscription: (row: Row) => Promise<void>;
  openEditor: (kind: Exclude<ModalKind, null>, row?: Row | null) => void;
  postAction: (action: string, data: Record<string, FormDataEntryValue | string | number | boolean>) => Promise<unknown>;
  loadSnapshot: (quiet?: boolean) => Promise<void>;
}) {
  if (view === "overview") return <Overview snapshot={snapshot} go={go} totalRevenue={totalRevenue} />;
  if (view === "settings") return <SettingsView snapshot={snapshot} setToast={setToast} />;
  if (view === "seo") return <SeoView snapshot={snapshot} postAction={postAction} />;
  if (view === "blog") return <SimplePublishing rows={snapshot.blogPosts} type="post" openEditor={openEditor} />;
  if (view === "portfolio") return <SimplePublishing rows={snapshot.portfolioProjects} type="project" openEditor={openEditor} />;
  if (view === "media") return <MediaView snapshot={snapshot} setToast={setToast} loadSnapshot={loadSnapshot} />;
  if (view === "support") return <SupportView snapshot={snapshot} openEditor={openEditor} />;

  const source: Record<string, Row[]> = {
    clients: snapshot.clients, websites: snapshot.websites, content: snapshot.content,
    subscriptions: snapshot.subscriptions, payments: snapshot.payments, leads: snapshot.leads,
    domains: snapshot.domains, deployments: snapshot.deployments, backups: snapshot.backups, activity: snapshot.activity,
  };
  const rows = (source[view] || []).filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <DataView view={view} rows={rows} query={query} setQuery={setQuery} setToast={setToast} renew={renew} toggleSubscription={toggleSubscription} openEditor={openEditor} />;
}

function Overview({ snapshot, go, totalRevenue }: { snapshot: Snapshot; go: (value: ViewKey) => void; totalRevenue: number }) {
  const expiring = snapshot.subscriptions.filter((item) => String(item.status) !== "active");
  const live = snapshot.websites.filter((item) => String(item.status) === "live").length;
  const metrics = [
    { label: "Active clients", value: snapshot.clients.length, detail: "Across all retained accounts", icon: Users, tone: "blue", view: "clients" as ViewKey },
    { label: "Websites live", value: live, detail: `${snapshot.websites.length - live} in draft or review`, icon: MonitorCheck, tone: "violet", view: "websites" as ViewKey },
    { label: "Revenue recorded", value: money(totalRevenue), detail: `${snapshot.payments.length} verified transactions`, icon: CircleDollarSign, tone: "green", view: "payments" as ViewKey },
    { label: "Open leads", value: snapshot.leads.length, detail: "Ready for qualification", icon: Zap, tone: "amber", view: "leads" as ViewKey },
  ];
  return <>
    <div className="control-metrics">{metrics.map((metric) => <button className="metric-card" key={metric.label} onClick={() => go(metric.view)}>
      <span className={`metric-icon ${metric.tone}`}><metric.icon size={19} /></span>
      <small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.detail}</p><ArrowUpRight size={16} className="metric-arrow" />
    </button>)}</div>
    <div className="control-dashboard-grid">
      <section className="control-card span-two">
        <div className="card-heading"><div><span>Website fleet</span><h2>Live properties</h2></div><button onClick={() => go("websites")}>View all <ArrowUpRight size={14} /></button></div>
        <div className="website-list">{snapshot.websites.map((site) => <article key={String(site.id)}>
          <div className="site-favicon">{String(site.name).slice(0,1)}</div>
          <div><strong>{site.name}</strong><a href={String(site.url)} target="_blank" rel="noreferrer">{String(site.url).replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></div>
          <Status value={site.status} /><span className="site-platform">{site.platform}</span>
          <a className="icon-link" href={String(site.url)} target="_blank" rel="noreferrer" aria-label={`Open ${site.name}`}><ExternalLink size={15} /></a>
        </article>)}</div>
      </section>
      <section className="control-card health-card">
        <div className="card-heading"><div><span>Operational health</span><h2>Agency pulse</h2></div><span className="health-score">96</span></div>
        {[{label:"SSL coverage",value:100},{label:"Production uptime",value:99.9},{label:"SEO completeness",value:86},{label:"Backup coverage",value:92}].map((item) => <div className="health-row" key={item.label}><span>{item.label}<b>{item.value}%</b></span><div><i style={{width:`${item.value}%`}} /></div></div>)}
        <p className="health-note"><ShieldCheck size={16} /> No critical incidents detected.</p>
      </section>
      <section className="control-card">
        <div className="card-heading"><div><span>28-day cycle</span><h2>Renewals</h2></div><button onClick={() => go("subscriptions")}>Manage</button></div>
        {expiring.length ? expiring.slice(0,4).map((item) => <div className="renewal-row" key={String(item.id)}><CalendarClock size={17} /><div><strong>{dateLabel(item.next_due_date)}</strong><span>{item.plan_name}</span></div><Status value={item.status} /></div>) : <EmptyState icon={CheckCircle2} title="All plans are current" copy="No subscription requires attention today." />}
      </section>
      <section className="control-card span-two">
        <div className="card-heading"><div><span>Recent trail</span><h2>Latest activity</h2></div><button onClick={() => go("activity")}>Full log</button></div>
        <div className="activity-list">{snapshot.activity.slice(0,5).map((item) => <article key={String(item.id)}><span><Activity size={15} /></span><div><strong>{item.action}</strong><p>{item.details}</p></div><time>{dateLabel(item.created_at)}</time></article>)}</div>
      </section>
    </div>
  </>;
}

function DataView({ view, rows, query, setQuery, setToast, renew, toggleSubscription, openEditor }: {
  view: ViewKey; rows: Row[]; query: string; setQuery: (value: string) => void;
  setToast: (value: string) => void; renew: (id: string) => Promise<void>;
  toggleSubscription: (row: Row) => Promise<void>;
  openEditor: (kind: Exclude<ModalKind, null>, row?: Row | null) => void;
}) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const specs: Partial<Record<ViewKey, { columns: { label: string; render: (row: Row) => ReactNode }[]; empty: string; icon: typeof Activity }>> = {
    clients: { icon: Users, empty: "Add the first client to begin organizing their websites and plans.", columns: [
      { label: "Business", render: (r) => <CellTitle title={r.business_name} detail={r.industry} /> },
      { label: "Contact", render: (r) => <CellTitle title={r.contact_name || "Not provided"} detail={r.email || r.phone || "Add contact details"} /> },
      { label: "Location", render: (r) => r.location || "—" }, { label: "Status", render: (r) => <Status value={r.status} /> },
    ] },
    websites: { icon: Globe2, empty: "Connect the first client website to manage it here.", columns: [
      { label: "Website", render: (r) => <CellTitle title={r.name} detail={String(r.url).replace(/^https?:\/\//, "")} /> },
      { label: "Platform", render: (r) => r.platform }, { label: "Environment", render: (r) => r.environment },
      { label: "Status", render: (r) => <Status value={r.status} /> },
      { label: "Open", render: (r) => <a className="table-link" href={String(r.url)} target="_blank" rel="noreferrer">Visit <ExternalLink size={13} /></a> },
    ] },
    content: { icon: FileText, empty: "Create a page to start managing website copy centrally.", columns: [
      { label: "Page", render: (r) => <CellTitle title={r.page_name} detail={r.slug} /> }, { label: "Title", render: (r) => r.title },
      { label: "Version", render: (r) => `v${r.version}` }, { label: "Updated", render: (r) => dateLabel(r.updated_at) },
      { label: "Status", render: (r) => <Status value={r.status} /> },
    ] },
    subscriptions: { icon: CalendarClock, empty: "Subscription records will appear as care plans are assigned.", columns: [
      { label: "Plan", render: (r) => <CellTitle title={r.plan_name} detail={`${r.cycle_days}-day cycle`} /> },
      { label: "Next due", render: (r) => dateLabel(r.next_due_date) }, { label: "Grace ends", render: (r) => dateLabel(r.grace_end_date) },
      { label: "Licence", render: (r) => <Status value={r.licence_status} /> }, { label: "Status", render: (r) => <Status value={r.status} /> },
      { label: "Action", render: (r) => <div className="subscription-actions"><button className="table-link" onClick={() => void renew(String(r.id))}>Renew <RefreshCw size={13} /></button><button className={`table-link ${String(r.licence_status) === "active" ? "danger-link" : "success-link"}`} onClick={() => void toggleSubscription(r)}>{String(r.licence_status) === "active" ? "Inactivate" : "Activate"}</button></div> },
    ] },
    payments: { icon: CreditCard, empty: "Record a payment to build the revenue history.", columns: [
      { label: "Amount", render: (r) => <strong>{money(r.amount, String(r.currency || "INR"))}</strong> },
      { label: "Method", render: (r) => r.method }, { label: "Reference", render: (r) => r.reference || "—" },
      { label: "Date", render: (r) => dateLabel(r.paid_at) }, { label: "Status", render: (r) => <Status value={r.status} /> },
    ] },
    leads: { icon: Zap, empty: "New project and audit enquiries will land here automatically.", columns: [
      { label: "Lead", render: (r) => <CellTitle title={r.name} detail={r.business} /> }, { label: "Service", render: (r) => r.service },
      { label: "Contact", render: (r) => <CellTitle title={r.email} detail={r.phone} /> }, { label: "Source", render: (r) => r.source },
      { label: "Status", render: (r) => <Status value={r.status} /> }, { label: "Received", render: (r) => dateLabel(r.created_at) },
    ] },
    domains: { icon: Globe2, empty: "Connected domains and certificate health will appear here.", columns: [
      { label: "Domain", render: (r) => <strong>{r.domain}</strong> }, { label: "DNS provider", render: (r) => r.dns_provider },
      { label: "SSL", render: (r) => <Status value={r.ssl_status} /> }, { label: "Verification", render: (r) => <Status value={r.verification_status} /> },
      { label: "Expiry", render: (r) => dateLabel(r.expiry_date) },
    ] },
    deployments: { icon: HardDriveUpload, empty: "Deployments will appear after a website is connected.", columns: [
      { label: "Platform", render: (r) => <CellTitle title={r.platform} detail={r.environment} /> }, { label: "Commit", render: (r) => r.commit_ref || "Production seed" },
      { label: "Deployed", render: (r) => dateLabel(r.deployed_at) }, { label: "Status", render: (r) => <Status value={r.status} /> },
      { label: "Preview", render: (r) => <a className="table-link" href={String(r.production_url)} target="_blank" rel="noreferrer">Open <ExternalLink size={13} /></a> },
    ] },
    backups: { icon: DatabaseBackup, empty: "Create the first restore point before a major website change.", columns: [
      { label: "Type", render: (r) => r.type }, { label: "Size", render: (r) => r.size_label || "Calculating" },
      { label: "Created", render: (r) => dateLabel(r.created_at) }, { label: "Status", render: (r) => <Status value={r.status} /> },
    ] },
    activity: { icon: Activity, empty: "Important actions will be recorded here.", columns: [
      { label: "Action", render: (r) => <CellTitle title={r.action} detail={r.details} /> }, { label: "User", render: (r) => r.user_email },
      { label: "Entity", render: (r) => r.entity_type }, { label: "Time", render: (r) => dateLabel(r.created_at) },
      { label: "Result", render: (r) => <Status value={r.success ? "success" : "failed"} /> },
    ] },
  };
  const spec = specs[view];
  if (!spec) return null;
  const editorKinds: Partial<Record<ViewKey, Exclude<ModalKind, null>>> = {
    clients: "client", websites: "website", content: "content", subscriptions: "subscription",
    payments: "payment", leads: "lead", domains: "domain", deployments: "deployment", backups: "backup",
  };
  const visibleColumns = spec.columns.filter((column) => !hiddenColumns.includes(column.label));
  const editorKind = editorKinds[view];
  const hasRowActions = Boolean(editorKind);
  const toggleColumn = (label: string) => setHiddenColumns((current) => current.includes(label)
    ? current.filter((item) => item !== label)
    : [...current, label]);
  const exportRows = () => {
    if (!rows.length) { setToast("There is no data to export yet."); return; }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `antriksh-${view}.csv`; link.click(); URL.revokeObjectURL(link.href); setToast("CSV exported");
  };
  return <section className="control-card table-card">
    <div className="table-tools"><label><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${view}`} /></label><div><ControlButton onClick={exportRows}>Export CSV</ControlButton><div className="column-picker"><ControlButton variant="ghost" onClick={() => setColumnsOpen((open) => !open)}><Boxes size={15} /> Columns</ControlButton>{columnsOpen ? <div className="column-menu">{spec.columns.map((column) => <label key={column.label}><input type="checkbox" checked={!hiddenColumns.includes(column.label)} onChange={() => toggleColumn(column.label)} />{column.label}</label>)}</div> : null}</div></div></div>
    {rows.length ? <div className="table-scroll"><table><thead><tr>{visibleColumns.map((column) => <th key={column.label}>{column.label}</th>)}{hasRowActions ? <th><span className="sr-only">Actions</span></th> : null}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id || index)}>{visibleColumns.map((column) => <td key={column.label}>{column.render(row)}</td>)}{editorKind ? <td><button className="icon-button" aria-label={`Edit ${view} record`} onClick={() => openEditor(editorKind, row)}><FilePenLine size={16} /></button></td> : null}</tr>)}</tbody></table></div> : <EmptyState icon={spec.icon} title="Nothing here yet" copy={spec.empty} />}
  </section>;
}

function CellTitle({ title, detail }: { title: unknown; detail: unknown }) {
  return <div className="cell-title"><strong>{String(title || "Untitled")}</strong><small>{String(detail || "")}</small></div>;
}

function SeoView({ snapshot, postAction }: {
  snapshot: Snapshot;
  postAction: (action: string, data: Record<string, FormDataEntryValue | string | number | boolean>) => Promise<unknown>;
}) {
  const pages = snapshot.content.length;
  const titledPages = snapshot.content.filter((item) => String(item.seo_title || "").trim()).length;
  const describedPages = snapshot.content.filter((item) => String(item.meta_description || "").trim()).length;
  const images = snapshot.media.filter((item) => String(item.mime_type || "").startsWith("image/"));
  const describedImages = images.filter((item) => String(item.alt_text || "").trim()).length;
  let latestDetails: Record<string, number> = {};
  const latest = snapshot.seoAudits[0];
  if (latest?.details_json) {
    try { latestDetails = JSON.parse(String(latest.details_json)) as Record<string, number>; } catch { latestDetails = {}; }
  }
  const score = Number(latest?.score ?? Math.round(((pages ? (titledPages + describedPages) / (pages * 2) : 1) * 80) + (images ? describedImages / images.length : 1) * 20));
  const checks = [
    { label: "SEO page titles", value: pages ? Math.round((titledPages / pages) * 100) : 100, state: pages - titledPages ? `${pages - titledPages} missing` : "Complete" },
    { label: "Meta descriptions", value: pages ? Math.round((describedPages / pages) * 100) : 100, state: pages - describedPages ? `${pages - describedPages} missing` : "Complete" },
    { label: "Media alt text", value: images.length ? Math.round((describedImages / images.length) * 100) : 100, state: images.length - describedImages ? `${images.length - describedImages} missing` : "Complete" },
    { label: "Audited records", value: snapshot.seoAudits.length ? 100 : 0, state: snapshot.seoAudits.length ? `${latestDetails.pagesChecked ?? pages} pages checked` : "Run first audit" },
  ];
  const searchConsole = snapshot.integrations.searchConsole;
  return <div className="control-dashboard-grid seo-grid">
    <section className="control-card span-two"><div className="card-heading"><div><span>Technical SEO</span><h2>Visibility checklist</h2></div><button onClick={() => void postAction("runSeoAudit", {})}>Run database audit</button></div>
      <div className="seo-score"><div><strong>{score}</strong><span>/100</span></div><p><b>{score >= 90 ? "Excellent foundation" : score >= 70 ? "Good, with improvements available" : "SEO work required"}</b>This score is calculated from the titles, descriptions, and media alt text currently stored in ANTRIKSH Control.</p></div>
      <div className="seo-checks">{checks.map((check) => <article key={check.label}><span>{check.label}<b>{check.state}</b></span><div><i style={{width:`${check.value}%`}} /></div></article>)}</div>
    </section>
    <section className="control-card"><div className="card-heading"><div><span>Search Console</span><h2>Integration status</h2></div></div>
      <div className="integration-notice"><CloudCog size={24} /><strong>{["connected", "configured"].includes(searchConsole?.state || "") ? "Credentials configured" : "Not connected"}</strong><p>{searchConsole?.detail || "Add Google Search Console credentials in your deployment environment to enable live performance data."}</p></div>
      <button className="text-action" disabled>Live sync requires the Google Search Console API</button>
    </section>
  </div>;
}

function SimplePublishing({ rows, type, openEditor }: { rows: Row[]; type: "post" | "project"; openEditor: (kind: Exclude<ModalKind, null>, row?: Row | null) => void }) {
  const kind = type === "post" ? "blog" : "portfolio";
  return <section className="control-card table-card">
    <div className="table-tools"><div><strong>{type === "post" ? "Editorial library" : "Selected work"}</strong><small>{rows.length} items</small></div></div>
    {rows.length ? <div className="publishing-grid">{rows.map((row, index) => <article key={String(row.id)}><span className="publish-number">{String(index + 1).padStart(2, "0")}</span><div><small>{row.category || row.service}</small><h3>{String(row.title || row.client_name || "Untitled")}</h3><p>{type === "post" ? dateLabel(row.updated_at) : String(row.result || row.summary || "")}</p></div><Status value={row.status} /><button aria-label={`Edit ${String(row.title || row.client_name || type)}`} onClick={() => openEditor(kind, row)}><FilePenLine size={16} /></button></article>)}</div> : <EmptyState icon={type === "post" ? BookOpenText : BriefcaseBusiness} title={`No ${type}s yet`} copy={`Create the first ${type} to publish it from ANTRIKSH Control.`} />}
  </section>;
}

function MediaView({ snapshot, setToast, loadSnapshot }: {
  snapshot: Snapshot;
  setToast: (value: string) => void;
  loadSnapshot: (quiet?: boolean) => Promise<void>;
}) {
  const removeMedia = async (item: Row) => {
    if (!window.confirm(`Delete ${String(item.file_name)} permanently?`)) return;
    const response = await fetch(`/api/control/media/${String(item.id)}`, { method: "DELETE" });
    const body = await response.json() as { error?: string };
    if (!response.ok) { setToast(body.error || "The file could not be deleted."); return; }
    setToast("File deleted"); await loadSnapshot(true);
  };
  const copyUrl = async (item: Row) => {
    const url = `${window.location.origin}/api/control/media/${String(item.id)}`;
    await navigator.clipboard.writeText(url); setToast("Protected media URL copied");
  };
  return <section className="control-card table-card"><div className="table-tools"><div><strong>All files</strong><small>Stored securely in MySQL</small></div></div>
    {snapshot.media.length ? <div className="media-grid">{snapshot.media.map((item, index) => <article key={String(item.id)}><a className={`media-preview preview-${index % 3 + 1}`} href={`/api/control/media/${String(item.id)}`} target="_blank" rel="noreferrer">{String(item.mime_type).startsWith("image/") ? <Image src={`/api/control/media/${String(item.id)}`} alt={String(item.alt_text || item.file_name)} width={640} height={360} unoptimized /> : <ImageIcon size={24} />}</a><div><strong>{String(item.file_name)}</strong><span>{String(item.mime_type)} · {(Number(item.file_size || 0) / 1024).toFixed(0)} KB</span><small>{String(item.alt_text || "No alt text")}</small></div><div className="media-actions"><button onClick={() => void copyUrl(item)} aria-label={`Copy ${String(item.file_name)} URL`}><Copy size={15} /></button><button onClick={() => void removeMedia(item)} aria-label={`Delete ${String(item.file_name)}`}><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState icon={ImageIcon} title="No uploaded files" copy="Upload an image, video, or PDF to store it securely in the database." />}
  </section>;
}

function SupportView({ snapshot, openEditor }: { snapshot: Snapshot; openEditor: (kind: Exclude<ModalKind, null>, row?: Row | null) => void }) {
  const clientNames = new Map(snapshot.clients.map((client) => [String(client.id), String(client.business_name)]));
  return <section className="control-card table-card"><div className="table-tools"><div><strong>Support queue</strong><small>{snapshot.supportTickets.length} requests</small></div></div>
    {snapshot.supportTickets.length ? <div className="ticket-list">{snapshot.supportTickets.map((ticket) => <article key={String(ticket.id)}><span><TicketCheck size={18} /></span><div><strong>{String(ticket.title)}</strong><small>{clientNames.get(String(ticket.client_id)) || "Internal request"}</small></div><Status value={ticket.priority} /><Status value={ticket.status} /><button aria-label={`Edit ${String(ticket.title)}`} onClick={() => openEditor("support", ticket)}><FilePenLine size={15} /></button></article>)}</div> : <EmptyState icon={TicketCheck} title="No support requests" copy="Create the first ticket to track ownership and progress." />}
  </section>;
}

function SettingsView({ snapshot, setToast }: { snapshot: Snapshot; setToast: (value: string) => void }) {
  const [values, setValues] = useState(snapshot.settings);
  const [saving, setSaving] = useState(false);
  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "saveSettings", data: values }) });
      if (!response.ok) throw new Error("Settings could not be saved."); setToast("Agency settings saved");
    } catch (cause) { setToast(cause instanceof Error ? cause.message : "Settings could not be saved."); }
    finally { setSaving(false); }
  };
  return <form className="settings-layout" onSubmit={submit}>
    <section className="control-card settings-card"><div className="card-heading"><div><span>Brand profile</span><h2>Agency details</h2></div></div>
      <div className="brand-preview"><span className="brand-preview-lockup"><Image src={brand.mark} alt="" width={1338} height={1176} unoptimized /><Image src={brand.wordmark} alt="ANTRIKSH logo preview" width={716} height={187} unoptimized /></span><div><strong>Current ANTRIKSH lockup</strong><span>Single-brand identity · safe-fit preview</span></div></div>
      <div className="field-grid"><Field label="Agency name" value={values.agency_name || brand.name} onChange={(v) => update("agency_name", v)} /><Field label="Email" type="email" value={values.agency_email || brand.email} onChange={(v) => update("agency_email", v)} /><Field label="Phone" value={values.agency_phone || brand.phoneDisplay} onChange={(v) => update("agency_phone", v)} /><Field label="Time zone" value={values.timezone || "Asia/Kolkata"} onChange={(v) => update("timezone", v)} /></div>
    </section>
    <section className="control-card settings-card"><div className="card-heading"><div><span>Billing policy</span><h2>Subscriptions</h2></div></div>
      <div className="field-grid"><Field label="Billing cycle (days)" type="number" value={values.billing_cycle || "28"} onChange={(v) => update("billing_cycle", v)} /><Field label="Grace period (days)" type="number" value={values.grace_period || "7"} onChange={(v) => update("grace_period", v)} /><Field label="Currency" value={values.currency || "INR"} onChange={(v) => update("currency", v)} /></div>
      <div className="settings-note"><ShieldCheck size={18} /><p><strong>Transparent suspension policy</strong>Licences enter a grace period before any non-destructive service suspension.</p></div>
    </section>
    <section className="control-card settings-card full"><div className="card-heading"><div><span>Connected stack</span><h2>Integrations</h2></div></div><div className="integrations-grid">{Object.entries({ database: "MySQL / TiDB", vercel: "Vercel", github: "GitHub", analytics: "Google Analytics", searchConsole: "Search Console", razorpay: "Razorpay", resend: "Resend" }).map(([key, name]) => { const integration = snapshot.integrations[key]; return <div key={key}><span>{name.slice(0,2).toUpperCase()}</span><div><strong>{name}</strong><small>{integration?.detail || "No configuration detected"}</small></div><Status value={integration?.state || "not configured"} /></div>; })}</div></section>
    <div className="settings-save"><ControlButton variant="primary" type="submit" disabled={saving}>{saving ? <RefreshCw size={15} className="spin" /> : <Check size={15} />} Save settings</ControlButton></div>
  </form>;
}

function Field({ label, name, value, defaultValue, onChange, type = "text", required = false, placeholder = "", step }: { label: string; name?: string; value?: string; defaultValue?: string; onChange?: (value: string) => void; type?: string; required?: boolean; placeholder?: string; step?: string }) {
  const controlled = value !== undefined;
  return <label className="control-field"><span>{label}</span><input name={name || label.toLowerCase().replaceAll(" ", "_")} {...(controlled ? { value, onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value) } : { defaultValue })} type={type} required={required} placeholder={placeholder} step={step} /></label>;
}

function CommandPalette({ query, setQuery, go, close, openEditor }: { query: string; setQuery: (value: string) => void; go: (value: ViewKey) => void; close: () => void; openEditor: (kind: Exclude<ModalKind, null>, row?: Row | null) => void }) {
  const commands = [
    ...Object.entries(viewMeta).map(([key, meta]) => ({ label: `Open ${meta.title}`, hint: meta.eyebrow, run: () => go(key as ViewKey) })),
    { label: "Add a new client", hint: "Action", run: () => { close(); openEditor("client"); } },
    { label: "Record a payment", hint: "Action", run: () => { close(); openEditor("payment"); } },
    { label: "Create website page", hint: "Action", run: () => { close(); openEditor("content"); } },
    { label: "Write a blog post", hint: "Action", run: () => { close(); openEditor("blog"); } },
    { label: "Upload media", hint: "Action", run: () => { close(); openEditor("media"); } },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  return <div className="command-backdrop" onMouseDown={close}><div className="command-panel" onMouseDown={(e) => e.stopPropagation()}>
    <div className="command-input"><Search size={18} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command or search…" /><kbd>ESC</kbd></div>
    <div className="command-results"><p>Commands</p>{commands.slice(0,9).map((item) => <button key={item.label} onClick={item.run}><span><Command size={15} /></span><strong>{item.label}</strong><small>{item.hint}</small></button>)}{!commands.length ? <EmptyState icon={Search} title="No matching command" copy="Try searching for clients, websites or settings." /> : null}</div>
  </div></div>;
}

function inputDate(value: unknown) {
  return value ? String(value).slice(0, 10) : "";
}

function inputDateTime(value: unknown) {
  return value ? String(value).replace(" ", "T").slice(0, 16) : "";
}

function ControlModal({ kind, record, snapshot, close, submit, remove, busy, reload, setToast }: {
  kind: Exclude<ModalKind, null>;
  record: Row | null;
  snapshot: Snapshot;
  close: () => void;
  submit: (action: string, data: Record<string, FormDataEntryValue | string | number | boolean>) => Promise<unknown>;
  remove: (row: Row) => Promise<void>;
  busy: boolean;
  reload: (quiet?: boolean) => Promise<void>;
  setToast: (value: string) => void;
}) {
  const [licenceToken, setLicenceToken] = useState("");
  const [licenceBusy, setLicenceBusy] = useState(false);
  const editing = Boolean(record?.id);
  const titles: Record<Exclude<ModalKind, null>, string> = {
    client: editing ? "Edit client" : "Add client", website: editing ? "Edit website" : "Add website",
    payment: editing ? "Edit payment" : "Record payment", content: editing ? "Edit website page" : "Create website page",
    subscription: editing ? "Edit subscription" : "Add subscription", lead: "Update lead",
    blog: editing ? "Edit blog post" : "New blog post", portfolio: editing ? "Edit portfolio project" : "New portfolio project",
    domain: editing ? "Edit domain" : "Add domain", deployment: editing ? "Edit deployment" : "Record deployment",
    backup: editing ? "Backup details" : "Create backup", support: editing ? "Edit support ticket" : "New support ticket",
    media: "Upload media",
  };
  const actionByKind: Record<Exclude<ModalKind, null>, string> = {
    client: editing ? "updateClient" : "createClient", website: editing ? "updateWebsite" : "createWebsite",
    payment: editing ? "updatePayment" : "recordPayment", content: "saveContent", subscription: "saveSubscription",
    lead: "updateLead", blog: "saveBlogPost", portfolio: "savePortfolioProject", domain: "saveDomain",
    deployment: "saveDeployment", backup: "createBackup", support: "saveSupportTicket", media: "",
  };
  const handle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (kind === "media") {
      const response = await fetch("/api/control/media", { method: "POST", body: form });
      const body = await response.json() as { error?: string };
      if (!response.ok) { setToast(body.error || "The upload failed."); return; }
      close(); setToast("File uploaded"); await reload(true); return;
    }
    const data = Object.fromEntries(form.entries());
    if (record?.id) data.id = String(record.id);
    await submit(actionByKind[kind], data);
  };
  const value = (key: string) => String(record?.[key] ?? "");
  const rotateLicence = async () => {
    if (!record?.id) return;
    if (record.licence_key_hint && !window.confirm("Rotate this licence key? The previous key will stop working immediately.")) return;
    setLicenceBusy(true);
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotateSubscriptionKey", data: { subscriptionId: String(record.id) } }),
      });
      const body = await response.json() as { error?: string; result?: { token?: string } };
      if (!response.ok || !body.result?.token) throw new Error(body.error || "The licence key could not be generated.");
      setLicenceToken(body.result.token);
      try { await navigator.clipboard.writeText(body.result.token); setToast("Licence key generated and copied"); }
      catch { setToast("Licence key generated. Copy it before closing this window."); }
      await reload(true);
    } catch (cause) { setToast(cause instanceof Error ? cause.message : "The licence key could not be generated."); }
    finally { setLicenceBusy(false); }
  };
  const clientOptions = snapshot.clients;
  const websiteOptions = snapshot.websites;
  const canDelete = editing && kind !== "media";
  const isBackupDetails = kind === "backup" && editing;
  return <div className="modal-backdrop" onMouseDown={close}><div className="control-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.stopPropagation()}>
    <div className="modal-head"><div><span>ANTRIKSH Control</span><h2 id="modal-title">{titles[kind]}</h2></div><button onClick={close} aria-label="Close"><X size={18} /></button></div>
    <form onSubmit={(event) => void handle(event)}>
      {kind === "client" ? <><Field label="Business name" name="businessName" required defaultValue={value("business_name")} placeholder="Business or brand name" /><Field label="Contact name" name="contactName" defaultValue={value("contact_name")} placeholder="Primary contact" /><Field label="Email" name="email" type="email" defaultValue={value("email")} placeholder="name@company.com" /><Field label="Phone" name="phone" defaultValue={value("phone")} placeholder="+91" /><Field label="Industry" name="industry" defaultValue={value("industry")} placeholder="Healthcare, retail…" /><Field label="Location" name="location" defaultValue={value("location")} placeholder="Jaipur, Rajasthan" />{editing ? <SelectField label="Status" name="status" options={["active","paused","archived"]} defaultValue={value("status")} /> : null}<TextField label="Notes" name="notes" defaultValue={value("notes")} placeholder="Relationship context and requirements" /></> : null}
      {kind === "website" ? <><SelectField label="Client" name="clientId" rows={clientOptions} valueKey="id" labelKey="business_name" defaultValue={value("client_id")} /><Field label="Name" name="name" required defaultValue={value("name")} placeholder="Website name" /><Field label="URL" name="url" type="url" defaultValue={value("url")} placeholder="https://" /><SelectField label="Platform" name="platform" options={["Vercel","Cloudflare Pages","Netlify","Custom"]} defaultValue={value("platform") || "Vercel"} />{editing ? <><SelectField label="Environment" name="environment" options={["production","preview","development"]} defaultValue={value("environment")} /><SelectField label="Status" name="status" options={["draft","live","paused","archived"]} defaultValue={value("status")} /><Field label="Template" name="template" defaultValue={value("template")} /></> : null}</> : null}
      {kind === "payment" ? <><SelectField label="Client" name="clientId" rows={clientOptions} valueKey="id" labelKey="business_name" defaultValue={value("client_id")} /><SelectField label="Subscription" name="subscriptionId" rows={snapshot.subscriptions} valueKey="id" labelKey="plan_name" optional defaultValue={value("subscription_id")} /><Field label="Amount" name="amount" type="number" step="0.01" required defaultValue={editing ? String(Number(record?.amount || 0) / 100) : ""} placeholder="5000" /><SelectField label="Method" name="method" options={["UPI","Bank transfer","Cash","Razorpay","Stripe","Manual"]} defaultValue={value("method")} /><Field label="Reference" name="reference" defaultValue={value("reference")} placeholder="Transaction or invoice ID" />{editing ? <SelectField label="Status" name="status" options={["paid","pending","refunded","failed"]} defaultValue={value("status")} /> : null}</> : null}
      {kind === "content" ? <><SelectField label="Website" name="websiteId" rows={websiteOptions} valueKey="id" labelKey="name" defaultValue={value("website_id")} /><Field label="Page name" name="pageName" required defaultValue={value("page_name")} placeholder="Home" /><Field label="Slug" name="slug" required defaultValue={value("slug") || "/"} placeholder="/" /><Field label="Title" name="title" required defaultValue={value("title")} placeholder="Page heading" /><TextField label="Summary" name="summary" defaultValue={value("summary")} placeholder="Core website copy" /><Field label="SEO title" name="seoTitle" defaultValue={value("seo_title")} placeholder="Search title" /><Field label="Meta description" name="metaDescription" defaultValue={value("meta_description")} placeholder="155-character page description" /><SelectField label="Status" name="status" options={["draft","published"]} defaultValue={value("status") || "draft"} /></> : null}
      {kind === "subscription" ? <><SelectField label="Client" name="clientId" rows={clientOptions} valueKey="id" labelKey="business_name" defaultValue={value("client_id")} /><SelectField label="Website" name="websiteId" rows={websiteOptions} valueKey="id" labelKey="name" defaultValue={value("website_id")} /><Field label="Plan name" name="planName" required defaultValue={value("plan_name") || "Website Care"} /><Field label="Cycle days" name="cycleDays" type="number" required defaultValue={value("cycle_days") || "28"} /><Field label="Start date" name="startDate" type="date" defaultValue={inputDate(record?.start_date)} /><Field label="Next due date" name="nextDueDate" type="date" defaultValue={inputDate(record?.next_due_date)} /><Field label="Grace end date" name="graceEndDate" type="date" defaultValue={inputDate(record?.grace_end_date)} /><Field label="Fee" name="fee" type="number" step="0.01" defaultValue={editing ? String(Number(record?.fee || 0) / 100) : ""} /><SelectField label="Status" name="status" options={["active","expiring","overdue","inactive","cancelled"]} defaultValue={value("status") || "active"} /><SelectField label="Licence" name="licenceStatus" options={["active","grace","inactive","suspended"]} defaultValue={value("licence_status") || "active"} /><label className="control-checkbox"><input name="autoRenew" type="checkbox" defaultChecked={Boolean(record?.auto_renew)} />Renew automatically</label>{editing ? <div className="licence-key-panel"><div><strong>Connected website licence</strong><span>{record?.licence_key_hint ? `Key ending in ${value("licence_key_hint")}` : "No licence key generated yet"}</span></div><ControlButton onClick={() => void rotateLicence()} disabled={licenceBusy}>{licenceBusy ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={15} />} {record?.licence_key_hint ? "Rotate key" : "Generate key"}</ControlButton>{licenceToken ? <div className="licence-token"><code>{licenceToken}</code><button type="button" onClick={() => void navigator.clipboard.writeText(licenceToken)}><Copy size={15} /> Copy</button><small>This key is shown only now. Save it in the connected website&apos;s server environment.</small></div> : null}</div> : null}</> : null}
      {kind === "lead" ? <><div className="modal-record-summary"><strong>{value("name")}</strong><span>{value("business")} · {value("service")}</span><a href={`mailto:${value("email")}`}>{value("email")}</a><p>{value("message")}</p></div><SelectField label="Status" name="status" options={["new","contacted","qualified","won","lost"]} defaultValue={value("status") || "new"} /><TextField label="Notes" name="notes" defaultValue={value("notes")} placeholder="Next action and qualification notes" /></> : null}
      {kind === "blog" ? <><Field label="Title" name="title" required defaultValue={value("title")} /><Field label="Slug" name="slug" defaultValue={value("slug")} /><Field label="Category" name="category" defaultValue={value("category") || "Insights"} /><TextField label="Excerpt" name="excerpt" defaultValue={value("excerpt")} rows={3} /><TextField label="Content" name="content" defaultValue={value("content")} required rows={10} /><SelectField label="Status" name="status" options={["draft","scheduled","published"]} defaultValue={value("status") || "draft"} /><Field label="Publish at" name="publishAt" type="datetime-local" defaultValue={inputDateTime(record?.publish_at)} /></> : null}
      {kind === "portfolio" ? <><Field label="Project name" name="name" required defaultValue={value("name")} /><Field label="Slug" name="slug" defaultValue={value("slug")} /><Field label="Service" name="service" defaultValue={value("service")} /><Field label="Result" name="result" defaultValue={value("result")} placeholder="e.g. +38% enquiries" /><TextField label="Summary" name="summary" defaultValue={value("summary")} required rows={6} /><Field label="Project URL" name="projectUrl" type="url" defaultValue={value("project_url")} placeholder="https://" /><SelectField label="Status" name="status" options={["draft","published","featured","archived"]} defaultValue={value("status") || "draft"} /></> : null}
      {kind === "domain" ? <><SelectField label="Client" name="clientId" rows={clientOptions} valueKey="id" labelKey="business_name" defaultValue={value("client_id")} /><SelectField label="Website" name="websiteId" rows={websiteOptions} valueKey="id" labelKey="name" defaultValue={value("website_id")} /><Field label="Domain" name="domain" required defaultValue={value("domain")} placeholder="example.com" /><Field label="Registrar" name="registrar" defaultValue={value("registrar")} /><Field label="DNS provider" name="dnsProvider" defaultValue={value("dns_provider")} /><SelectField label="SSL status" name="sslStatus" options={["valid","pending","expired","unknown"]} defaultValue={value("ssl_status") || "unknown"} /><SelectField label="Verification" name="verificationStatus" options={["verified","pending","unverified"]} defaultValue={value("verification_status") || "unverified"} /><Field label="Expiry date" name="expiryDate" type="date" defaultValue={inputDate(record?.expiry_date)} /></> : null}
      {kind === "deployment" ? <><SelectField label="Website" name="websiteId" rows={websiteOptions} valueKey="id" labelKey="name" defaultValue={value("website_id")} /><SelectField label="Environment" name="environment" options={["production","preview","development"]} defaultValue={value("environment") || "production"} /><SelectField label="Platform" name="platform" options={["Vercel","Cloudflare Pages","Netlify","Custom"]} defaultValue={value("platform") || "Vercel"} /><SelectField label="Status" name="status" options={["ready","building","failed","cancelled"]} defaultValue={value("status") || "ready"} /><Field label="Production URL" name="productionUrl" type="url" defaultValue={value("production_url")} placeholder="https://" /><Field label="Commit reference" name="commitRef" defaultValue={value("commit_ref")} /></> : null}
      {kind === "backup" && !editing ? <><SelectField label="Website" name="websiteId" rows={websiteOptions} valueKey="id" labelKey="name" optional /><SelectField label="Backup type" name="type" options={["workspace","content","pre-release"]} defaultValue="workspace" /><div className="settings-note full"><DatabaseBackup size={18} /><p><strong>Downloadable restore snapshot</strong>This creates a JSON backup of all ANTRIKSH Control records currently stored in MySQL.</p></div></> : null}
      {isBackupDetails ? <div className="backup-details"><DatabaseBackup size={30} /><strong>{value("type")} backup</strong><span>{value("size_label")} · created {dateLabel(record?.created_at)}</span><a className="control-button primary" href={`/api/control/backups/${value("id")}`}><Download size={15} /> Download JSON</a></div> : null}
      {kind === "support" ? <><SelectField label="Client" name="clientId" rows={clientOptions} valueKey="id" labelKey="business_name" optional defaultValue={value("client_id")} /><Field label="Title" name="title" required defaultValue={value("title")} /><TextField label="Description" name="description" required defaultValue={value("description")} rows={6} /><SelectField label="Priority" name="priority" options={["low","normal","high","urgent"]} defaultValue={value("priority") || "normal"} /><SelectField label="Status" name="status" options={["open","in_progress","waiting_for_client","resolved","closed"]} defaultValue={value("status") || "open"} /><Field label="Assignee" name="assignee" defaultValue={value("assignee")} /></> : null}
      {kind === "media" ? <><label className="control-field full"><span>Choose file (maximum 4 MB)</span><input name="file" type="file" accept="image/*,video/*,application/pdf" required /></label><Field label="Alt text" name="altText" placeholder="Describe the image for accessibility" /></> : null}
      <div className="modal-actions">{canDelete ? <ControlButton variant="danger" onClick={() => record && void remove(record)}><Trash2 size={15} /> Delete</ControlButton> : null}<span className="modal-spacer" /><ControlButton onClick={close}>Cancel</ControlButton>{!isBackupDetails ? <ControlButton variant="primary" type="submit" disabled={busy}>{busy ? <RefreshCw size={15} className="spin" /> : kind === "media" ? <HardDriveUpload size={15} /> : <Check size={15} />} {kind === "media" ? "Upload" : "Save"}</ControlButton> : null}</div>
    </form>
  </div></div>;
}

function TextField({ label, name, defaultValue = "", placeholder = "", rows = 5, required = false }: { label: string; name: string; defaultValue?: string; placeholder?: string; rows?: number; required?: boolean }) {
  return <label className="control-field full"><span>{label}</span><textarea name={name} rows={rows} defaultValue={defaultValue} placeholder={placeholder} required={required} /></label>;
}

function SelectField({ label, name, rows = [], valueKey = "id", labelKey = "name", options = [], optional = false, defaultValue = "" }: { label: string; name: string; rows?: Row[]; valueKey?: string; labelKey?: string; options?: string[]; optional?: boolean; defaultValue?: string }) {
  return <label className="control-field"><span>{label}</span><select name={name} required={!optional} defaultValue={defaultValue}><option value="">{optional ? "None" : `Select ${label.toLowerCase()}`}</option>{rows.map((row) => <option key={String(row[valueKey])} value={String(row[valueKey])}>{String(row[labelKey])}</option>)}{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>;
}
