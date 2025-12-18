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

            // Apply migrations from db/migrations to the in-memory DB and persist to db/data.db
            try {
              const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
              if (fs.existsSync(migrationsDir)) {
                const files = fs
                  .readdirSync(migrationsDir)
                  .filter((f: string) => f.endsWith('.sql'))
                  .sort();
                for (const file of files) {
                  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                  conn.exec(sql);
                  console.info('Applied', file, '(sql.js in-memory)');
                }
              }

              // Seed minimal sample data so tests relying on seeded rows pass
              try {
                const t = conn.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'");
                const hasTasksTable = (t && t[0] && t[0].values && t[0].values.length) || 0;
                if (hasTasksTable) {
                  const countRes = conn.exec("SELECT COUNT(*) as c FROM tasks");
                  const count = (countRes && countRes[0] && countRes[0].values && countRes[0].values[0] && countRes[0].values[0][0]) || 0;
                  if (!count) {
                    console.info('Seeding sample data into sql.js DB (lib/db fallback)');
                    conn.exec("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('inbox','Inbox','📥','#64748b');");
                    conn.exec("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('work','Work','💼','#7c3aed');");
                    conn.exec("INSERT INTO tasks (id,list_id,title,notes) VALUES ('welcome','inbox','Welcome to Todo Raptor','This is your inbox task. Edit or delete it.');");
                    conn.exec("INSERT INTO tasks (id,list_id,title,notes) VALUES ('plan','work','Plan project','Create milestones and schedule user interviews.');");
                  }
                }
              } catch (e) {
                console.warn('Seeding skipped or failed (sql.js in-memory):', e && e.message ? e.message : e);
              }

              // Persist the in-memory DB to disk so subsequent processes can load it
              try {
                const data = conn.export();
                // ensure directory exists
                if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
                fs.writeFileSync(dbPath, Buffer.from(data));
                console.info('Persisted sql.js database to', dbPath);
              } catch (e) {
                console.warn('Failed to persist sql.js DB to disk:', e && e.message ? e.message : e);
              }
            } catch (e) {
              console.warn('Failed to apply migrations to sql.js in-memory DB:', e && e.message ? e.message : e);
            }
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
