FROM node:20-alpine

RUN apk add --no-cache bash

COPY pipe /
COPY node-pipe/package.json node-pipe/package-lock.json /
COPY node-pipe /

RUN npm install && npm run build

ENTRYPOINT ["/pipe.sh"]
