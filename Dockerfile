FROM node:20-alpine3.17

RUN npm i -g pnpm

RUN mkdir -p /app/
WORKDIR /app/

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch

ADD . ./

RUN pnpm install -r --frozen-lockfile
RUN pnpm run build

EXPOSE 4000

CMD [ "pnpm", "start" ]


# FROM node:20-alpine3.17

# RUN mkdir -p /app/
# WORKDIR /app/

# COPY ./package.json .

# RUN npm install && npm cache clean --force

# COPY . .

# RUN npm run build

# EXPOSE 4000

# CMD [ "npm", "start" ]
