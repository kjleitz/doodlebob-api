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
cp .env-example .env
```

### Create database

```bash
CREATE_DB=true docker compose up
```

Kill the process with `ctrl`+`c` when the database has been created.

### Run the server

```bash
docker compose up
```
