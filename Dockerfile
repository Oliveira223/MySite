FROM node:20-alpine AS base
RUN apk add --no-cache openssl

# Dependências
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o cliente do Prisma (Necessário antes do build)
RUN npx prisma generate

# Define variável de ambiente para o build (ignora verificação de banco)
ENV DATABASE_URL="file:./dev.db"

# Build do Next.js
RUN npm run build

# Runner (Imagem final de produção)
FROM base AS runner
RUN apk -U upgrade && apk add --no-cache openssl util-linux
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copia os arquivos otimizados do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copia a pasta prisma para ter acesso ao schema se necessário
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node server.js"]
