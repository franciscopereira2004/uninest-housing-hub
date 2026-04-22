import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export function errorHandler(
  error: FastifyError | HttpError | ZodError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Dados inválidos.",
      errors: error.issues
    });
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      details: error.details
    });
  }

  const maybeStatusCode = (error as FastifyError).statusCode;
  const statusCode = typeof maybeStatusCode === "number" ? maybeStatusCode : 500;

  return reply.status(statusCode).send({
    message: statusCode >= 500 ? "Erro interno do servidor." : error.message
  });
}
