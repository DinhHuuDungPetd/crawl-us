# Base image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài toàn bộ dependencies (bao gồm cả dev)
RUN npm install

# Copy mã nguồn
COPY . .

RUN chmod +x ./node_modules/.bin/tailwindcss

# Build CSS Tailwind (nên làm ở bước build)
RUN npx tailwindcss -i ./public/css/tailwind.css -o ./public/css/output.css --minify

# Sau khi build xong, xóa devDependencies để nhẹ hơn
RUN npm prune --production

# Biến môi trường production
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Chạy ứng dụng
CMD ["node", "app.js"]
