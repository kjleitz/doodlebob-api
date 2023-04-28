FROM node:20-alpine3.17

RUN mkdir /app
WORKDIR /app

COPY package.json /app
COPY .env /app

RUN node -v
RUN npm install
