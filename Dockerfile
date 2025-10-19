# ========================
# Stage 1: Build the app
# ========================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy all project files
COPY . .

# Build the production-ready app
RUN npm run build

# ========================
# Stage 2: Serve the app
# ========================
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

# Switch to non-root user
USER nodejs

# Expose default web port
EXPOSE 80

# Start nginx when container runs
CMD ["nginx", "-g", "daemon off;"]

