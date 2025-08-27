# IAM Service (NestJS) - production Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./

RUN npm ci && npm cache clean --force

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json nest-cli.json tsconfig*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
