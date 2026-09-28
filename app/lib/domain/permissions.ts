export type BusinessRole = "owner" | "manager" | "staff";

export const can = {
  manageBusiness: (role: BusinessRole) => role === "owner",
  manageTeam: (role: BusinessRole) => role === "owner" || role === "manager",
  editCatalog: (role: BusinessRole) => role === "owner" || role === "manager",
  recordSale: (_role: BusinessRole) => true,
  recordPurchase: (role: BusinessRole) => role === "owner" || role === "manager" || role === "staff",
  recordPayment: (role: BusinessRole) => role === "owner" || role === "manager" || role === "staff",
  viewReports: (role: BusinessRole) => role === "owner" || role === "manager",
};
