FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ chromium --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .
RUN npm run build

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y python3 make g++ chromium --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 复制运行时需要的源文件
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts

# 数据库持久化目录
VOLUME ["/app/data"]
ENV DB_PATH=/app/data/local.db

EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --spider -q http://localhost:3000/ || exit 1

# 启动脚本：初始化数据库 → 启动服务
CMD ["sh", "-c", "node scripts/init-db.js && node server.js"]
