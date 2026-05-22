import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { ApiError } from "@/lib/api";
import { listAllListings } from "@/lib/api/admin-listings";
import type { Listing, ListingStatus } from "@/types";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { ListingReviewDrawer } from "./ListingReviewDrawer";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return value;
  }
}

export default function AdminAllListings() {
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [selected, setSelected] = useState<Listing | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "listings", "all", status],
    queryFn: () => listAllListings(status === "all" ? undefined : { status })
  });

  const listings = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Todos os anúncios</h2>
          <p className="text-sm text-muted-foreground">
            Visão completa por estado de moderação.
          </p>
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ListingStatus | "all")}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
            <SelectItem value="suspended">Suspensos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-32 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-destructive">
                  {getErrorMessage(error, "Erro ao carregar anúncios.")}
                </TableCell>
              </TableRow>
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Sem anúncios neste estado.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{l.title}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {PROPERTY_TYPE_LABELS[l.propertyType]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.city}</TableCell>
                  <TableCell>{l.monthlyPrice}€</TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(l)}>
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListingReviewDrawer listing={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
