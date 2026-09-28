import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(businessId:string) {
  const supabase=await createClient();
  const [sales,collections,receivables,stock,expenses,customerOpening] = await Promise.all([
    supabase.from("sales").select("total_amount,sale_date,status").eq("business_id",businessId).eq("status","confirmed").eq("sale_date",new Date().toISOString().slice(0,10)),
    supabase.from("payments").select("amount,payment_date,customer_id").eq("business_id",businessId).eq("payment_date",new Date().toISOString().slice(0,10)).not("customer_id","is",null),
    supabase.from("sales").select("balance_amount").eq("business_id",businessId).eq("status","confirmed").gt("balance_amount",0),
    supabase.from("customers").select("opening_balance").eq("business_id",businessId).eq("is_active",true),
    supabase.from("inventory_movements").select("quantity,unit_cost").eq("business_id",businessId),
    supabase.from("expenses").select("amount,expense_date").eq("business_id",businessId).eq("expense_date",new Date().toISOString().slice(0,10)),
  ]);

  const error = [sales,collections,receivables,stock,expenses,customerOpening].find(r=>r.error)?.error;
  if(error) throw new Error(error.message);

  return {
    todaySales:(sales.data??[]).reduce((s,r)=>s+Number(r.total_amount),0),
    todayCollections:(collections.data??[]).reduce((s,r)=>s+Number(r.amount),0),
    receivables:(receivables.data??[]).reduce((s,r)=>s+Number(r.balance_amount),0)+(customerOpening.data??[]).reduce((s,r)=>s+Number(r.opening_balance),0),
    stockValue:(stock.data??[]).reduce((s,r)=>s+Number(r.quantity)*Number(r.unit_cost),0),
    todayExpenses:(expenses.data??[]).reduce((s,r)=>s+Number(r.amount),0),
  };
}

export async function getBusinesses() {
  const supabase=await createClient();
  const {data,error}=await supabase.from("businesses").select("id,name,industry_template").order("created_at",{ascending:true});
  if(error) throw new Error(error.message);
  return data??[];
}
