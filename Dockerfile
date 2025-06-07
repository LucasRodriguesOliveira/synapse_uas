FROM node:22.16-alpine AS builder
WORKDIR /app

COPY package.json ./

RUN yarn install --production --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn global add @nestjs/cli
RUN yarn build

FROM node:22-slim
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

# required by prisma
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
