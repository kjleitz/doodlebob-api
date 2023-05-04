FROM node:20-alpine3.17

RUN npm i -g pnpm

RUN mkdir -p /app/
WORKDIR /app/

COPY pnpm-lock.yaml ./
RUN pnpm fetch

ADD . ./

RUN pnpm install --offline
RUN pnpm run build

EXPOSE 4000

CMD [ "pnpm", "start" ]
