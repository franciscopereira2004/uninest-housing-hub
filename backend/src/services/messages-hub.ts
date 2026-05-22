import type { MessageEntity } from "../types/models.js";

interface SocketLike {
  readyState: number;
  OPEN: number;
  send(payload: string): void;
}

interface Subscriber {
  socket: SocketLike;
  userId: string;
}

type Event =
  | { type: "message"; conversationId: string; message: MessageEntity }
  | { type: "read"; conversationId: string; readerId: string };

export class MessagesHub {
  private byConversation = new Map<string, Set<Subscriber>>();

  subscribe(conversationId: string, subscriber: Subscriber): () => void {
    let set = this.byConversation.get(conversationId);
    if (!set) {
      set = new Set();
      this.byConversation.set(conversationId, set);
    }
    set.add(subscriber);
    return () => {
      const current = this.byConversation.get(conversationId);
      if (!current) return;
      current.delete(subscriber);
      if (current.size === 0) this.byConversation.delete(conversationId);
    };
  }

  emit(event: Event): void {
    const subs = this.byConversation.get(event.conversationId);
    if (!subs) return;
    const payload = JSON.stringify(event);
    for (const sub of subs) {
      if (sub.socket.readyState === sub.socket.OPEN) {
        try {
          sub.socket.send(payload);
        } catch {
          // ignore — socket will eventually close
        }
      }
    }
  }
}
