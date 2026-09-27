import superjson from "superjson";
import { sql } from "kysely";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const toNumber = (value: unknown) => Number(value ?? 0);

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const businessId = new URL(request.url).searchParams.get("businessId");
    if (!businessId) return new Response(superjson.stringify({ message: "Business is required" }), { status:400, headers:{"Content-Type":"application/json"} });

    const membership = await db.selectFrom("businessMemberships")
      .select("id")
      .where("businessId", "=", businessId)
      .where("userId", "=", String(user.id))
      .where("status", "=", "active")
      .executeTakeFirst();
    if (!membership) return new Response(superjson.stringify({ message: "Business access denied" }), { status:403, headers:{"Content-Type":"application/json"} });

    const business = await db.selectFrom("businesses")
      .select(["id","name","businessType","preferredLanguage"])
      .where("id","=",businessId).executeTakeFirstOrThrow();

    const today = new Date().toISOString().slice(0,10);
    const dayStart = new Date(`${today}T00:00:00.000Z`);
    const dayEnd = new Date(`${today}T23:59:59.999Z`);
    const [sales, collections, receivables, expenses, stockValue, due] = await Promise.all([
      db.selectFrom("sales").select(sql<string>`COALESCE(SUM(total_amount), 0)`.as("value")).where("businessId","=",businessId).where("saleDate",">=",dayStart).where("saleDate","<=",dayEnd).where("status","=","confirmed").executeTakeFirst(),
      db.selectFrom("payments").select(sql<string>`COALESCE(SUM(amount), 0)`.as("value")).where("businessId","=",businessId).where("paymentDate",">=",dayStart).where("paymentDate","<=",dayEnd).where("customerId","is not",null).executeTakeFirst(),
      db.selectFrom("sales").select(sql<string>`COALESCE(SUM(balance_amount), 0)`.as("value")).where("businessId","=",businessId).where("status","=","confirmed").executeTakeFirst(),
      db.selectFrom("expenses").select(sql<string>`COALESCE(SUM(amount), 0)`.as("value")).where("businessId","=",businessId).where("expenseDate",">=",dayStart).where("expenseDate","<=",dayEnd).executeTakeFirst(),
      db.selectFrom("inventoryMovements").select(sql<string>`COALESCE(SUM(quantity * unit_cost), 0)`.as("value")).where("businessId","=",businessId).executeTakeFirst(),
      db.selectFrom("collectionSchedules").innerJoin("customers","customers.id","collectionSchedules.customerId").select(["collectionSchedules.id","customers.name","collectionSchedules.installmentAmount","collectionSchedules.nextDueDate"]).where("collectionSchedules.businessId","=",businessId).where("collectionSchedules.isActive","=",true).where("collectionSchedules.nextDueDate","<=",dayEnd).orderBy("collectionSchedules.nextDueDate","asc").limit(20).execute(),
    ]);

    const metrics = { sales:toNumber(sales?.value), collections:toNumber(collections?.value), receivables:toNumber(receivables?.value), stockValue:toNumber(stockValue?.value), expenses:toNumber(expenses?.value) };
    return new Response(superjson.stringify({ business, metrics, collectionsDue: due.map((x) => ({ id:x.id, name:x.name, amount:toNumber(x.installmentAmount), dueDate:String(x.nextDueDate).slice(0,10) })) }), { headers:{"Content-Type":"application/json"} });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return new Response(superjson.stringify({message:"Not authenticated"}), {status:401,headers:{"Content-Type":"application/json"}});
    console.error("Dashboard error:", error);
    return new Response(superjson.stringify({message:"Unable to load dashboard"}), {status:500,headers:{"Content-Type":"application/json"}});
  }
}