# doodlebob-api

## Setup

### Install prerequisites

- install Node.js (only tested with 20.x)
- install Docker and Docker Compose

### Install dependencies

```
cd doodlebob-api/
pnpm i
```

### Add environment variables

```
cp .env.environment.example .env.development
```

- Set a new `JWT_SECRET` using a secure RNG
- `PG_HOST` should be `database` if you're running with Docker Compose in development (which is what you should do)
- `TYPEORM_SYNCHRONIZE` should be false in production/staging environments, and it is recommended that you leave this `false` in the development/test environments as well, unless you know what you're doing

For production and staging environments, create `.env.production` and `.env.staging` files, which are loaded by `docker-compose.production.yml` respectively.

```
cp .env.example .env
```

In production/staging, you should also update the `VERSION` variable (used in image tags) for every build; in development this variable is set in `.env`, and it can remain unchanged because... it doesn't really matter.

### Create the database

You'll need to create the database before running the server (which, in development, also runs the migrations and seeding):

```
pnpm docker:db:create
```

#### Drop the database

**NOTE:** In case you're blindly following these instructions, do **NOT** do this part if you're setting up. Just know that if you need to, you can drop the database with:

```
pnpm docker:db:drop
```

...and recreate it with:

```
pnpm docker:db:create
```

### Migrate the database

Migrations are run automatically when starting up the development server, but it doesn't hurt to run them ahead of time:

```
pnpm docker:migration:run
```

### Run the server

Run the development server (essentially just a `docker compose up` with the dev docker-compose file):

```
pnpm docker:dev
```

If for whatever reason you need to tear down the containers/networks/etc., you can run `pnpm run docker:dev:down` which is basically just a `docker compose down` wrapped in a similar fashion to the above.

### Generate migrations

If you make changes to the entities or schema or whatever and you want to generate a migration file automatically to account for the database changes, then (while you have the server running), run:

```
pnpm run docker:migration:generate ShortNameForChangesYouMade
```

...and a new migration file will pop up in `src/orm/migrations/` named something like `1683226149242-ShortNameForChangesYouMade.ts` with the necessary queries.

You'll want to run that migration pretty much immediately afterward:

```
pnpm docker:migration:run
```

### Run the tests

Run the tests like so:

```
pnpm docker:test
```

You don't need to have the server running before you do this.

### Run stuff in the Docker context

While the application is up and running, run:

```
pnpm shell
```

...to open up a shell using the `api` service. From there you can run other pnpm scripts and whatever.

For example:

_(in one shell)_

```
me@lappy $ pnpm docker:dev

> doodlebob-api@1.0.0 docker:dev /home/keegan/Development/doodlebob-api
> docker compose --file docker-compose.yml --file docker-compose.development.yml up --build

[+] Building 0.0s (0/1)
[+] Building 0.1s (2/2)
...
```

_(in another shell)_

```
me@lappy $ pnpm shell
/app # echo hi > /dev/null
/app # pnpm seed:run
```
