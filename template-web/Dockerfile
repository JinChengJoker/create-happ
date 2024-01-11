FROM node:16.20.1 as builder

ARG BUILD_COMMAND=build

RUN mkdir -p /app
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn config set registry https://registry.npmmirror.com
RUN yarn
COPY . /app
RUN yarn $BUILD_COMMAND

FROM nginx:stable

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html/apps/{{template}}
COPY default.conf /etc/nginx/conf.d/default.conf
