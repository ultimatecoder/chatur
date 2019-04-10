FROM node:alpine

RUN apk update

RUN apk add make

WORKDIR /srv/javascript_port_scanner

COPY Makefile Makefile

COPY package-lock.json package-lock.json

COPY package.json package.json

COPY source source

RUN npm install --dev

RUN make build

ENTRYPOINT ["./node_modules/.bin/http-server", "output"]
