import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitPayment } from "@/app/actions";
import PaymentForm from "@/app/components/PaymentForm";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";
export const dynamic="force-dynamic";
export default async function CollectionsPage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <main className="p-6">Connect Supabase first.</main>;
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1);const business=businesses?.[0];if(!business)redirect("/setup");
 const [{data:customers},{data:schedules},{data:sales}]=await Promise.all([
  supabase.from("customers").select("id,name").eq("business_id",business.id).eq("is_active",true).order("name"),
  supabase.from("collection_schedules").select("id,title,customer_id,total_amount,installment_amount,frequency,next_due_date,outstanding_amount").eq("business_id",business.id).eq("is_active",true).order("next_due_date"),
  supabase.from("sales").select("id,sale_number,customer_id,balance_amount,sale_date").eq("business_id",business.id).eq("status","confirmed").gt("balance_amount",0).order("sale_date",{ascending:false}).limit(50)]);
 const names=new Map((customers??[]).map(c=>[c.id,c.name]));
 return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content"><div className="mb-5"><div className="eyebrow">Collections</div><h1 className="mt-1 text-2xl font-extrabold">Collect dues</h1><p className="text-sm text-slate-500">Scheduled instalments and outstanding sales.</p></div><div className="grid gap-5 lg:grid-cols-[360px_1fr]"><PaymentForm businessId={business.id} customers={customers??[]} schedules={schedules??[]} sales={sales??[]} onSubmit={submitPayment}/><div className="space-y-3">{(schedules??[]).map(s=><article key={s.id} className="card p-4"><div className="flex justify-between gap-3"><div><div className="font-bold">{s.title}</div><div className="text-sm text-slate-500">{names.get(s.customer_id)||"Customer"} · {s.frequency} · next due {s.next_due_date||"—"}</div></div><div className="text-right"><div className="eyebrow">Outstanding</div><div className="font-extrabold">₹{Number(s.outstanding_amount).toLocaleString("en-IN")}</div></div></div></article>)}{(sales??[]).map(s=><article key={s.id} className="card p-4"><div className="flex justify-between gap-3"><div><div className="font-bold">Sale {s.sale_number}</div><div className="text-sm text-slate-500">{names.get(s.customer_id)||"Walk-in"} · {s.sale_date}</div></div><div className="text-right"><div className="eyebrow">Sale due</div><div className="font-extrabold">₹{Number(s.balance_amount).toLocaleString("en-IN")}</div></div></div></article>)}{(schedules??[]).length===0&&(sales??[]).length===0&&<div className="card p-8 text-center text-sm text-slate-500">No outstanding collections.</div>}</div></div></div></main><MobileActionBar/></div>;
}