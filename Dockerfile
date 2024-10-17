FROM node:18-alpine as build

WORKDIR /app

RUN chown node:node /app && \
  npm i -g @nestjs/cli && \
  npm i -g pnpm

COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./
RUN pnpm i

COPY --chown=node:node . .
RUN pnpm build
RUN pnpm i --only=production

FROM node:18-alpine as production

WORKDIR /app

RUN mkdir -p /app/public && chown -R node:node /app

COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package.json .
COPY --chown=node:node --from=build /app/.env .

EXPOSE 4000

CMD ["node", "dist/main"]
