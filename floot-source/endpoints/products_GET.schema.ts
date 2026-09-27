import superjson from "superjson";
export type ProductRow = { id:string; name:string; sku:string|null; category:string|null; unit:string; salePrice:number; purchasePrice:number; reorderLevel:number };
export type OutputType = { products:ProductRow[] };
export const getProducts = async (businessId:string, init?:RequestInit):Promise<OutputType> => {
  const r = await fetch(`/_api/products?businessId=${encodeURIComponent(businessId)}`,{method:"GET",...init,credentials:"include"});
  if(!r.ok){const e=superjson.parse<{message?:string}>(await r.text());throw new Error(e.message||"Unable to load products");}
  return superjson.parse<OutputType>(await r.text());
};