# syntax = docker/dockerfile:1.0-experimental
FROM node:16-alpine AS dev
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
  npm ci

COPY . .

CMD npm start

FROM dev AS build

RUN npm run build-prod

FROM nginx:1.23.0-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /usr/src/app/dist/frontend /usr/share/nginx/html
