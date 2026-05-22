import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Flag, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createReport } from "@/lib/api/reports";
import { REPORT_REASON_LABELS, type ReportReason } from "@/types";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId?: string;
  reportedUserId?: string;
  targetLabel: string;
}

const REASON_OPTIONS: ReportReason[] = [
  "fake_listing",
  "suspicious_price",
  "wrong_information",
  "inappropriate_behavior",
  "scam_attempt",
  "other"
];

export function ReportDialog({ open, onOpenChange, listingId, reportedUserId, targetLabel }: Props) {
  const [reason, setReason] = useState<ReportReason>("fake_listing");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setReason("fake_listing");
      setDescription("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      createReport({
        listingId,
        reportedUserId,
        reason,
        description: description.trim()
      }),
    onSuccess: () => {
      toast.success("Denúncia enviada. A equipa UniNest vai analisar.");
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao enviar denúncia."))
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            Denunciar
          </DialogTitle>
          <DialogDescription>
            A reportar: <span className="font-medium">{targetLabel}</span>. A tua denúncia é
            anónima — o utilizador denunciado não vê quem reportou.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Motivo</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger id="report-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {REPORT_REASON_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-description">Descrição</Label>
            <Textarea
              id="report-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreve o que aconteceu, com o máximo de detalhe possível (mínimo 10 caracteres)..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || description.trim().length < 10}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar denúncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
