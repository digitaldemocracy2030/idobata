# Stage 1: Build MCP Server
FROM node:20-alpine AS mcp-builder
WORKDIR /app/mcp
# Copy only package files first for better layer caching
COPY ./policy-edit/mcp/package*.json ./
# Install dependencies (consider --only=production for smaller final image if applicable)
RUN npm install
# Copy the rest of the mcp source code
COPY ./policy-edit/mcp ./
# Build mcp
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
# Copy only package files first
COPY ./policy-edit/backend/package*.json ./
# Install dependencies (consider --only=production)
RUN npm install
# Copy the rest of the backend source code
COPY ./policy-edit/backend ./
# Build backend
RUN npm run build

# Stage 3: Final Production Image (if needed, otherwise skip to development)
FROM node:20-alpine AS production
WORKDIR /app

# Copy built artifacts and necessary node_modules from builders
COPY --from=mcp-builder /app/mcp/dist ./mcp/dist/
COPY --from=mcp-builder /app/mcp/node_modules ./mcp/node_modules/
COPY --from=mcp-builder /app/mcp/package.json ./mcp/

COPY --from=backend-builder /app/backend/build ./backend/build/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules/
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Set environment variable for MCP server path within the container
ENV MCP_SERVER_PATH=/app/mcp/dist/main.js
# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the private key into the final image
# IMPORTANT: Ensure the key exists at ./policy-edit/backend/secrets/github-key.pem during build
COPY ./policy-edit/backend/secrets/github-key.pem /app/secrets/github-key.pem

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "build/index.js"]


# Development stage removed as hot-reload is disabled