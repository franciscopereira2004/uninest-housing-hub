import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/types";

const STATUS_LABEL: Record<ListingStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  suspended: "Suspenso"
};

const STATUS_VARIANT: Record<ListingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "outline"
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
