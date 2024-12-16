# Build stage
FROM node:lts-alpine3.20 AS build

WORKDIR /app

RUN apk update && apk add bash
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

RUN apk update && apk add bash
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/scripts/static-generator.js ./scripts/static-generator.js
COPY package*.json ./
COPY .env ./

RUN npm ci --only=production && npm install -g pm2

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 3001

# Use PM2 to run the server
CMD ["pm2-runtime", "server/index.js"]
