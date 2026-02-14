FROM node:20-alpine AS base
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

RUN pnpm --filter api prisma generate

EXPOSE 3001

CMD ["pnpm", "--filter", "api", "dev"]
