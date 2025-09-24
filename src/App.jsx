import React, { useEffect, useState } from "react";
import DiagnosePage from './pages/Diagnose'
/**
 * Plant Doctor – JavaScript layout skeleton (Vite + Tailwind v4)
 * Drop this into src/App.jsx in a Vite React (JS) project.
 * Requires: tailwind plugin in vite.config.js and `@import "tailwindcss";` in src/index.css
 */

// ---- Inline SVG icons ----
const Icon = {
  logo: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <path d="M12 2c-2.2 0-4 1.8-4 4v3.5c0 1.9-1.6 3.5-3.5 3.5S1 11.4 1 9.5V9a1 1 0 1 0-2 0v.5C-1 12 1 14 4.5 14A4.5 4.5 0 0 0 9 9.5V6a3 3 0 0 1 6 0v8.5c0 1.9 1.6 3.5 3.5 3.5S22 16.4 22 14.5V14a1 1 0 1 0 2 0v.5C24 18 22 20 18.5 20A4.5 4.5 0 0 1 14 15.5V6c0-2.2-1.8-4-4-4Z" fill="currentColor"/>
    </svg>
  ),
  dashboard: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z" fill="currentColor"/>
    </svg>
  ),
  diagnose: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M12 2a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V2Zm1 3h-2v4H7v2h4v4h2v-4h4V9h-4V5Z" fill="currentColor"/>
    </svg>
  ),
  schedule: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M7 2v2H4a2 2 0 0 0-2 2v2h20V6a2 2 0 0 0-2-2h-3V2h-2v2H9V2H7Zm15 8H2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10Zm-9 3h2v5h-2v-5Z" fill="currentColor"/>
    </svg>
  ),
  kb: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M4 3h11a4 4 0 0 1 4 4v12.5a.5.5 0 0 1-.8.4L15 17H6a2 2 0 0 1-2-2V3Zm2 2v10h8.5l2.5 1.9V7a2 2 0 0 0-2-2H6Z" fill="currentColor"/>
    </svg>
  ),
  plants: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M12 2c-2 4-5 6-9 6 2 3 5 4 9 4s7-1 9-4c-4 0-7-2-9-6Zm-1 11.1C9.2 16.1 6.8 18 3 18c2.5 3 5.3 4 8.9 4 3.7 0 6.6-1 9.1-4-3.9 0-6.3-1.9-8-4.9l-.9 0Z" fill="currentColor"/></svg>
  ),
  inbox: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M3 4h18l-2 12H5L3 4Zm4 14h10a2 2 0 1 1-4 0h-2a2 2 0 1 1-4 0Z" fill="currentColor"/></svg>
  ),
  settings: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.9 2.6 2.1 1.2-2 3.6-2.3-.5a7.98 7.98 0 0 1-1.7 1l-.5 2.4H9.5l-.5-2.4a7.98 7.98 0 0 1-1.7-1l-2.3.5-2-3.6 2.1-1.2a7.5 7.5 0 0 1 0-1.2L.99 8.2l2-3.6 2.3.5c.5-.4 1-.7 1.6-.9l.5-2.4h6.1l.5 2.4c.6.2 1.1.5 1.6.9l2.3-.5 2 3.6-2.1 1.2c.1.4.1.8 0 1.2Z" fill="currentColor"/></svg>
  ),
  menu: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" fill="currentColor"/></svg>
  )
};

const NAV_ITEMS = [
  { label: "Dashboard", key: "dashboard", icon: <Icon.dashboard/>, href: "#" },
  { label: "Diagnose", key: "diagnose", icon: <Icon.diagnose/>, href: "#/diagnose" },
  { label: "Schedule", key: "schedule", icon: <Icon.schedule/>, href: "#/schedule" },
  { label: "Knowledge Base", key: "kb", icon: <Icon.kb/>, href: "#/kb" },
  { label: "My Plants", key: "plants", icon: <Icon.plants/>, href: "#/plants" },
  { label: "Inbox", key: "inbox", icon: <Icon.inbox/>, href: "#/inbox" },
  { label: "Settings", key: "settings", icon: <Icon.settings/>, href: "#/settings" }
];

function Sidebar({ open, setOpen }) {
  return (
    <div>
      <div className={`fixed inset-0 bg-black/40 lg:hidden transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)} />
      <aside className={`fixed z-30 inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center gap-2 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Icon.logo/>
          <span className="font-semibold">Plant Doctor</span>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <span className="text-zinc-500">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/70 dark:bg-zinc-950/70 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-3">
      <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={onMenu} aria-label="Open navigation">
        <Icon.menu/>
      </button>
      <div className="hidden lg:flex items-center gap-2 text-zinc-500">
        <span className="text-xs">Today</span>
        <span className="text-xs">•</span>
        <span className="text-xs">3 tasks due</span>
      </div>
      <div className="ml-auto flex items-center gap-2 w-full lg:w-auto">
        <div className="relative flex-1 lg:flex-none">
          <input className="w-full lg:w-96 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Search issues, plants, protocols…" />
        </div>
        <a href="#/diagnose" className="hidden md:inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700">
  <Icon.diagnose/> <span>Start Diagnosis</span>
</a>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" aria-label="Profile" />
      </div>
    </header>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm text-zinc-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i>0 && <span className="opacity-60">/</span>}
            {it.href ? <a href={it.href} className="hover:underline">{it.label}</a> : <span className="text-zinc-700 dark:text-zinc-300">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start gap-3 justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">{children}</div>;
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Today’s focus and recent activity" actions={
        <button className="rounded-xl px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700">Start Diagnosis</button>
      }/>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-zinc-500">Active prescriptions</div>
          <div className="text-3xl font-semibold mt-1">3</div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Tasks due today</div>
          <div className="text-3xl font-semibold mt-1">2</div>
        </Card>
        <Card>
          <div className="text-sm text-zinc-500">Streak</div>
          <div className="text-3xl font-semibold mt-1">7 days</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-medium">Upcoming tasks</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between"><span>Monstera – T+24h rinse</span><span className="text-zinc-500">Today 6pm</span></li>
            <li className="flex items-center justify-between"><span>Calathea – humidity check</span><span className="text-zinc-500">Tomorrow</span></li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-medium">Recent diagnoses</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Spider mite – confidence 0.78 • <span className="text-emerald-600">Active</span></li>
            <li>Powdery mildew – confidence 0.62 • <span className="text-amber-600">Needs review</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
/*
function Diagnose() {
  return (
    <div className="space-y-4">
      <PageHeader title="Start a diagnosis" description="Upload up to 4 photos • whole, close-up, leaf back, soil" />
      <Card>
        <div className="border-2 border-dashed rounded-xl p-8 text-center text-zinc-500">
          <p>Drop images here or <button className="text-emerald-600 underline">browse</button></p>
          <p className="text-xs mt-2">We’ll suggest species and likely issues with confidence.</p>
        </div>
      </Card>
      <Card>
        <h2 className="font-medium">Recent results</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">Monstera • Spider mite • confidence 0.78</div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">Unknown aroid • Root rot risk • confidence 0.55</div>
        </div>
      </Card>
    </div>
  );
}
*/
function KnowledgeBase() {
  return (
    <div className="space-y-4">
      <PageHeader title="Knowledge Base" description="Diseases • Pests • Abiotic issues" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Diseases","Pests","Abiotic"].map((cat) => (
          <Card key={cat}>
            <h3 className="font-medium">{cat}</h3>
            <ul className="mt-2 text-sm list-disc list-inside text-zinc-600 dark:text-zinc-400">
              <li>Powdery mildew</li>
              <li>Spider mite</li>
              <li>Fungus gnat</li>
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContentArea() {
  const [route, setRoute] = useState("dashboard");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#/', '') || "dashboard");
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const pageTitle = {
    dashboard: ["Home", <Dashboard key="d"/>],
    diagnose: ["Diagnose", <DiagnosePage key="dg"/>],
    schedule: ["Schedule", <div key="sc"><PageHeader title="Schedule" description="All upcoming tasks"/><Card>Empty</Card></div>],
    kb: ["Knowledge Base", <KnowledgeBase key="kb"/>],
    plants: ["My Plants", <div key="pl"><PageHeader title="My Plants"/><Card>Empty</Card></div>],
    inbox: ["Inbox", <div key="ib"><PageHeader title="Inbox"/><Card>No notifications</Card></div>],
    settings: ["Settings", <div key="st"><PageHeader title="Settings"/><Card>Preferences coming soon</Card></div>]
  }[route] || ["Home", <Dashboard/>];

  return (
    <main className="p-4 lg:p-6 space-y-4">
      <Breadcrumbs items={[{label: 'Plant Doctor', href: '#'}, {label: pageTitle[0]}]} />
      {pageTitle[1]}
    </main>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <ContentArea />
      </div>

      {/* Bottom tabbar (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 lg:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-5 text-xs">
        {["dashboard","diagnose","schedule","kb","plants"].map((k) => (
          <a key={k} href={`#/${k}`} className="flex flex-col items-center justify-center py-2 text-zinc-600 dark:text-zinc-300">
            <span className="w-5 h-5 mb-1">{NAV_ITEMS.find(n=>n.key===k)?.icon}</span>
            {NAV_ITEMS.find(n=>n.key===k)?.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

