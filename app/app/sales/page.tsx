import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitSale } from "@/app/actions";
import { TransactionForm } from "@/app/components/TransactionForm";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";

export const dynamic="force-dynamic";

export default async function SalesPage(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL) return <main className="p-6">Connect Supabase before using sales.</main>;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1);
  const business=businesses?.[0];
  if(!business) redirect("/setup");
  const [{data:products},{data:customers},{data:locations}]=await Promise.all([
    supabase.from("products").select("id,name,sale_price").eq("business_id",business.id).eq("is_active",true).order("name"),
    supabase.from("customers").select("id,name").eq("business_id",business.id).eq("is_active",true).order("name"),
    supabase.from("locations").select("id,name").eq("business_id",business.id).eq("is_active",true).order("name"),
  ]);
  const location=locations?.[0];
  return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/> Dashboard</Link><div className="mt-5 mb-5"><div className="eyebrow">Sales</div><h1 className="mt-1 text-2xl font-extrabold">New sale</h1><p className="mt-1 text-sm text-slate-500">Record items, payment and customer balance together.</p></div>{!location?<div className="card p-6">Create a stock location before recording a sale.</div>:<TransactionForm mode="sale" businessId={business.id} locationId={location.id} products={(products??[]).map(p=>({id:p.id,name:p.name,price:Number(p.sale_price)}))} customers={customers??[]} onSubmit={submitSale}/>}</div></main><MobileActionBar/></div>;
}