# Stage 1: Build MCP Server
FROM node:20-alpine AS mcp-builder
WORKDIR /app
# Copy root package files and relevant workspace package.json files
COPY package.json package-lock.json ./
COPY ./policy/mcp/package.json ./policy/mcp/
COPY ./policy/backend/package.json ./policy/backend/
# Install ALL dependencies (including dev) needed for build, based on root lock file
RUN npm install --workspace=github-contribution-mcp
RUN npm install --workspace=idobata-policy-editor-backend

WORKDIR /app/policy/mcp
# Copy the mcp source code
COPY ./policy/mcp ./
# Build mcp
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS backend-builder
WORKDIR /app
# Copy installed node_modules from the first stage
COPY --from=mcp-builder /app/node_modules ./node_modules

WORKDIR /app/policy/backend
# Copy the backend source code
COPY ./policy/backend ./
# Build backend
RUN npm run build

# Stage 3: Final Production Image
FROM node:20-alpine AS production
WORKDIR /app

# Copy installed node_modules from the first stage
COPY --from=mcp-builder /app/node_modules ./node_modules

# Copy built artifacts from builders
COPY --from=mcp-builder /app/policy/mcp/dist ./policy/mcp/dist/
COPY --from=backend-builder /app/policy/backend/build ./policy/backend/build/

# Set environment variable for MCP server path within the container
ENV MCP_SERVER_PATH=/app/policy/mcp/dist/main.js
# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the private key into the final image
# IMPORTANT: Ensure the key exists at ./policy/backend/secrets/github-key.pem during build
COPY ./policy/backend/secrets/github-key.pem /app/secrets/github-key.pem

# Copy backend package.json (optional, if needed by CMD or runtime)
COPY ./policy/backend/package.json ./policy/backend/package.json

WORKDIR /app/policy/backend
EXPOSE 3001
CMD ["node", "build/index.js"]


# Development stage removed as hot-reload is disabled