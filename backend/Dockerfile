FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma (Debian-based)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
