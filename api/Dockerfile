FROM node:20

WORKDIR /app

# No need to explicitly install OpenSSL for Prisma on Debian-based image

# Set NODE_ENV for build to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
