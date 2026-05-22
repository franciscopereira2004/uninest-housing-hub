import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, PauseCircle, XCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { ApiError } from "@/lib/api";
import { approveListing, rejectListing, suspendListing } from "@/lib/api/admin-listings";
import type { Listing } from "@/types";
import { PROPERTY_TYPE_LABELS } from "@/types";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

interface Props {
  listing: Listing | null;
  onOpenChange: (open: boolean) => void;
}

export function ListingReviewDrawer({ listing, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  const approve = useMutation({
    mutationFn: (id: string) => approveListing(id),
    onSuccess: () => {
      toast.success("Anúncio aprovado.");
      onMutationSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao aprovar anúncio."))
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectListing(id, reason),
    onSuccess: () => {
      toast.success("Anúncio rejeitado.");
      onMutationSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao rejeitar anúncio."))
  });

  const suspend = useMutation({
    mutationFn: (id: string) => suspendListing(id),
    onSuccess: () => {
      toast.success("Anúncio suspenso.");
      onMutationSuccess();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao suspender anúncio."))
  });

  if (!listing) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const busy = approve.isPending || reject.isPending || suspend.isPending;

  return (
    <Dialog open={!!listing} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{listing.title}</span>
            <StatusBadge status={listing.status} />
          </DialogTitle>
          <DialogDescription>
            {listing.address}, {listing.city} · {listing.nearbyUniversity}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact label="Tipo" value={PROPERTY_TYPE_LABELS[listing.propertyType]} />
            <Fact label="Preço" value={`${listing.monthlyPrice}€/mês`} />
            <Fact label="Caução" value={`${listing.depositAmount}€`} />
            <Fact label="Inquilinos" value={String(listing.maxTenants)} />
            <Fact label="Quartos" value={String(listing.bedrooms)} />
            <Fact label="WC" value={String(listing.bathrooms)} />
            <Fact label="Estadia mín." value={`${listing.minimumStay} meses`} />
            <Fact label="Distância" value={`${listing.distanceToUniversity} km`} />
            <Fact label="Despesas" value={listing.billsIncluded ? "Incluídas" : "À parte"} />
            <Fact label="Contrato" value={listing.contractAvailable ? "Sim" : "Não"} />
          </div>

          <section>
            <h4 className="font-semibold">Descrição</h4>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">{listing.description}</p>
          </section>

          {listing.amenities.length > 0 && (
            <section>
              <h4 className="font-semibold">Comodidades</h4>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {listing.amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          {listing.houseRules.length > 0 && (
            <section>
              <h4 className="font-semibold">Regras da casa</h4>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {listing.houseRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {listing.images.length > 0 && (
            <section>
              <h4 className="font-semibold">Imagens ({listing.images.length})</h4>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {listing.images.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt={listing.title}
                    className="aspect-video w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          {listing.status === "rejected" && listing.rejectionReason && (
            <section className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              <p className="font-medium">Motivo da rejeição</p>
              <p className="mt-1 text-sm">{listing.rejectionReason}</p>
            </section>
          )}

          {showRejectForm && (
            <section className="space-y-2 rounded-md border bg-muted/40 p-3">
              <Label htmlFor="reject-reason">Motivo da rejeição</Label>
              <Textarea
                id="reject-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indica ao senhorio o que precisa de ser ajustado."
              />
            </section>
          )}
        </div>

        <DialogFooter className="gap-2">
          {showRejectForm ? (
            <>
              <Button variant="ghost" onClick={() => setShowRejectForm(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={busy || rejectionReason.trim().length < 3}
                onClick={() => reject.mutate({ id: listing.id, reason: rejectionReason.trim() })}
              >
                {reject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar rejeição
              </Button>
            </>
          ) : (
            <>
              {listing.status !== "suspended" && (
                <Button variant="outline" disabled={busy} onClick={() => suspend.mutate(listing.id)}>
                  <PauseCircle className="h-4 w-4" />
                  Suspender
                </Button>
              )}
              {listing.status !== "rejected" && (
                <Button variant="destructive" disabled={busy} onClick={() => setShowRejectForm(true)}>
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
              )}
              {listing.status !== "approved" && (
                <Button disabled={busy} onClick={() => approve.mutate(listing.id)}>
                  {approve.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Aprovar
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
