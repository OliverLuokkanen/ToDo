# Frontend Dockerfile (root/Dockerfile) - Node 20 (Debian) + vite preview
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files and install (builder)
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && npm ci --silent \
  && rm -rf /var/lib/apt/lists/*

# Copy source and build
COPY . .
RUN npm run build

# Runtime image for preview
FROM node:20-bullseye-slim
WORKDIR /app

# Copy build artefacts and node_modules (from builder)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 8080
# run vite preview and listen 0.0.0.0
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]