FROM node:22.16-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN yarn install --production --frozen-lockfile
COPY /src ./
RUN yarn build

FROM node:22.16-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
CMD ["node", "dist/main"]
