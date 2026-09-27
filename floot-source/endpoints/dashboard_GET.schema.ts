import superjson from "superjson";

export type DashboardCollection = { id: string; name: string; amount: number; dueDate: string };
export type OutputType = {
  business: { id: string; name: string; businessType: string; preferredLanguage: string };
  metrics: { sales: number; collections: number; receivables: number; stockValue: number; expenses: number };
  collectionsDue: DashboardCollection[];
};

export const getDashboard = async (businessId: string, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/dashboard?businessId=${encodeURIComponent(businessId)}`, {
    method: "GET", ...init, credentials: "include",
  });
  if (!result.ok) {
    const data = superjson.parse<{ message?: string }>(await result.text());
    throw new Error(data.message || "Unable to load dashboard");
  }
  return superjson.parse<OutputType>(await result.text());
};