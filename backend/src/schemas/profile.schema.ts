import { z } from "zod";

export const studentProfileSchema = z.object({
  university: z.string().trim().max(140).optional(),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional()
});

export const landlordProfileSchema = z.object({
  phone: z.string().trim().min(6).max(40).optional(),
  companyName: z.string().trim().max(140).optional(),
  description: z.string().trim().max(500).optional()
});

export const updateMyProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(140).optional(),
    phone: z.string().trim().min(6).max(40).optional(),
    avatarUrl: z.string().url().optional(),
    studentProfile: studentProfileSchema.optional(),
    landlordProfile: landlordProfileSchema.optional()
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: "Nada para atualizar."
  });

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

export const changeMyPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Indica a password atual."),
  newPassword: z.string().min(6, "A nova password tem de ter pelo menos 6 caracteres.").max(200)
});

export type ChangeMyPasswordInput = z.infer<typeof changeMyPasswordSchema>;
