import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const rows = await db
      .selectFrom("businessMemberships")
      .innerJoin("businesses", "businesses.id", "businessMemberships.businessId")
      .select([
        "businesses.id",
        "businesses.name",
        "businesses.businessType",
        "businesses.city",
        "businesses.state",
        "businesses.preferredLanguage",
        "businessMemberships.role",
      ])
      .where("businessMemberships.userId", "=", String(user.id))
      .where("businessMemberships.status", "=", "active")
      .orderBy("businesses.createdAt", "asc")
      .execute();

    return new Response(superjson.stringify({ businesses: rows }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ message: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Load businesses error:", error);
    return new Response(superjson.stringify({ message: "Unable to load businesses" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}