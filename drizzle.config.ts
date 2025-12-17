// @ts-nocheck
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'sqlite',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'db/data.db'
  }
}) as unknown as any
