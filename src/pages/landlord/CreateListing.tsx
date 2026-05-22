import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { createMyListing, type ListingPayload } from "@/lib/api/landlord-listings";
import { ListingForm } from "./ListingForm";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.detail();
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: ListingPayload) => createMyListing(payload),
    onSuccess: () => {
      toast.success("Anúncio criado. Está pendente de aprovação.");
      queryClient.invalidateQueries({ queryKey: ["landlord", "listings"] });
      navigate("/landlord/listings");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao criar anúncio."))
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-semibold">Criar novo anúncio</h2>
        <p className="text-sm text-muted-foreground">
          O anúncio fica pendente até ser revisto por um administrador.
        </p>
      </header>

      <ListingForm
        loading={mutation.isPending}
        submitLabel="Submeter para aprovação"
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}
