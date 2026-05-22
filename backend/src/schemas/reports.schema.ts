import { z } from "zod";

export const reportReasonEnum = z.enum([
  "fake_listing",
  "suspicious_price",
  "wrong_information",
  "inappropriate_behavior",
  "scam_attempt",
  "other"
]);

export const reportStatusEnum = z.enum(["open", "reviewed", "actioned", "dismissed"]);

export const createReportSchema = z
  .object({
    listingId: z.string().min(1).optional(),
    reportedUserId: z.string().min(1).optional(),
    reason: reportReasonEnum,
    description: z.string().trim().min(10, "Descreve a situação com mais detalhe.").max(2000)
  })
  .refine((obj) => obj.listingId || obj.reportedUserId, {
    message: "Indica o anúncio ou o utilizador denunciado."
  });

export const listReportsQuerySchema = z.object({
  status: reportStatusEnum.optional()
});

export const reportIdParamSchema = z.object({
  id: z.string().min(1)
});

export const updateReportSchema = z.object({
  status: reportStatusEnum,
  action: z.enum(["suspend_listing", "block_user"]).optional()
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
