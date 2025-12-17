import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'

let _db: any = null

export function initDb(connection?: string | Database) {
  if (typeof connection === 'string' || connection === undefined) {
    const dbPath = (connection as string) || process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db')
    const conn = new Database(dbPath)
    _db = drizzle(conn)
  } else {
    // connection is a Database instance
    _db = drizzle(connection as Database)
  }
  return _db
}

// initialize default DB on import
initDb()

export const db = () => _db

export function getDb() {
  return _db
}
