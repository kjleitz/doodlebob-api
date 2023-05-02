# doodlebob-api

## Setup

### Install prerequisites

- install Node.js (only tested with 20.x)
- install Docker and Docker Compose

### Install dependencies

```bash
cd doodlebob-api/
pnpm i
```

### Add environment variables

```bash
cp .env.example .env
```

- Set a new `JWT_SECRET` using a secure RNG
- `PG_HOST` should be `database` if you're running with Docker Compose in development (which is what you should do)
- `TYPEORM_SYNCHRONIZE` should be false in production/staging environments

### Create database

```bash
pnpm run docker:db:create
```

#### Drop the database

In case you're blindly following these instructions, do **NOT** do this part if you're setting up. Just know that if you need to, you can drop the database with:

```bash
pnpm run docker:db:drop
```

...and recreate it with:

```bash
pnpm run docker:db:create
```

### Run the server

```bash
pnpm run docker:dev
```

### Run stuff (migrations, seeds, scripts) in the docker context

While the application is up and running, run:

```bash
pnpm run shell
```

...to open up a shell using the `api` service. From there you can run other pnpm scripts and whatever.

For example:

_(in one shell)_

```pnpm
me@lappy $ pnpm run docker:dev

> doodlebob-api@1.0.0 docker:dev /home/keegan/Development/doodlebob-api
> docker compose --file docker-compose.yml --file docker-compose.development.yml up --build

[+] Building 0.0s (0/1)
[+] Building 0.1s (2/2)
...
```

_(in another shell)_

```
me@lappy $ pnpm run shell
/app # pnpm run seed:run
```
