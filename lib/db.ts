import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

let _db: any = null;

export function initDb(connection?: string | any) {
  if (typeof connection === 'string' || connection === undefined) {
    const dbPath =
      (connection as string) ||
      process.env.DATABASE_URL ||
      path.join(process.cwd(), 'db', 'data.db');
    let Database: any;
    try {
      // require inside function to avoid loading native bindings at module import time
      Database = require('better-sqlite3');
    } catch (e) {
      throw e;
    }
    const conn = new Database(dbPath);
    _db = drizzle(conn);
  } else {
    // connection is a Database instance
    _db = drizzle(connection as any);
  }
  return _db;
}

// initialize default DB on import. Wrap in try/catch to avoid throwing when native bindings are missing
try {
  initDb();
} catch (_err) {
  // If better-sqlite3 native bindings are missing, we try to provide a runtime fallback for Bun.
  // Tests should still call `initDb(conn)` when needed. This prevents top-level crashes when native bindings cannot be loaded.

  void _err;
  const isBun = typeof process !== 'undefined' && process.versions && process.versions.bun;
  const warnedKey = '__todo_db_init_warning_shown__';
  if (!(globalThis as any)[warnedKey]) {
    console.warn('Warning: default DB initialization skipped (better-sqlite3 not available).');
    if (isBun) {
      console.warn('Detected Bun runtime — better-sqlite3 native bindings are unsupported in Bun.');
      console.warn(
        'Attempting to initialize an SQL.js in-memory connection as a fallback (if installed)...'
      );
      (async () => {
        try {
          // Lazy-require sql.js: if present, create a runtime connection and expose it for services
          // @ts-ignore
          const initSqlJs = require('sql.js');
          // When used in the browser-like / bun environment, locateFile helper should point to node_modules
          const SQL = await initSqlJs({
            locateFile: (file: string) =>
              path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
          });
          const fs = require('fs');
          const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db');
          let conn: any;
          if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath);
            conn = new SQL.Database(new Uint8Array(data));
            console.info('Loaded database from', dbPath, '(using sql.js)');
          } else {
            conn = new SQL.Database();
            console.info('Created in-memory sql.js database (no data.db found)');
          }
          // Expose raw sql.js connection for existing fallbacks in services
          (globalThis as any).__SQL_JS_CONN__ = conn;
          (globalThis as any)[warnedKey] = true;
        } catch (e) {
          console.warn('sql.js fallback not available or failed to initialize:', e);
          console.warn(
            'If you want to run under Bun, install `sql.js` or run the dev server with Node instead (recommended).'
          );
          (globalThis as any)[warnedKey] = true;
        }
      })();
    } else {
      console.warn(
        'If you expect a DB, run scripts/init-db.ts with Node or install a compatible sqlite3 driver for your environment.'
      );
      (globalThis as any)[warnedKey] = true;
    }
  }
}

export const db = () => _db;

export function getDb() {
  return _db;
}

// Allow tests (or other environments) to directly set the underlying drizzle instance
export function setDb(dbInstance: any) {
  _db = dbInstance;
}
