FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5

RUN apk add --no-cache bash

COPY pipe /
COPY node-pipe/package.json node-pipe/package-lock.json /
COPY node-pipe /

RUN npm install && npm run build

USER node

ENTRYPOINT ["/pipe.sh"]
