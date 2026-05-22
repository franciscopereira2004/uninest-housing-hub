import { useQuery } from "@tanstack/react-query";
import { fetchReportCounts } from "@/lib/api/reports";
import { useAuth } from "@/context/AuthContext";

export function useOpenReports(): number {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["admin", "reports", "counts"],
    queryFn: fetchReportCounts,
    enabled: user?.role === "admin",
    refetchInterval: 30_000
  });
  return data?.open ?? 0;
}
