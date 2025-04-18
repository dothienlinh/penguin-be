FROM node:18-alpine as build

WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node package.json ./
RUN yarn 

COPY --chown=node:node . .
RUN yarn
RUN yarn install --production

FROM node:18-alpine as production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package.json .
COPY --chown=node:node --from=build /app/.env .

USER node

EXPOSE 4000

CMD ["node", "dist/main"]
