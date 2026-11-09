FROM node:26.13.0-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216

RUN apk add --no-cache bash

COPY pipe /
COPY node-pipe/package.json node-pipe/package-lock.json /
COPY node-pipe /

RUN npm install && npm run build

USER node

ENTRYPOINT ["/pipe.sh"]
