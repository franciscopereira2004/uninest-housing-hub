import { z } from "zod";

export const listingsFiltersSchema = z.object({
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  type: z.enum(["any", "apartment", "house", "studio"]).optional(),
  internet: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional(),
  furnished: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional(),
  privateBathroom: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional(),
  availableFrom: z.string().optional()
});

export function parseBool(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  return value === "1" || value === "true";
}
