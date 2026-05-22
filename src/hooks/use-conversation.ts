import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buildConversationWebSocketUrl,
  listConversations,
  listMessages,
  sendMessage
} from "@/lib/api/messages";
import { ApiError } from "@/lib/api";
import type { Message } from "@/types";

const CONVERSATIONS_KEY = ["conversations"] as const;
const messagesKey = (id: string) => ["conversations", id, "messages"] as const;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: listConversations,
    refetchInterval: 15000
  });
}

interface UseConversationMessagesOptions {
  conversationId: string | null;
}

export function useConversationMessages({ conversationId }: UseConversationMessagesOptions) {
  const queryClient = useQueryClient();
  const [wsConnected, setWsConnected] = useState(false);

  // Fallback polling — disabled while WS is connected
  const query = useQuery({
    queryKey: conversationId ? messagesKey(conversationId) : ["conversations", "noop"],
    queryFn: () => listMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: wsConnected ? false : 5000
  });

  // WebSocket subscription
  const socketRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!conversationId) return;
    const url = buildConversationWebSocketUrl(conversationId);
    if (!url) return;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.addEventListener("open", () => setWsConnected(true));
    ws.addEventListener("close", () => setWsConnected(false));
    ws.addEventListener("error", () => setWsConnected(false));

    ws.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as
          | { type: "message"; message: Message }
          | { type: "read"; readerId: string }
          | { type: "ready" }
          | { type: "error"; message: string };
        if (payload.type === "message") {
          queryClient.setQueryData<Message[]>(messagesKey(conversationId), (prev) => {
            const next = prev ? [...prev] : [];
            if (!next.some((m) => m.id === payload.message.id)) next.push(payload.message);
            return next;
          });
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
        } else if (payload.type === "read") {
          queryClient.setQueryData<Message[]>(messagesKey(conversationId), (prev) =>
            prev?.map((m) =>
              m.receiverId === payload.readerId ? { ...m, isRead: true } : m
            )
          );
        }
      } catch {
        // ignore malformed frames
      }
    });

    return () => {
      setWsConnected(false);
      ws.close();
      socketRef.current = null;
    };
  }, [conversationId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async ({ body }: { body: string }) => {
      if (!conversationId) throw new Error("Sem conversa ativa.");
      return sendMessage(conversationId, body);
    },
    onSuccess: (message) => {
      if (!conversationId) return;
      queryClient.setQueryData<Message[]>(messagesKey(conversationId), (prev) => {
        const next = prev ? [...prev] : [];
        if (!next.some((m) => m.id === message.id)) next.push(message);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao enviar mensagem."))
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    wsConnected,
    sendMessage: (body: string) => sendMutation.mutate({ body }),
    isSending: sendMutation.isPending
  };
}
