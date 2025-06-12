# Dockerfile for a Next.js application

# --- Stage 1: Build ---
# Use an official Node.js image as a builder.
FROM node:18-alpine AS builder

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and lock files.
COPY package*.json ./

# Install project dependencies.
# We also need to install prisma to generate the client.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Generate Prisma Client. This is crucial for your database operations to work.
RUN npx prisma generate

# Build the Next.js application for production.
RUN npm run build

# --- Stage 2: Production ---
# Use a minimal Node.js image for the final, small container.
FROM node:18-alpine

# Set the working directory.
WORKDIR /app

# Copy the optimized, standalone Next.js server from the builder stage.
COPY --from=builder /app/.next/standalone ./

# Copy the public assets (like your logo).
COPY --from=builder /app/public ./public

# Copy the static assets built by Next.js.
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app will run on.
EXPOSE 3000

# Set the command to start the application.
CMD ["node", "server.js"] 