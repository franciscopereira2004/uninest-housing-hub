import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { deleteMyListing, listMyListings } from "@/lib/api/landlord-listings";
import type { Listing } from "@/types";

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

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function MyListings() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Listing | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["landlord", "listings"],
    queryFn: listMyListings
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMyListing(id),
    onSuccess: () => {
      toast.success("Anúncio eliminado.");
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ["landlord", "listings"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao eliminar anúncio."))
  });

  const listings = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Os meus anúncios</h2>
          <p className="text-sm text-muted-foreground">
            Acompanha o estado de moderação dos teus alojamentos.
          </p>
        </div>
        <Button asChild>
          <Link to="/landlord/listings/new" className="gap-2">
            <Plus className="h-4 w-4" /> Novo anúncio
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-12 text-right">Ações</TableHead>
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
                  Ainda não criaste nenhum anúncio.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/listing/${l.id}`}
                      className="line-clamp-1 hover:text-primary hover:underline"
                    >
                      {l.title}
                    </Link>
                    {l.status === "rejected" && l.rejectionReason && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                        {l.rejectionReason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.city}</TableCell>
                  <TableCell>{l.monthlyPrice}€</TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Ações">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/landlord/listings/${l.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setTarget(l)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar anúncio</DialogTitle>
            <DialogDescription>
              {target ? (
                <>
                  Tens a certeza que queres eliminar <span className="font-medium">{target.title}</span>?
                  Esta ação é permanente.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => target && deleteMutation.mutate(target.id)}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
