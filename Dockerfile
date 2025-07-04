# Sử dụng image Node chính thức
FROM node:18-alpine

# Tạo thư mục app và đặt làm thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước (tối ưu cache)
COPY package*.json ./

# Cài đặt dependencies production
RUN npm install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build CSS production (nếu dùng Tailwind)
RUN npx tailwindcss -i ./public/css/tailwind.css -o ./public/css/output.css --minify

# Thiết lập biến môi trường production
ENV NODE_ENV=production

# Expose port (mặc định app.js dùng 3001)
EXPOSE 3001

# Lệnh chạy app
CMD ["node", "app.js"] 