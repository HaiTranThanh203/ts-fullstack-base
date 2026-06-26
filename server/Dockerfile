# ============================================
# Stage 1: Builder
# Mục đích: Cài dependencies + build TypeScript -> JS
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước (tận dụng Docker layer cache)
COPY package*.json ./

# Cài toàn bộ dependencies (bao gồm devDependencies để build được)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build TypeScript -> JavaScript (output vào /app/dist)
RUN npm run build

# ============================================
# Stage 2: Production Runner
# Mục đích: Image nhỏ gọn, chỉ chứa những gì cần để CHẠY
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Chỉ copy package files để cài production dependencies
COPY package*.json ./

# --omit=dev: KHÔNG cài devDependencies (tiết kiệm ~200MB)
RUN npm ci --omit=dev

# Copy thư mục dist đã build từ Stage 1
COPY --from=builder /app/dist ./dist

# Expose port mà NestJS lắng nghe
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["node", "dist/main"]
