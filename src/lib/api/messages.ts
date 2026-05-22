import { apiRequest, getApiBaseUrl } from "@/lib/api";
import type { Conversation, ConversationSummary, Message } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

interface DataResponse<T> {
  data: T;
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const res = await apiRequest<DataResponse<ConversationSummary[]>>("/conversations", {
    token: getToken()
  });
  return res.data;
}

export async function startConversation(
  listingId: string,
  body: string
): Promise<{ conversation: Conversation; message: Message }> {
  const res = await apiRequest<DataResponse<{ conversation: Conversation; message: Message }>>(
    "/conversations",
    {
      method: "POST",
      body: { listingId, body },
      token: getToken()
    }
  );
  return res.data;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const res = await apiRequest<DataResponse<Message[]>>(
    `/conversations/${conversationId}/messages`,
    { token: getToken() }
  );
  return res.data;
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const res = await apiRequest<DataResponse<Message>>(
    `/conversations/${conversationId}/messages`,
    { method: "POST", body: { body }, token: getToken() }
  );
  return res.data;
}

export function buildConversationWebSocketUrl(conversationId: string): string | null {
  const token = getToken();
  if (!token) return null;
  const base = getApiBaseUrl().replace(/^http/, "ws");
  return `${base}/ws/conversations/${conversationId}?token=${encodeURIComponent(token)}`;
}
