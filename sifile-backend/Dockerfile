# Gunakan image resmi Node.js versi ringan
FROM node:20-alpine AS builder

# Atur working directory
WORKDIR /app

# Install dependensi yang dibutuhkan oleh library image processing (sharp)
RUN apk add --no-cache python3 make g++ vips-dev

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install seluruh dependensi (termasuk devDependencies untuk build TypeScript)
RUN npm ci

# Copy seluruh source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Install kembali library sistem yang diperlukan oleh sharp di production
RUN apk add --no-cache vips

# Set env ke production
ENV NODE_ENV=production

# Copy package info
COPY package*.json ./

# Install HANYA production dependencies
RUN npm ci --omit=dev

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./dist

# Ekspos port default (Cloud Run menyediakan variabel PORT otomatis, biasanya 8080)
EXPOSE 8080

# Command untuk menjalankan server
CMD ["node", "dist/index.js"]
