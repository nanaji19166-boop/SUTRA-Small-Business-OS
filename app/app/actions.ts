"use server";

import { createPurchase, createSale, recordPayment } from "@/lib/data/transactions";
import { revalidatePath } from "next/cache";

export async function submitSale(input:Parameters<typeof createSale>[0]){
  const result=await createSale(input);
  revalidatePath("/"); revalidatePath("/sales"); revalidatePath("/collections"); revalidatePath("/stock");
  return result;
}
export async function submitPurchase(input:Parameters<typeof createPurchase>[0]){
  const result=await createPurchase(input);
  revalidatePath("/"); revalidatePath("/purchases"); revalidatePath("/stock");
  return result;
}
export async function submitPayment(input:Parameters<typeof recordPayment>[0]){
  const result=await recordPayment(input);
  revalidatePath("/"); revalidatePath("/collections"); revalidatePath("/sales");
  return result;
}
