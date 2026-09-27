import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  ownerName: z.string().trim().min(2, "Owner name is required"),
  mobile: z.string().trim().optional().default(""),
  businessType: z.string().trim().min(2, "Choose a business type"),
  address: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  pinCode: z.string().trim().optional().default(""),
  preferredLanguage: z.enum(["te", "en"]).default("te"),
});

export type OutputType = { businessId: string };

export const postBusiness = async (
  body: z.infer<typeof schema>,
  init?: RequestInit,
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch("/_api/businesses", {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  if (!result.ok) {
    const errorData = superjson.parse<{ message?: string }>(await result.text());
    throw new Error(errorData.message || "Unable to create business");
  }
  return superjson.parse<OutputType>(await result.text());
};