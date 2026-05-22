import { apiRequest } from "@/lib/api";
import type { Report, ReportListItem, ReportReason, ReportStatus } from "@/types";

const TOKEN_KEY = "uninest.token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

interface DataResponse<T> {
  data: T;
}

export interface CreateReportPayload {
  listingId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  description: string;
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const res = await apiRequest<DataResponse<Report>>("/reports", {
    method: "POST",
    body: payload,
    token: getToken()
  });
  return res.data;
}

export async function listAdminReports(filters?: { status?: ReportStatus }): Promise<ReportListItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  const res = await apiRequest<DataResponse<ReportListItem[]>>(
    `/admin/reports${qs ? `?${qs}` : ""}`,
    { token: getToken() }
  );
  return res.data;
}

export async function fetchReportCounts(): Promise<Record<ReportStatus, number>> {
  const res = await apiRequest<DataResponse<Record<ReportStatus, number>>>(
    "/admin/reports/counts",
    { token: getToken() }
  );
  return res.data;
}

export async function updateReport(
  id: string,
  payload: { status: ReportStatus; action?: "suspend_listing" | "block_user" }
): Promise<Report> {
  const res = await apiRequest<DataResponse<Report>>(`/admin/reports/${id}`, {
    method: "PATCH",
    body: payload,
    token: getToken()
  });
  return res.data;
}
