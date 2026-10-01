# Prisma client helper

This folder contains the shared Prisma singleton used by the server application.

## Purpose

The file `prisma.js` creates one Prisma client instance and reuses it across the app so connections are not recreated on every request.

## Usage

```js
const prisma = require('./lib/prisma');

async function getProducts() {
  return prisma.product.findMany();
}
```

## Environment

Make sure the server has a `DATABASE_URL` value in `server/.env` before running Prisma queries.

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

The project is configured for MySQL/MariaDB with the Prisma MariaDB adapter.

## Notes

- This project generates Prisma client code under `server/generated/prisma`.
- The wrapper caches the client on `globalThis` so it is shared during the process lifetime.
- The Prisma-generated client is TypeScript-based, so it should be loaded with a runtime that understands TypeScript output, such as the project’s normal Prisma tooling or a Node TS-aware runner.
