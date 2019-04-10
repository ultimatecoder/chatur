FROM node:alpine

RUN apk update

RUN apk add make

WORKDIR /srv/javascript_port_scanner

COPY package-lock.json package-lock.json

COPY package.json package.json

COPY source/html/index.html index.html

COPY source/assets assets

RUN npm install --dev

ENTRYPOINT ["./node_modules/.bin/http-server"]
