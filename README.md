# doodlebob-api

[![build, test, lint](https://github.com/kjleitz/doodlebob-api/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/kjleitz/doodlebob-api/actions/workflows/main.yml)
[![CodeQL analysis](https://github.com/kjleitz/doodlebob-api/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/kjleitz/doodlebob-api/actions/workflows/github-code-scanning/codeql)
[![Latest version](https://img.shields.io/github/v/tag/kjleitz/doodlebob-api?label=latest%20version&labelColor=363d44)](https://github.com/kjleitz/doodlebob-api/tags)
[![MIT license](https://img.shields.io/github/license/kjleitz/doodlebob-api?labelColor=363d44&color=blue)](https://github.com/kjleitz/doodlebob-api/blob/main/LICENSE)

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

> **Note:** You can narrow down the case by including the strings from the ancestral `describe` clauses before the string from the target `it` clause:
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

## Migrating from Google Keep

You can export your data from Google Keep and import it into Doodlebob.

### Export your data from Google Keep using Google Takeout

> **Note:** This will not delete your Keep data, as of the time this document was written. Just exports it for download.

This process is described in further detail by Google [here](https://support.google.com/accounts/answer/3024190). If the steps for export change and the following summary is out of date, visit that page to follow the up-to-date instructions.

1. Visit https://takeout.google.com
1. Deselect all checkboxes
1. Select the "Keep" checkbox
1. Continue
1. Choose your preferred file type, frequency, and destination
1. Create export
1. Wait until the export is finished (might take a few minutes or more)
1. Download your export file (or _files,_ if the export exceeded your specified file size and had to be split into multiple files)

### Export your data from Google Keep thoroughly by scraping the Google Keep web page

**Unfortunately,** many people have had issues with Google Takeout (myself included) where the exported collection is missing a HUGE percentage of the data it is supposed to return. This happens across services, including Google Photos. Very frustrating.

In my case, exporting my Keep data only returned the last 2-3 years' worth of notes, despite my note history stretching back eight years (at time of writing). All eight years, however, become present when I open the Google Keep web view (https://keep.google.com) and painstakingly _scroll, load, scroll, load, scroll, load, scroll..._ all the way down to the bottom.

Armed with this knowledge, you can use the following steps to export all your notes, thoroughly, using brute force.

1. Open the Google Keep web view in your browser (i.e., https://keep.google.com)
1. Open up your browser's developer console
    - If you don't know how to do this, generally you can get to it in all major browsers by right clicking the page, selecting "Inspect" or "Inspect element", and then switching to the "Console" tab where you can enter some JavaScript
    - In Safari, you may need to enable developer options before the dev console is available to you
1. If it isn't already un-docked, you should un-dock the console into its own window. For some unholy reason, Keep evacuates most of your pre-loaded notes from the DOM whenever the page is resized. Un-docking the console into its own window will prevent this from happening. If that wasn't clear: **Do not resize the window containing the Google Keep web view while you are following these steps.** You can un-dock the dev console usually by clicking on some three-vertical-dots menu or finding the icon in one of the toolbars along with a few others that represent docking to the left/right/bottom/top of the page. Choose the one that lets you pop it out into its own window.
1. For each command below, you should copy and paste it into the browser console and hit enter, following the instructions between each procedure.
1. **Keep the page open** and the **tab visible.**

First, run this in order to automatically scroll down the page, which will load all your notes:

```js
i = 0; interval = setInterval(() => { i += 1; console.log("scrolling (" + i + ")"); window.scrollTo(0, document.body.scrollHeight) }, 100); stopScrolling = () => { clearInterval(interval) }
```

Go grab a coffee or something. This is going to take a few minutes.

Once the page has reached the bottom (the beginning of your notes), run this:

```js
noteContainers = Array.from(document.querySelectorAll("[data-tooltip-text='Select note'] + div, [data-tooltip-text='Select pinned note'] + div")); noteContainers.length
```

The printed figure is the likely _disgusting_ number of notes you've amassed over the years.

Now, run this:

```js
noteContainerFields = noteContainers.map((container) => { const fieldsContainer = container.querySelector("[data-tooltip-text='Pin note'], [data-tooltip-text='Unpin note']").parentNode; const fieldContainers = Array.from(fieldsContainer.childNodes); const fields = {}; fields.fullText = fieldsContainer.innerText; fields.listItems = []; Array.from(fieldsContainer.querySelectorAll("[aria-label='list item']")).forEach((item) => { fields.listItems.push({ text: item.innerText, checked: item.parentNode.previousSibling.querySelector("[role=checkbox]").getAttribute("aria-checked") === "true" }) }); fields.labels = Array.from(fieldsContainer.querySelectorAll("label")).map((lbl) => lbl.innerText).filter((labelName) => !!labelName); fields.imageUrls = Array.from(fieldsContainer.querySelectorAll("img")).map((img) => img.src).filter((url) => !!url); timestamps = fieldsContainer.querySelector("[data-tooltip-text^=Created]"); fields.createdDesc = timestamps.getAttribute("data-tooltip-text"); fields.editedDesc = timestamps.innerText; fields.texts = fieldContainers.map((fieldContainer) => fieldContainer.innerText); fields.reminders = []; Array.from(fieldsContainer.querySelectorAll("[aria-label^='Reminder set']")).forEach((rem) => { fields.reminders.push(rem.getAttribute("aria-label")); const remText = rem.querySelector("label").innerText; fields.labels = fields.labels.filter((labelName) => labelName !== remText) }); fields.title = fieldContainers[3].childNodes[0].innerText; fields.body = fields.texts[4]; fields.parentEl = fieldsContainer; return fields }); if (noteContainerFields.some(({ texts }) => texts[0] || texts[1] || texts[2])) throw new Error("There shouldn't be anything in the first three divs. Script is out of date. Seek assistance.");
```

TODO: expand notes ending in ellipses to get full body
TODO: make sure all labels are being read (some might be truncated if there are many on one note)
