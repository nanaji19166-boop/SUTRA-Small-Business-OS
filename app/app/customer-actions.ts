"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function createCustomer(input:{businessId:string;name:string;mobile?:string;address?:string;openingBalance?:number}){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Not authenticated");
 const {data,error}=await supabase.from("customers").insert({business_id:input.businessId,name:input.name.trim(),mobile:input.mobile?.trim()||null,address:input.address?.trim()||null,opening_balance:input.openingBalance??0}).select("id,name").single();
 if(error)throw new Error(error.message); await supabase.from("audit_log").insert({business_id:input.businessId,user_id:user.id,action:"customer.created",entity_type:"customer",entity_id:data.id,metadata:{}});revalidatePath("/customers");revalidatePath("/");return data;
}
export async function createExpense(input:{businessId:string;category:string;amount:number;paymentMethod:string;notes?:string}){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Not authenticated");
 const {data,error}=await supabase.from("expenses").insert({business_id:input.businessId,category:input.category.trim(),amount:input.amount,payment_method:input.paymentMethod,notes:input.notes?.trim()||null,created_by:user.id}).select("id").single();
 if(error)throw new Error(error.message);await supabase.from("audit_log").insert({business_id:input.businessId,user_id:user.id,action:"expense.created",entity_type:"expense",entity_id:data.id,metadata:{amount:input.amount}});revalidatePath("/finance");revalidatePath("/");return data;
}