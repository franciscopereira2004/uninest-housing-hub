import { useConversations } from "@/hooks/use-conversation";

export function useUnreadMessages(): number {
  const { data } = useConversations();
  if (!data) return 0;
  return data.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);
}
