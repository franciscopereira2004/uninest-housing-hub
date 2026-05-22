import { randomUUID } from "node:crypto";
import type { ListingsRepository } from "../repositories/listings.repository.js";
import type { ReportsRepository } from "../repositories/reports.repository.js";
import type { UsersRepository } from "../repositories/users.repository.js";
import type { ReportEntity, ReportReason, ReportStatus, UserPublic } from "../types/models.js";
import { HttpError } from "../utils/http-error.js";
import { toPublicUser } from "../utils/token.js";
import type { AdminListingsService } from "./admin-listings.service.js";
import type { UsersService } from "./users.service.js";

interface CreateInput {
  reporterId: string;
  listingId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  description: string;
}

export interface ReportListItem {
  report: ReportEntity;
  reporter: UserPublic | null;
  listing: {
    id: string;
    title: string;
    city: string;
    status: string;
    landlordId: string;
  } | null;
  reportedUser: UserPublic | null;
}

export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly listingsRepository: ListingsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly adminListingsService: AdminListingsService,
    private readonly usersService: UsersService
  ) {}

  async create(input: CreateInput): Promise<ReportEntity> {
    const reporter = await this.usersRepository.findById(input.reporterId);
    if (!reporter) throw new HttpError(401, "Sessão inválida.");
    if (reporter.isBlocked) throw new HttpError(403, "Conta bloqueada.");

    if (input.listingId) {
      const listing = await this.listingsRepository.findById(input.listingId);
      if (!listing) throw new HttpError(404, "Anúncio não encontrado.");
      if (listing.landlordId === input.reporterId) {
        throw new HttpError(400, "Não podes denunciar o teu próprio anúncio.");
      }
    }
    if (input.reportedUserId) {
      if (input.reportedUserId === input.reporterId) {
        throw new HttpError(400, "Não podes denunciar-te a ti próprio.");
      }
      const target = await this.usersRepository.findById(input.reportedUserId);
      if (!target) throw new HttpError(404, "Utilizador não encontrado.");
    }

    const now = new Date().toISOString();
    return this.reportsRepository.upsert({
      id: `r-${randomUUID()}`,
      reporterId: input.reporterId,
      listingId: input.listingId,
      reportedUserId: input.reportedUserId,
      reason: input.reason,
      description: input.description,
      status: "open",
      createdAt: now,
      updatedAt: now
    });
  }

  async listAll(filters: { status?: ReportStatus }): Promise<ReportListItem[]> {
    const reports = await this.reportsRepository.findAll(filters);
    if (reports.length === 0) return [];

    const listingIds = Array.from(
      new Set(reports.map((r) => r.listingId).filter((v): v is string => Boolean(v)))
    );
    const userIds = Array.from(
      new Set([
        ...reports.map((r) => r.reporterId),
        ...reports.map((r) => r.reportedUserId).filter((v): v is string => Boolean(v))
      ])
    );

    const [listings, users] = await Promise.all([
      this.listingsRepository.findByIds(listingIds),
      Promise.all(userIds.map((id) => this.usersRepository.findById(id)))
    ]);
    const listingsById = new Map(listings.map((l) => [l.id, l] as const));
    const usersById = new Map(
      users.filter((u) => u !== null).map((u) => [u!.id, u!] as const)
    );

    return reports.map((report) => {
      const listing = report.listingId ? listingsById.get(report.listingId) ?? null : null;
      return {
        report,
        reporter: usersById.has(report.reporterId)
          ? toPublicUser(usersById.get(report.reporterId)!)
          : null,
        listing: listing
          ? {
              id: listing.id,
              title: listing.title,
              city: listing.city,
              status: listing.status,
              landlordId: listing.landlordId
            }
          : null,
        reportedUser:
          report.reportedUserId && usersById.has(report.reportedUserId)
            ? toPublicUser(usersById.get(report.reportedUserId)!)
            : null
      };
    });
  }

  async getCounts(): Promise<Record<ReportStatus, number>> {
    const reports = await this.reportsRepository.findAll({});
    const counts: Record<ReportStatus, number> = {
      open: 0,
      reviewed: 0,
      actioned: 0,
      dismissed: 0
    };
    for (const r of reports) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  }

  async update(
    id: string,
    actorId: string,
    input: { status: ReportStatus; action?: "suspend_listing" | "block_user" }
  ): Promise<ReportEntity> {
    const report = await this.reportsRepository.findById(id);
    if (!report) throw new HttpError(404, "Denúncia não encontrada.");

    if (input.action === "suspend_listing") {
      if (!report.listingId) {
        throw new HttpError(400, "Esta denúncia não tem anúncio associado.");
      }
      await this.adminListingsService.suspend(report.listingId);
    }
    if (input.action === "block_user") {
      let userId: string | undefined = report.reportedUserId;
      if (!userId && report.listingId) {
        const listing = await this.listingsRepository.findById(report.listingId);
        userId = listing?.landlordId;
      }
      if (!userId) {
        throw new HttpError(400, "Não foi possível identificar o utilizador a bloquear.");
      }
      await this.usersService.setBlocked(userId, true, actorId);
    }

    return this.reportsRepository.upsert({
      ...report,
      status: input.status,
      updatedAt: new Date().toISOString()
    });
  }
}
