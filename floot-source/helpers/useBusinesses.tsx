import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getBusinesses } from "../endpoints/businesses_GET.schema";
import { AUTH_QUERY_KEY } from "./useAuth";

const SELECTED_BUSINESS_KEY = "sutra.selectedBusinessId";

export const useBusinesses = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(() => {
    try { return localStorage.getItem(SELECTED_BUSINESS_KEY); } catch { return null; }
  });
  const query = useQuery({
    queryKey: ["businesses"],
    queryFn: getBusinesses,
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const businesses = query.data?.businesses ?? [];
    if (businesses.length === 0) return;
    const exists = selectedBusinessId && businesses.some((b) => b.id === selectedBusinessId);
    if (!exists) {
      setSelectedBusinessId(businesses[0].id);
      try { localStorage.setItem(SELECTED_BUSINESS_KEY, businesses[0].id); } catch {}
    }
  }, [query.data, selectedBusinessId]);

  const selectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    try { localStorage.setItem(SELECTED_BUSINESS_KEY, businessId); } catch {}
  };

  return {
    ...query,
    businesses: query.data?.businesses ?? [],
    selectedBusinessId,
    selectedBusiness: (query.data?.businesses ?? []).find((b) => b.id === selectedBusinessId) ?? null,
    selectBusiness,
    authQueryKey: AUTH_QUERY_KEY,
  };
};