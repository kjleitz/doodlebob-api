# doodlebob-api

![build, test, lint](https://github.com/kjleitz/doodlebob-api/actions/workflows/main.yml/badge.svg?branch=main)

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

## Common tasks

### Run the server

Run the development server (essentially just a `docker compose up` with the dev docker-compose file):

```
pnpm docker:dev
```

If for whatever reason you need to tear down the containers/networks/etc., you can run `pnpm run docker:dev:down` which is basically just a `docker compose down` wrapped in a similar fashion to the above.

### Run the tests

Run the tests like so:

```
pnpm docker:test
```

You don't need to have the server running before you do this.

#### Run the tests interactively

Open a shell in the test context:

```
pnpm docker:test:shell
```

Then run tests and whatever from within the shell:

```
pnpm test
```

This has the benefit of preserving color in the test output.

The shell is also useful because it's easier to do more targeted tasks directly, like running specific test files:

```
pnpm exec mocha src/server/controllers/users.test.ts
```

...or running individual tests within a file, like this:


```
pnpm exec mocha src/server/controllers/users.test.ts --grep "returns your user info"
```

...or, more simply, if the "it" clause is actually unique (or you don't care about intruding cases):

```
pnpm run test --grep "returns your user info"
```

> **NB:** You can narrow down the case by including the strings from the ancestral `describe` clauses before the string from the target `it` clause:
>
> ```
> pnpm run test --grep "Users controller Show returns your user info"
> ```

### Run stuff in the Docker context

While the application is up and running, run:

```
pnpm docker:shell
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

### Open the database console

To open a connection to the database with `psql`, run:

```
pnpm docker:db:shell
```

## Development/making changes

### Adding a package (`pnpm i <whatever>`)

If you install a new package, you'll need to do a docker compose down and then back up again, or the `node_modules` volume will be stale and you'll have weird errors telling you you're missing modules despite your editor skipping happily along:

```
pnpm docker:dev:down
pnpm docker:dev
```

### Changing an entity (or: How to generate migrations)

If you make changes to the entities or schema or whatever, you'll want to generate a migration file automatically to account for the database changes. While you have the server running with `pnpm docker:dev`, run the following (swap out `ShortNameForChangesYouMade` with a name that describes the changes this new migration will represent):

```
pnpm docker:migration:generate ShortNameForChangesYouMade
```

...and a new migration file will pop up in `src/orm/migrations/` named something like `1683226149242-ShortNameForChangesYouMade.ts` with the necessary queries.

You'll now _either_ want to...

1. ...run that migration pretty much immediately afterward:

```
pnpm docker:migration:run
```

2. ...or just restart the dev server, which will run the migrations and seeds for you:

```
^C
pnpm docker:dev
```

#### Running tests locally while migrations are pending

If you're currently in a `pnpm docker:test:shell` shell doing specific tests, or are going to be, and there have been database changes and new migration files, those migrations won't be run until you either run them explicitly or let something else do it for you. The easiest way to run migrations in the `NODE_ENV=test` environment is to run:

```
pnpm docker:test
```

...which will spin it all up, run the migrations, and run the tests, too.

If you're impatient, though, and/or conveniently in a `pnpm docker:test:shell` shell already, you can try just running the migrations explicitly:

```
me@lappy $ pnpm shell
/app # pnpm migration:run
```

...which should do the trick.
