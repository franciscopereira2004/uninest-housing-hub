import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { listPendingListings } from "@/lib/api/admin-listings";
import type { Listing } from "@/types";
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

export default function AdminPendingListings() {
  const [selected, setSelected] = useState<Listing | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "listings", "pending"],
    queryFn: listPendingListings
  });

  const listings = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Anúncios pendentes</h2>
        <p className="text-sm text-muted-foreground">
          Revê cada anúncio e aprova ou rejeita com motivo.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Submetido</TableHead>
              <TableHead className="w-32 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-destructive">
                  {getErrorMessage(error, "Erro ao carregar anúncios.")}
                </TableCell>
              </TableRow>
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Não há anúncios pendentes. <StatusBadge status="approved" />
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
                  <TableCell className="text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(l)}>
                      Rever
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
