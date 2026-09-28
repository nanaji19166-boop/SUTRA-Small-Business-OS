import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Boxes, CircleDollarSign, CreditCard, PackagePlus, ReceiptText, ShoppingCart, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinesses, getDashboardData } from "@/lib/data/dashboard";
import { Sidebar, MobileActionBar } from "@/app/components/Sidebar";
import { LanguageButton } from "@/app/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

function money(value:number){ return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value); }

export default async function Home(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
    return <main className="min-h-screen grid place-items-center p-6 bg-slate-50"><div className="card max-w-lg p-6"><div className="text-xs font-bold uppercase tracking-wide text-indigo-700">SUTRA setup</div><h1 className="mt-2 text-2xl font-extrabold">Database connection is not configured yet.</h1><p className="mt-2 text-sm text-slate-600">The application is ready for the Supabase connection. No demo business numbers are being shown.</p></div></main>;
  }

  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const businesses=await getBusinesses();
  if(businesses.length===0){
    return <main className="min-h-screen grid place-items-center p-6 bg-slate-50"><div className="card max-w-lg p-6"><div className="text-xs font-bold uppercase tracking-wide text-indigo-700">Start your business</div><h1 className="mt-2 text-2xl font-extrabold">Your SUTRA workspace is ready.</h1><p className="mt-2 text-sm text-slate-600">Create your first business to begin adding products, customers and transactions.</p><Link href="/setup" className="mt-5 inline-flex rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white">Set up business</Link></div></main>;
  }

  const business=businesses[0];
  const data=await getDashboardData(business.id);
  const metrics=[
    ["Today's sales",money(data.todaySales),"Confirmed sales today",ShoppingCart],
    ["Collections",money(data.todayCollections),"Customer payments today",CircleDollarSign],
    ["Receivables",money(data.receivables),"Customer outstanding",CreditCard],
    ["Stock value",money(data.stockValue),"Inventory at recorded cost",Boxes],
  ] as const;
  const actions=[
    ["New sale","Record a customer sale","/sales",ShoppingCart],
    ["Add stock","Record a purchase","/purchases",PackagePlus],
    ["Collect payment","Update customer dues","/collections",CircleDollarSign],
    ["Add customer","Create a customer","/customers",Users],
  ] as const;

  return <div className="sutra-shell">
    <Sidebar/>
    <main className="sutra-main">
      <header className="sutra-topbar"><div className="sutra-content flex items-center justify-between py-3"><div><div className="eyebrow">Business</div><div className="font-bold">{business.name}</div></div><LanguageButton/></div></header>
      <div className="sutra-content space-y-5">
        <section className="card p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow">Business pulse</div><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Today at a glance</h1><p className="mt-1 text-sm text-slate-500">Live numbers from your business data.</p></div><span className="pill pill-success">Connected</span></div></section>
        <section className="metric-grid">{metrics.map(([label,value,hint,Icon])=><article key={label} className="card metric-card"><div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={18}/></div><div className="mt-4 eyebrow">{label}</div><div className="mt-1 value">{value}</div><div className="mt-1 text-xs text-slate-500">{hint}</div></article>)}</section>
        <section><div className="mb-2"><div className="section-title">Quick actions</div><div className="eyebrow">Start common work in one tap.</div></div><div className="quick-grid">{actions.map(([label,detail,href,Icon])=><Link key={label} href={href} className="card quick-action hover:border-indigo-200 hover:bg-indigo-50/30"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19}/></div><div className="min-w-0"><div className="font-bold text-sm">{label}</div><div className="mt-1 text-xs text-slate-500">{detail}</div></div></Link>)}</div></section>
        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="card p-5"><div className="flex items-center justify-between"><div><div className="section-title">Today</div><div className="eyebrow">Business activity summary</div></div><ReceiptText size={18} className="text-slate-400"/></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><div className="eyebrow">Expenses</div><div className="mt-1 text-xl font-extrabold">{money(data.todayExpenses)}</div></div><Link href="/sales" className="rounded-xl bg-slate-50 p-4"><div className="eyebrow">Sales ledger</div><div className="mt-1 font-bold">Open sales →</div></Link></div></div>
          <div className="card p-5"><div className="section-title">Stock attention</div><div className="eyebrow mt-1">Items below reorder level will appear here.</div><div className="mt-5 rounded-xl border border-dashed border-slate-200 p-7 text-center"><ArrowDownToLine size={20} className="mx-auto text-slate-400"/><div className="mt-2 text-sm font-semibold">Stock alerts are coming next</div><div className="mt-1 text-xs text-slate-500">The stock ledger is being wired to live low-stock calculations.</div></div></div>
        </section>
      </div>
    </main>
    <MobileActionBar/>
  </div>;
}
