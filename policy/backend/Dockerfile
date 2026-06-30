# Stage 1: Build Backend Server
FROM node:20-alpine AS backend-builder
WORKDIR /app
# Copy root package files and the backend workspace package.json
COPY package.json package-lock.json ./
COPY ./policy/backend/package.json ./policy/backend/
# Install ALL dependencies (including dev) needed for build, based on root lock file
RUN npm install --workspace=idobata-policy-editor-backend

WORKDIR /app/policy/backend
# Copy the backend source code
COPY ./policy/backend ./
# Build backend
RUN npm run build

# Stage 2: Final Production Image
FROM node:20-alpine AS production
WORKDIR /app

# Copy installed node_modules from the builder stage.
# Root holds hoisted dependencies; the backend workspace keeps its own
# (non-hoisted) dependencies such as express v4 under its local node_modules.
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/policy/backend/node_modules ./policy/backend/node_modules

# Copy built artifacts from the builder
COPY --from=backend-builder /app/policy/backend/build ./policy/backend/build/

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
