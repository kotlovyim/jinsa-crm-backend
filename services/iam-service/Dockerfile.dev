FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json nest-cli.json tsconfig*.json ./

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
