import type { UserRole } from "./models.js";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
