import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExpense } from "@/app/customer-actions";
import ExpenseForm from "@/app/components/ExpenseForm";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";
export const dynamic="force-dynamic";
export default async function FinancePage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <main className="p-6">Connect Supabase first.</main>;
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1);const business=businesses?.[0];if(!business)redirect("/setup");
 const [{data:expenses},{data:sales},{data:purchases}]=await Promise.all([
  supabase.from("expenses").select("amount,category,expense_date,payment_method").eq("business_id",business.id).order("expense_date",{ascending:false}).limit(50),
  supabase.from("sales").select("total_amount").eq("business_id",business.id).eq("status","confirmed"),
  supabase.from("purchases").select("total_amount").eq("business_id",business.id).eq("status","confirmed")]);
 const revenue=(sales??[]).reduce((s,x)=>s+Number(x.total_amount),0);const cost=(purchases??[]).reduce((s,x)=>s+Number(x.total_amount),0);const expense=(expenses??[]).reduce((s,x)=>s+Number(x.amount),0);
 return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content"><div className="mb-5"><div className="eyebrow">Finance</div><h1 className="mt-1 text-2xl font-extrabold">Cash & profit view</h1><p className="text-sm text-slate-500">Operational totals, not a statutory accounting ledger.</p></div><div className="grid gap-4 sm:grid-cols-3"><div className="card p-4"><div className="eyebrow">Sales</div><div className="value">₹{revenue.toLocaleString("en-IN")}</div></div><div className="card p-4"><div className="eyebrow">Purchases</div><div className="value">₹{cost.toLocaleString("en-IN")}</div></div><div className="card p-4"><div className="eyebrow">Expenses</div><div className="value">₹{expense.toLocaleString("en-IN")}</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]"><ExpenseForm businessId={business.id} onSubmit={createExpense}/><div className="space-y-3">{(expenses??[]).map((x,i)=><article className="card p-4" key={i}><div className="flex justify-between"><div><div className="font-bold">{x.category}</div><div className="text-sm text-slate-500">{x.expense_date} · {x.payment_method}</div></div><div className="font-extrabold">₹{Number(x.amount).toLocaleString("en-IN")}</div></div></article>)}</div></div></div></main><MobileActionBar/></div>;
}