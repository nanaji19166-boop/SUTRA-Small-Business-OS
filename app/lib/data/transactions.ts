import { createClient } from "@/lib/supabase/server";

export type SaleLineInput = { product_id:string; quantity:number; unit_price:number };
export type PurchaseLineInput = { product_id:string; quantity:number; unit_price:number };

export async function createSale(input:{
  businessId:string; customerId?:string|null; locationId:string; saleNumber:string;
  saleDate?:string; discount:number; paidAmount:number; paymentMethod?:string|null;
  notes?:string|null; lines:SaleLineInput[]; collection?:Record<string,unknown>|null;
}) {
  const supabase=await createClient();
  const { data, error } = await supabase.rpc("create_sale",{
    p_business_id:input.businessId,
    p_customer_id:input.customerId ?? null,
    p_location_id:input.locationId,
    p_sale_number:input.saleNumber,
    p_sale_date:input.saleDate ?? null,
    p_discount:input.discount,
    p_paid_amount:input.paidAmount,
    p_payment_method:input.paymentMethod ?? null,
    p_notes:input.notes ?? null,
    p_lines:input.lines,
    p_collection:input.collection ?? null,
  });
  if(error) throw new Error(error.message);
  return data;
}

export async function createPurchase(input:{
  businessId:string; supplierId?:string|null; locationId:string; purchaseNumber:string;
  purchaseDate?:string; discount:number; paidAmount:number; paymentMethod?:string|null;
  notes?:string|null; lines:PurchaseLineInput[];
}) {
  const supabase=await createClient();
  const { data, error } = await supabase.rpc("create_purchase",{
    p_business_id:input.businessId,
    p_supplier_id:input.supplierId ?? null,
    p_location_id:input.locationId,
    p_purchase_number:input.purchaseNumber,
    p_purchase_date:input.purchaseDate ?? null,
    p_discount:input.discount,
    p_paid_amount:input.paidAmount,
    p_payment_method:input.paymentMethod ?? null,
    p_notes:input.notes ?? null,
    p_lines:input.lines,
  });
  if(error) throw new Error(error.message);
  return data;
}

export async function recordPayment(input:{
  businessId:string; customerId?:string|null; supplierId?:string|null;
  saleId?:string|null; purchaseId?:string|null; scheduleId?:string|null;
  amount:number; paymentMethod:string; paymentDate?:string; reference?:string|null; notes?:string|null;
}) {
  const supabase=await createClient();
  const { data, error } = await supabase.rpc("record_payment",{
    p_business_id:input.businessId,
    p_customer_id:input.customerId ?? null,
    p_supplier_id:input.supplierId ?? null,
    p_sale_id:input.saleId ?? null,
    p_purchase_id:input.purchaseId ?? null,
    p_schedule_id:input.scheduleId ?? null,
    p_amount:input.amount,
    p_payment_method:input.paymentMethod,
    p_payment_date:input.paymentDate ?? null,
    p_reference:input.reference ?? null,
    p_notes:input.notes ?? null,
  });
  if(error) throw new Error(error.message);
  return data;
}
