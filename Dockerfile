# Stage 1: Build Frontend
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV AUTH_BYPASS_DEMO=true

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY src ./src

EXPOSE 5000

CMD ["node", "server/index.js"]
