# Stage 1 - Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile

COPY dist ./dist
COPY .env .
COPY prisma ./prisma
COPY proto ./proto
RUN yarn prisma:generate

# Stage 2 - Starting
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/proto ./proto

EXPOSE ${API_PORT} ${RPC_PORT}

CMD yarn prisma:deploy && yarn start:prod
