# ---- Giai đoạn 1: Build ----
# Dùng image Node.js 18
FROM node:18-alpine AS builder

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy file package.json và lock file
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code source
COPY . .

# Build ứng dụng (biên dịch từ TypeScript sang JavaScript)
RUN npm run build

# ---- Giai đoạn 2: Production ----
# Dùng một image gọn nhẹ hơn
FROM node:18-alpine

# Chỉ cài đặt dependencies cho production (nhẹ hơn)
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

# Copy các file đã build từ giai đoạn "builder"
COPY --from=builder /usr/src/app/dist ./dist

# Mở port 3000 (port mặc định của NestJS)
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD [ "node", "dist/main" ]