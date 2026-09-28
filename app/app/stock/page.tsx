import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";
export const dynamic="force-dynamic";
export default async function StockPage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <main className="p-6">Connect Supabase first.</main>;
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1);const business=businesses?.[0];if(!business)redirect("/setup");
 const [{data:products},{data:movements},{data:locations}]=await Promise.all([
  supabase.from("products").select("id,name,sku,unit,reorder_level,purchase_price").eq("business_id",business.id).eq("is_active",true).order("name"),
  supabase.from("inventory_movements").select("product_id,location_id,quantity,unit_cost,movement_type,created_at").eq("business_id",business.id),
  supabase.from("locations").select("id,name").eq("business_id",business.id).eq("is_active",true).order("name")]);
 const totals=new Map<string,number>();for(const m of movements??[])totals.set(m.product_id,(totals.get(m.product_id)||0)+Number(m.quantity));
 const rows=(products??[]).map(p=>({...p,qty:totals.get(p.id)||0}));const low=rows.filter(p=>p.qty<=Number(p.reorder_level));
 return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content"><div className="mb-5"><div className="eyebrow">Stock</div><h1 className="mt-1 text-2xl font-extrabold">Inventory</h1><p className="text-sm text-slate-500">Live quantity from the stock movement ledger.</p></div><div className="grid gap-4 sm:grid-cols-3 mb-5"><div className="card p-4"><div className="eyebrow">Items</div><div className="value">{rows.length}</div></div><div className="card p-4"><div className="eyebrow">Low stock</div><div className="value">{low.length}</div></div><div className="card p-4"><div className="eyebrow">Locations</div><div className="value">{locations?.length||0}</div></div></div><div className="space-y-3">{rows.map(p=><article key={p.id} className="card p-4"><div className="flex items-center justify-between gap-4"><div><div className="font-bold">{p.name}</div><div className="text-xs text-slate-500">{p.sku||"No SKU"} · reorder at {p.reorder_level} {p.unit}</div></div><div className={p.qty<=Number(p.reorder_level)?"font-extrabold text-amber-700":"font-extrabold"}>{p.qty} {p.unit}</div></div></article>)}{rows.length===0&&<div className="card p-8 text-center text-sm text-slate-500">No products yet.</div>}</div></div></main><MobileActionBar/></div>;
}