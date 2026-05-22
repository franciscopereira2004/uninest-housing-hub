import { Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
  conversations: ConversationSummary[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

export function MessagesInbox({ conversations, loading, activeId, onSelect }: Props) {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <MessageSquare className="h-8 w-8" />
        <p>Ainda não tens conversas.</p>
        {user?.role === "student" && (
          <p>Contacta um senhorio a partir da página de um anúncio.</p>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {conversations.map((c) => {
        const active = c.conversation.id === activeId;
        const cover = c.listing?.images?.[0]?.url;
        const lastBody = c.lastMessage?.body ?? "";
        const preview = lastBody.length > 60 ? `${lastBody.slice(0, 60)}…` : lastBody;
        return (
          <li key={c.conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(c.conversation.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-smooth hover:bg-muted/60",
                active && "bg-primary-soft"
              )}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {cover ? (
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">
                    {c.otherParticipant?.name ?? "Conta removida"}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {relativeTime(c.lastMessage?.createdAt ?? c.conversation.createdAt)}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {c.listing?.title ?? "Anúncio indisponível"}
                </p>
                <p
                  className={cn(
                    "mt-1 line-clamp-1 text-xs",
                    c.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {preview || "Sem mensagens"}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                  {c.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
