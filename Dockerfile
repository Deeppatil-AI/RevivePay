# Stage 1: Build Frontend
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ gcc --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV AUTH_BYPASS_DEMO=true

RUN apt-get update && apt-get install -y python3 make g++ gcc --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY src ./src

EXPOSE 5000

CMD ["node", "server/index.js"]
