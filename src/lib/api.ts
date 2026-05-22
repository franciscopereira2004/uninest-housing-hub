const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  token?: string;
}

export interface ApiValidationIssue {
  path?: (string | number)[];
  message?: string;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: ApiValidationIssue[];

  constructor(message: string, status: number, errors?: ApiValidationIssue[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  /**
   * Returns a human-readable summary of the error, including field-level Zod issues if present.
   */
  detail(): string {
    if (!this.errors || this.errors.length === 0) return this.message;
    const issues = this.errors
      .map((issue) => {
        const path = (issue.path ?? []).filter((p) => typeof p === "string" || typeof p === "number").join(".");
        const label = path ? `${path}: ` : "";
        return `${label}${issue.message ?? "inválido"}`;
      })
      .filter(Boolean);
    return issues.length > 0 ? `${this.message} (${issues.join("; ")})` : this.message;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: hasBody ? JSON.stringify(options.body) : undefined
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: ApiValidationIssue[];
  } & T;

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? "Erro ao comunicar com o servidor.",
      response.status,
      payload.errors
    );
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
