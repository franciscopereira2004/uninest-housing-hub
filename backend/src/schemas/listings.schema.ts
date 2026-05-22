import { z } from "zod";

export const propertyTypeEnum = z.enum(["room", "apartment", "studio", "shared_house"]);

const optionalBoolFlag = z
  .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
  .optional();

const typesFilter = z
  .union([z.string(), z.array(propertyTypeEnum)])
  .transform((value) => {
    if (Array.isArray(value)) return value;
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as z.infer<typeof propertyTypeEnum>[];
  })
  .pipe(z.array(propertyTypeEnum))
  .optional();

export const listingsFiltersSchema = z.object({
  keyword: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  nearbyUniversity: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  types: typesFilter,
  internet: optionalBoolFlag,
  furnished: optionalBoolFlag,
  billsIncluded: optionalBoolFlag,
  contractAvailable: optionalBoolFlag,
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  maxDistance: z.coerce.number().nonnegative().optional(),
  availableFrom: z.string().optional(),
  sortBy: z.enum(["recent", "priceAsc", "priceDesc"]).optional()
});

export const adminListingsFiltersSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional()
});

export const listingImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  order: z.number().int().nonnegative()
});

export const createListingSchema = z.object({
  title: z.string().trim().min(5, "Título deve ter pelo menos 5 caracteres.").max(140),
  description: z.string().trim().min(20, "Descrição deve ter pelo menos 20 caracteres.").max(4000),
  propertyType: propertyTypeEnum,
  city: z.string().trim().min(1, "Cidade é obrigatória."),
  address: z.string().trim().min(3, "Morada é obrigatória."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  nearbyUniversity: z.string().trim().min(1, "Universidade próxima é obrigatória."),
  distanceToUniversity: z.number().nonnegative(),
  monthlyPrice: z.number().positive("O preço mensal deve ser positivo."),
  depositAmount: z.number().nonnegative(),
  billsIncluded: z.boolean(),
  availableFrom: z.string().min(1),
  minimumStay: z.number().int().positive(),
  maxTenants: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  furnished: z.boolean(),
  internetIncluded: z.boolean(),
  contractAvailable: z.boolean(),
  houseRules: z.array(z.string().trim().min(1)).default([]),
  amenities: z.array(z.string().trim().min(1)).default([]),
  images: z.array(listingImageSchema).min(3, "Adiciona pelo menos 3 imagens.")
});

export const updateListingSchema = createListingSchema.partial().refine(
  (obj) => Object.values(obj).some((v) => v !== undefined),
  { message: "Nada para atualizar." }
);

export const listingIdParamSchema = z.object({
  id: z.string().min(1)
});

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(3, "Indica o motivo da rejeição.")
});

export function parseBool(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  return value === "1" || value === "true";
}

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
