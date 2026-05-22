# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build the Vite frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY . .
RUN npm run build

# ---------- Stage 2: build the Fastify backend ----------
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# ---------- Stage 3: production runtime ----------
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=backend-build /app/backend/package*.json /app/backend/
COPY --from=backend-build /app/backend/dist /app/backend/dist
COPY --from=frontend-build /app/dist /app/dist

WORKDIR /app/backend
RUN npm ci --omit=dev --ignore-scripts

ENV NODE_ENV=production
ENV SERVE_FRONTEND=true

EXPOSE 8080

CMD ["node", "dist/server.js"]
