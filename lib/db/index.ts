import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | null = null;

function getPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://storycraft:storycraft123@localhost:5432/storycraft",
  });
}

export const db: NodePgDatabase<typeof schema> = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    if (!_db) {
      const pool = getPool();
      _db = drizzle(pool, { schema });
    }
    const value = Reflect.get(_db, prop, receiver);
    if (typeof value === "function") {
      return value.bind(_db);
    }
    return value;
  },
});
