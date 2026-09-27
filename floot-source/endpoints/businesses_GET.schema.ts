import superjson from "superjson";

export type BusinessSummary = {
  id: string;
  name: string;
  businessType: string;
  city: string | null;
  state: string | null;
  preferredLanguage: string;
  role: "owner" | "manager" | "staff";
};

export type OutputType = { businesses: BusinessSummary[] };

export const getBusinesses = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch("/_api/businesses", {
    method: "GET",
    ...init,
    headers: { ...(init?.headers ?? {}) },
    credentials: "include",
  });
  if (!result.ok) {
    const errorData = superjson.parse<{ message?: string }>(await result.text());
    throw new Error(errorData.message || "Unable to load businesses");
  }
  return superjson.parse<OutputType>(await result.text());
};