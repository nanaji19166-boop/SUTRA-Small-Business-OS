import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
export async function handle(request:Request){
  try{const {user}=await getServerUserSession(request);const id=new URL(request.url).searchParams.get("businessId");if(!id)throw new Error("Business is required");
    const access=await db.selectFrom("businessMemberships").select("id").where("businessId","=",id).where("userId","=",String(user.id)).where("status","=","active").executeTakeFirst();if(!access)return new Response(superjson.stringify({message:"Business access denied"}),{status:403,headers:{"Content-Type":"application/json"}});
    const rows=await db.selectFrom("products").select(["id","name","sku","category","unit","salePrice","purchasePrice","reorderLevel"]).where("businessId","=",id).where("isActive","=",true).orderBy("name","asc").execute();
    return new Response(superjson.stringify({products:rows.map(x=>({...x,salePrice:Number(x.salePrice),purchasePrice:Number(x.purchasePrice),reorderLevel:Number(x.reorderLevel)}))}),{headers:{"Content-Type":"application/json"}});
  }catch(e){return new Response(superjson.stringify({message:e instanceof Error?e.message:"Unable to load products"}),{status:500,headers:{"Content-Type":"application/json"}})}
}