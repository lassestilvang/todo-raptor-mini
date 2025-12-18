#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';

export async function initDb(options?: { dbPath?: string; migrationsDir?: string }) {
  const dbPath =
    options?.dbPath || process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db');
  const migrationsDir = options?.migrationsDir || path.join(process.cwd(), 'db', 'migrations');

  if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const isBun =
    typeof process !== 'undefined' && (process as any).versions && (process as any).versions.bun;

  // Try native better-sqlite3 first (except on Bun)
  if (!isBun) {
    try {
      const BetterSqlite3 = require('better-sqlite3');
      const db = new BetterSqlite3(dbPath);
      console.log('Initializing DB at', dbPath, '(using better-sqlite3)');
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(sql);
        console.log('Applied', file);
      }
      console.log('DB initialized');
      return { used: 'better-sqlite3', dbPath };
    } catch (err: any) {
      console.error('\nCould not use `better-sqlite3`:', err?.message || err);
      console.error('Attempting sql.js fallback...');
    }
  } else {
    console.warn(
      '\nDetected Bun runtime — skipping `better-sqlite3` and attempting sql.js fallback (if installed).'
    );
  }

  // Try sql.js fallback
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs({
      locateFile: (file: string) =>
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
    });
    const conn = new SQL.Database();
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      conn.exec(sql);
      console.log('Applied', file);
    }
    const data = conn.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Initialized DB at', dbPath, '(using sql.js)');
    return { used: 'sql.js', dbPath };
  } catch (e) {
    console.error('\nsql.js fallback is not available or failed to load:', e);
    throw e;
  }
}

// If script is executed directly, run init and exit with appropriate code
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  initDb()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      console.error('\nOptions:');
      console.error(
        "  - run 'bun install' again to allow prebuilt better-sqlite3 binaries to download"
      );
      console.error("  - or run this script with Node: 'node scripts/init-db.ts'");
      process.exit(1);
    });
}
