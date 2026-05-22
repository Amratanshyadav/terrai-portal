# --- STAGE 1: BUILD ---
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# --- STAGE 2: RUNTIME ---
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Install curl in Alpine for Docker health check support
RUN apk add --no-cache curl

COPY package.json ./
RUN npm install --only=production

# Copy compiled code from build stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
