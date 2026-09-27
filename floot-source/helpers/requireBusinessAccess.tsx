import { db } from "./db";
import { getServerUserSession } from "./getServerUserSession";

export async function requireBusinessAccess(request: Request, businessId: string) {
  const { user } = await getServerUserSession(request);
  const membership = await db.selectFrom("businessMemberships")
    .select(["id","role"])
    .where("businessId","=",businessId)
    .where("userId","=",String(user.id))
    .where("status","=","active")
    .executeTakeFirst();
  if (!membership) throw new Error("Business access denied");
  return { user, membership };
}