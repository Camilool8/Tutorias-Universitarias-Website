# Build stage
FROM node:18-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    alsa-lib \
    chromium \
    freetype \
    freetype-dev \
    harfbuzz \
    libdrm \
    libstdc++ \
    libx11 \
    libxdamage \
    libxi \
    libxrandr \
    libxtst \
    nss \
    ttf-freefont \
    udev


COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app


RUN apk add --no-cache \
    alsa-lib \
    chromium \
    freetype \
    freetype-dev \
    harfbuzz \
    libdrm \
    libstdc++ \
    libx11 \
    libxdamage \
    libxi \
    libxrandr \
    libxtst \
    nss \
    ttf-freefont \
    udev

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
