import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createReportSchema,
  listReportsQuerySchema,
  reportIdParamSchema,
  updateReportSchema
} from "../schemas/reports.schema.js";
import type { ReportsService } from "../services/reports.service.js";
import { HttpError } from "../utils/http-error.js";

export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const reporterId = this.userId(request);
    const body = createReportSchema.parse(request.body);
    const report = await this.service.create({ ...body, reporterId });
    return reply.status(201).send({ data: report });
  };

  listAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listReportsQuerySchema.parse(request.query);
    const data = await this.service.listAll(query);
    return reply.send({ data });
  };

  counts = async (_request: FastifyRequest, reply: FastifyReply) => {
    const counts = await this.service.getCounts();
    return reply.send({ data: counts });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const actorId = this.userId(request);
    const { id } = reportIdParamSchema.parse(request.params);
    const body = updateReportSchema.parse(request.body);
    const report = await this.service.update(id, actorId, body);
    return reply.send({ data: report });
  };

  private userId(request: FastifyRequest): string {
    const sub = (request.user as { sub?: string } | undefined)?.sub;
    if (!sub) throw new HttpError(401, "Sessão inválida.");
    return sub;
  }
}
