import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "landlord"]),
  phone: z.string().min(6).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
