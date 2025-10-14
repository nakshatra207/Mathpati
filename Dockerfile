# ========================
# Stage 1: Build the app
# ========================
FROM node:22-bookworm AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the production-ready app
RUN npm run build

# ========================
# Stage 2: Serve the app
# ========================
FROM debian:13

# Install a lightweight web server (nginx)
RUN apt update && apt install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy built files from builder
COPY --from=builder /app/dist /var/www/html

# Expose default web port
EXPOSE 80

# Start nginx when container runs
CMD ["nginx", "-g", "daemon off;"]

