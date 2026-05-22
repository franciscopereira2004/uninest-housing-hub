import { z } from "zod";

export const startConversationSchema = z.object({
  listingId: z.string().min(1),
  body: z.string().trim().min(1, "A mensagem não pode estar vazia.").max(2000)
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, "A mensagem não pode estar vazia.").max(2000)
});

export const conversationIdParamSchema = z.object({
  id: z.string().min(1)
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
