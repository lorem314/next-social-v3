import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"
import { relations } from "./relations"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const db = drizzle(process.env.DATABASE_URL!, {
  // schema,
  relations,
  logger: false,
})
