import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'db/data.db'
  }
})
