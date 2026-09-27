import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { schema } from "./businesses_POST.schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = schema.parse(superjson.parse(await request.text()));

    const result = await db.transaction().execute(async (trx) => {
      const business = await trx
        .insertInto("businesses")
        .values({
          name: input.name,
          ownerName: input.ownerName,
          mobile: input.mobile,
          businessType: input.businessType,
          address: input.address || null,
          city: input.city || null,
          state: input.state || null,
          pinCode: input.pinCode || null,
          preferredLanguage: input.preferredLanguage,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await trx.insertInto("businessMemberships").values({
        businessId: business.id,
        userId: user.id,
        role: "owner",
        status: "active",
      }).execute();

      await trx.insertInto("businessSettings").values({
        businessId: business.id,
      }).execute();

      await trx.insertInto("locations").values({
        businessId: business.id,
        name: "Main Location",
        locationType: "store",
        responsibleUserId: user.id,
      }).execute();

      await trx.insertInto("auditLog").values({
        businessId: business.id,
        userId: user.id,
        action: "business.created",
        entityType: "business",
        entityId: business.id,
        metadata: { businessType: input.businessType },
      }).execute();

      return business;
    });

    return new Response(superjson.stringify({ businessId: result.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ message: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return new Response(superjson.stringify({ message: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Create business error:", error);
    return new Response(superjson.stringify({ message: "Unable to create business" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}