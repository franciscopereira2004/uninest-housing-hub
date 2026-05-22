import { z } from "zod";

const roleEnum = z.enum(["student", "landlord", "admin"]);

export const listUsersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  role: roleEnum.optional(),
  sortBy: z.enum(["name", "email", "role", "createdAt"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional()
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleEnum,
  phone: z.string().min(6).optional(),
  avatarUrl: z.string().url().optional()
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).optional(),
    role: roleEnum.optional(),
    avatarUrl: z.string().url().optional(),
    isBlocked: z.boolean().optional()
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: "Nada para atualizar."
  });

export const userIdParamSchema = z.object({
  id: z.string().min(1)
});

export const blockUserSchema = z.object({
  isBlocked: z.boolean()
});
