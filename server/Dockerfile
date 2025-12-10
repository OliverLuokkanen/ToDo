# Server Dockerfile (server/Dockerfile) - Debian-based to compile native modules correctly
FROM node:18-bullseye-slim

WORKDIR /app

ENV NODE_ENV=production

# Copy package files first and install production deps inside container
COPY package*.json ./

# Install temporary build tools, install deps, then remove build tools
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential ca-certificates \
  && npm ci --omit=dev --silent \
  && apt-get purge -y --auto-remove python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy application source (note: server/node_modules is in .dockerignore so not copied)
COPY . .

EXPOSE 3001
CMD ["node", "index.js"]