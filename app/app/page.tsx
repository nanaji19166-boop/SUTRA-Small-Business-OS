import {
  ArrowDownToLine, ArrowUpRight, Boxes, CircleDollarSign, CreditCard,
  LayoutDashboard, PackagePlus, ReceiptText, Settings2, ShoppingCart, Users,
} from "lucide-react";

const metrics = [
  {label:"Today's sales", value:"₹0", hint:"No transactions yet", icon:ShoppingCart},
  {label:"Collections", value:"₹0", hint:"Collected today", icon:CircleDollarSign},
  {label:"Receivables", value:"₹0", hint:"Customer outstanding", icon:CreditCard},
  {label:"Stock value", value:"₹0", hint:"Inventory at cost", icon:Boxes},
];

const actions = [
  {label:"New sale", detail:"Record a sale", icon:ShoppingCart},
  {label:"Add stock", detail:"Purchase or opening stock", icon:PackagePlus},
  {label:"Collect payment", detail:"Record customer collection", icon:CircleDollarSign},
  {label:"Add customer", detail:"Create a customer", icon:Users},
];

const nav = [
  {label:"Home", icon:LayoutDashboard},
  {label:"Sales", icon:ShoppingCart},
  {label:"Stock", icon:Boxes},
  {label:"Customers", icon:Users},
  {label:"More", icon:Settings2},
];

export default function Home() {
  return (
    <div className="sutra-shell">
      <aside className="sutra-sidebar">
        <div className="mb-6 flex items-center gap-3 px-2 business-copy">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-700 text-white font-black">S</div>
          <div><div className="font-extrabold tracking-tight">SUTRA</div><div className="text-xs text-slate-500">Small Business OS</div></div>
        </div>
        <nav className="space-y-1">
          {nav.map((item,index) => {
            const Icon=item.icon;
            return <button key={item.label} className={"nav-item "+(index===0?"active":"")}><Icon size={18}/><span className="nav-label">{item.label}</span></button>;
          })}
        </nav>
      </aside>

      <main className="sutra-main">
        <header className="sutra-topbar">
          <div className="sutra-content flex items-center justify-between py-3">
            <div><div className="eyebrow">Business</div><div className="font-bold">Your business</div></div>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">English ▾</button>
          </div>
        </header>

        <div className="sutra-content space-y-5">
          <section className="card overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="eyebrow">Business pulse</div><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Good evening 👋</h1><p className="mt-1 text-sm text-slate-500">Everything important, without the clutter.</p></div>
                <span className="pill pill-success">All systems ready</span>
              </div>
            </div>
          </section>

          <section className="metric-grid">
            {metrics.map((m) => {
              const Icon=m.icon;
              return <article key={m.label} className="card metric-card">
                <div className="flex items-start justify-between gap-2"><div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={18}/></div><ArrowUpRight size={16} className="text-slate-300"/></div>
                <div className="mt-4 eyebrow">{m.label}</div><div className="mt-1 value">{m.value}</div><div className="mt-1 text-xs text-slate-500">{m.hint}</div>
              </article>;
            })}
          </section>

          <section>
            <div className="mb-2"><div className="section-title">Quick actions</div><div className="eyebrow">The four actions you'll use most.</div></div>
            <div className="quick-grid">
              {actions.map((a) => {
                const Icon=a.icon;
                return <button key={a.label} className="card quick-action hover:border-indigo-200 hover:bg-indigo-50/30">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19}/></div>
                  <div className="min-w-0 text-left"><div className="font-bold text-sm">{a.label}</div><div className="mt-1 text-xs text-slate-500">{a.detail}</div></div>
                </button>;
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="card p-5">
              <div className="flex items-center justify-between"><div><div className="section-title">Today</div><div className="eyebrow">Activity will appear here as transactions are recorded.</div></div><ReceiptText size={18} className="text-slate-400"/></div>
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <div className="mx-auto grid size-11 place-items-center rounded-full bg-slate-100"><ReceiptText size={20} className="text-slate-500"/></div>
                <div className="mt-3 font-semibold">No activity yet</div><div className="mt-1 text-sm text-slate-500">Create your first sale or purchase to see the business timeline.</div>
              </div>
            </div>
            <div className="card p-5">
              <div className="section-title">Stock attention</div><div className="eyebrow mt-1">Low-stock items and reorder suggestions.</div>
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <ArrowDownToLine size={20} className="mx-auto text-slate-400"/><div className="mt-2 text-sm font-semibold">Nothing needs attention</div><div className="mt-1 text-xs text-slate-500">Alerts will appear here when stock drops below reorder level.</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}