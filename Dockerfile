FROM node:20-alpine as build

WORKDIR /app

RUN chown node:node /app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

USER node

EXPOSE 4000
EXPOSE 8080

CMD ["yarn", "start:dev"]
