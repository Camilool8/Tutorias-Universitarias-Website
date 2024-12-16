# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/scripts ./scripts
COPY package*.json ./
COPY .env ./

RUN npm ci --only=production && npm install -g pm2

EXPOSE 3001

# Use PM2 to run the server
CMD ["pm2-runtime", "server/index.js"]