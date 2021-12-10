# syntax = docker/dockerfile:1.0-experimental
FROM node:14.15.4-alpine3.12 AS dev
WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

RUN --mount=type=secret,id=gitlabToken \
    npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' $(cat /run/secrets/gitlabToken) \
    && npm ci \
    && npm config delete '//gitlab.com/api/v4/packages/npm/:_authToken'

COPY . .

CMD npm start

FROM dev AS build

RUN npm run build:prod

FROM nginx:1.19.2-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /usr/src/app/dist/fuse /usr/share/nginx/html
