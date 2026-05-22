import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessagesInbox } from "@/components/messages/MessagesInbox";
import { MessageThread } from "@/components/messages/MessageThread";
import { useConversations } from "@/hooks/use-conversation";

export function MessagesPage() {
  const { data, isLoading } = useConversations();
  const [params, setParams] = useSearchParams();
  const initialId = params.get("conversationId");
  const [activeId, setActiveId] = useState<string | null>(initialId);

  // Auto-select first conversation when none chosen
  useEffect(() => {
    if (!activeId && data && data.length > 0) {
      setActiveId(data[0].conversation.id);
    }
  }, [activeId, data]);

  // Reflect activeId in URL so navigation back keeps state
  useEffect(() => {
    if (!activeId) return;
    if (params.get("conversationId") === activeId) return;
    const next = new URLSearchParams(params);
    next.set("conversationId", activeId);
    setParams(next, { replace: true });
  }, [activeId, params, setParams]);

  const summaries = data ?? [];
  const active = useMemo(
    () => summaries.find((c) => c.conversation.id === activeId) ?? null,
    [summaries, activeId]
  );

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden rounded-xl border bg-card shadow-soft md:grid-cols-[320px_1fr]">
      <aside className="flex flex-col overflow-y-auto border-b border-border md:border-b-0 md:border-r">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Mensagens</h2>
          <p className="text-xs text-muted-foreground">
            {summaries.length} {summaries.length === 1 ? "conversa" : "conversas"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessagesInbox
            conversations={summaries}
            loading={isLoading}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>
      </aside>
      <section className="flex h-full flex-col overflow-hidden bg-background">
        <MessageThread summary={active} />
      </section>
    </div>
  );
}
