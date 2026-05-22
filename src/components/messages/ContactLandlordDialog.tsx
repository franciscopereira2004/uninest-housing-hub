import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { startConversation } from "@/lib/api/messages";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

interface Props {
  open: boolean;
  listingId: string;
  listingTitle: string;
  landlordName?: string;
  onOpenChange: (open: boolean) => void;
}

export function ContactLandlordDialog({
  open,
  listingId,
  listingTitle,
  landlordName,
  onOpenChange
}: Props) {
  const [body, setBody] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setBody(`Olá! Tenho interesse no anúncio "${listingTitle}". Está disponível?`);
    }
  }, [open, listingTitle]);

  const mutation = useMutation({
    mutationFn: () => startConversation(listingId, body.trim()),
    onSuccess: ({ conversation }) => {
      toast.success("Mensagem enviada.");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onOpenChange(false);
      navigate(`/student/messages?conversationId=${conversation.id}`);
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao enviar mensagem."))
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contactar {landlordName ?? "senhorio"}</DialogTitle>
          <DialogDescription>
            A tua mensagem é enviada pelo sistema interno. O senhorio não recebe o teu email nem
            telefone.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Escreve a tua mensagem..."
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !body.trim()}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
