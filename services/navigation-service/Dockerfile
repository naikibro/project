# Build stage
FROM node:20-alpine as builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
# Remove husky prepare script, install only prod deps
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev

# Install required dev dependencies for TypeScript migrations and GraphQL
RUN npm install --no-save ts-node typescript tsconfig-paths ts-morph

# Rebuild bcrypt for the target platform
RUN npm rebuild bcrypt --build-from-source

# Copy required files for migrations to run in .ts
COPY tsconfig*.json ./
COPY ./src ./src

# Copy dist from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Run either dev or production based on NODE_ENV
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"dev\" ]; then npm run dev; else npm run migration:run && npm run start:prod; fi"]
