# Production Dockerfile for DyMaly Phone Store (Bong Store System)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Expose container port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
