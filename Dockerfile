FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY --from=build /app/dist ./dist
RUN mkdir /data && chown node:node /data
ENV DATABASE_PATH=/data/isitdown.db
USER node
EXPOSE 3000
ENTRYPOINT ["node", "dist/monitor.js"]