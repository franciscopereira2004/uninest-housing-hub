import type { Container } from "@azure/cosmos";
import type { ReportEntity, ReportStatus } from "../types/models.js";

export interface ReportsRepository {
  findAll(filters: { status?: ReportStatus }): Promise<ReportEntity[]>;
  findById(id: string): Promise<ReportEntity | null>;
  upsert(entity: ReportEntity): Promise<ReportEntity>;
}

export class InMemoryReportsRepository implements ReportsRepository {
  private items = new Map<string, ReportEntity>();

  async findAll(filters: { status?: ReportStatus }): Promise<ReportEntity[]> {
    let results = Array.from(this.items.values());
    if (filters.status) results = results.filter((r) => r.status === filters.status);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ReportEntity | null> {
    return this.items.get(id) ?? null;
  }

  async upsert(entity: ReportEntity): Promise<ReportEntity> {
    this.items.set(entity.id, entity);
    return entity;
  }
}

export class CosmosReportsRepository implements ReportsRepository {
  constructor(private readonly container: Container) {}

  async findAll(filters: { status?: ReportStatus }): Promise<ReportEntity[]> {
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: string }> = [];
    if (filters.status) {
      conditions.push("c.status = @status");
      parameters.push({ name: "@status", value: filters.status });
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { resources } = await this.container.items
      .query<ReportEntity>({
        query: `SELECT * FROM c ${where} ORDER BY c.createdAt DESC`,
        parameters
      })
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<ReportEntity | null> {
    const { resources } = await this.container.items
      .query<ReportEntity>({
        query: "SELECT TOP 1 * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async upsert(entity: ReportEntity): Promise<ReportEntity> {
    const { resource } = await this.container.items.upsert<ReportEntity>(entity);
    return (resource as ReportEntity | undefined) ?? entity;
  }
}
