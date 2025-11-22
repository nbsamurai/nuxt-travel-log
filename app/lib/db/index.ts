// import { drizzle } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/tursodatabase/database";

import env from "~/lib/env";

import * as schema from "./schema";

// You can specify any property from the libsql connection options
const db = drizzle({
  connection: {
    // url: env.TURSO_DATABASE_URL,
    // authToken: env.TURSO_AUTH_TOKEN,
    path: env.DB_FILE_NAME,
  },
  casing: "snake_case",
  schema,
});

export default db;
