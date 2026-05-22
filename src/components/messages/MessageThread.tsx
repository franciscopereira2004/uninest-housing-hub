import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { useConversationMessages } from "@/hooks/use-conversation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/types";

interface Props {
  summary: ConversationSummary | null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export function MessageThread({ summary }: Props) {
  const { user } = useAuth();
  const conversationId = summary?.conversation.id ?? null;
  const { messages, isLoading, sendMessage, isSending } = useConversationMessages({
    conversationId
  });
  const [draft, setDraft] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!summary) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-muted-foreground">
        Seleciona uma conversa para a abrir.
      </div>
    );
  }

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(body);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium">
            {summary.otherParticipant?.name ?? "Conta removida"}
          </p>
          {summary.listing ? (
            <Link
              to={`/listing/${summary.listing.id}`}
              className="line-clamp-1 text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              {summary.listing.title}
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">Anúncio indisponível</p>
          )}
        </div>
        {summary.otherParticipant && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReportOpen(true)}
            title="Denunciar utilizador"
          >
            <Flag className="h-4 w-4" />
            <span className="sr-only">Denunciar</span>
          </Button>
        )}
      </div>

      {summary.otherParticipant && (
        <ReportDialog
          open={reportOpen}
          reportedUserId={summary.otherParticipant.id}
          targetLabel={summary.otherParticipant.name}
          onOpenChange={setReportOpen}
        />
      )}

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Sem mensagens ainda.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Escreve uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            rows={2}
            className="min-h-[44px] resize-none"
          />
          <Button onClick={submit} disabled={isSending || !draft.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
