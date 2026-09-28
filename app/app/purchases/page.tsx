import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitPurchase } from "@/app/actions";
import { TransactionForm } from "@/app/components/TransactionForm";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";
export const dynamic="force-dynamic";
export default async function PurchasesPage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <main className="p-6">Connect Supabase before using purchases.</main>;
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/login");
 const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1); const business=businesses?.[0]; if(!business)redirect("/setup");
 const [{data:products},{data:suppliers},{data:locations}]=await Promise.all([
  supabase.from("products").select("id,name,purchase_price").eq("business_id",business.id).eq("is_active",true).order("name"),
  supabase.from("suppliers").select("id,name").eq("business_id",business.id).order("name"),
  supabase.from("locations").select("id,name").eq("business_id",business.id).eq("is_active",true).order("name")]);
 const location=locations?.[0];
 return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/> Dashboard</Link><div className="mt-5 mb-5"><div className="eyebrow">Purchases</div><h1 className="mt-1 text-2xl font-extrabold">Add stock</h1><p className="mt-1 text-sm text-slate-500">Record supplier purchase and stock-in together.</p></div>{!location?<div className="card p-6">Create a stock location before recording a purchase.</div>:<TransactionForm mode="purchase" businessId={business.id} locationId={location.id} products={(products??[]).map(p=>({id:p.id,name:p.name,price:Number(p.purchase_price)}))} suppliers={suppliers??[]} onSubmit={submitPurchase}/>}</div></main><MobileActionBar/></div>;
}