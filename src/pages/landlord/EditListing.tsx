import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { getMyListing, updateMyListing, type ListingPayload } from "@/lib/api/landlord-listings";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { ListingForm } from "./ListingForm";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.detail();
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: listing, isLoading, isError, error } = useQuery({
    queryKey: ["landlord", "listing", id],
    queryFn: () => getMyListing(id!),
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: (payload: ListingPayload) => updateMyListing(id!, payload),
    onSuccess: () => {
      toast.success("Anúncio atualizado.");
      queryClient.invalidateQueries({ queryKey: ["landlord", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["landlord", "listing", id] });
      navigate("/landlord/listings");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao atualizar anúncio."))
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-8 text-center">
        <h3 className="font-display text-lg font-semibold">Anúncio não encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {getErrorMessage(error, "Não foi possível carregar o anúncio.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">Editar anúncio</h2>
            <StatusBadge status={listing.status} />
          </div>
          <p className="text-sm text-muted-foreground">{listing.title}</p>
        </div>
      </header>

      {listing.status === "rejected" && listing.rejectionReason && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Anúncio rejeitado</p>
            <p className="mt-1">{listing.rejectionReason}</p>
            <p className="mt-2 text-xs">
              Após guardar as alterações o anúncio volta a ficar pendente de aprovação.
            </p>
          </div>
        </div>
      )}

      <ListingForm
        initial={listing}
        loading={mutation.isPending}
        submitLabel="Guardar alterações"
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}
