# -------------------------
# 1) Builder stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install all dependencies including dev
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Build TypeScript to /dist
RUN npm run build

# Remove any package.json in dist that might have "type": "module"
RUN rm -f /app/dist/package.json

# -------------------------
# 2) Production stage
# -------------------------
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user FIRST
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

# Only copy production package.json for smaller image
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check (CommonJS version)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

CMD ["node", "dist/server.js"]