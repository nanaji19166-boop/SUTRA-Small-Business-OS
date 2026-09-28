import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/app/customer-actions";
import CustomerForm from "@/app/components/CustomerForm";
import { Sidebar,MobileActionBar } from "@/app/components/Sidebar";
export const dynamic="force-dynamic";
export default async function CustomersPage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL)return <main className="p-6">Connect Supabase first.</main>;
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:businesses}=await supabase.from("businesses").select("id,name").limit(1);const business=businesses?.[0];if(!business)redirect("/setup");
 const [{data:customers},{data:sales}]=await Promise.all([supabase.from("customers").select("id,name,mobile,address,opening_balance").eq("business_id",business.id).eq("is_active",true).order("name"),supabase.from("sales").select("customer_id,balance_amount").eq("business_id",business.id).eq("status","confirmed").gt("balance_amount",0)]);
 const balances=new Map<string,number>();for(const c of customers??[])balances.set(c.id,Number(c.opening_balance)||0);for(const s of sales??[])if(s.customer_id)balances.set(s.customer_id,(balances.get(s.customer_id)||0)+Number(s.balance_amount));
 return <div className="sutra-shell"><Sidebar/><main className="sutra-main"><div className="sutra-content"><div className="mb-5"><div className="eyebrow">Customers</div><h1 className="mt-1 text-2xl font-extrabold">Customer book</h1><p className="text-sm text-slate-500">Contacts and outstanding sales in one place.</p></div><div className="grid gap-5 lg:grid-cols-[360px_1fr]"><CustomerForm businessId={business.id} onSubmit={createCustomer}/><div className="space-y-3">{(customers??[]).map(c=><article key={c.id} className="card p-4"><div className="flex items-start justify-between gap-4"><div><div className="font-bold">{c.name}</div><div className="mt-1 text-sm text-slate-500">{c.mobile||"No mobile"}{c.address?" · "+c.address:""}</div></div><div className="text-right"><div className="eyebrow">Due</div><div className="font-extrabold">₹{(balances.get(c.id)||0).toLocaleString("en-IN")}</div></div></div></article>)}{(customers??[]).length===0&&<div className="card p-8 text-center text-sm text-slate-500">No customers yet.</div>}</div></div></div></main><MobileActionBar/></div>;
}