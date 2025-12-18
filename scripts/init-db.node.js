#!/usr/bin/env node
/* global require, process, Buffer, module, console */
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db');
const migrationsDir = process.env.MIGRATIONS_DIR || path.join(process.cwd(), 'db', 'migrations');

if (!fs.existsSync(require('path').dirname(dbPath)))
  fs.mkdirSync(require('path').dirname(dbPath), { recursive: true });

function init() {
  // Try better-sqlite3 first
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
    // Seed sample data if none exist
    try {
      const count = db.prepare("SELECT COUNT(*) as c FROM tasks").get();
      if (!count || count.c === 0) {
        console.log('Seeding sample data into DB');
        db.prepare("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('inbox','Inbox','📥','#64748b')").run();
        db.prepare("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('work','Work','💼','#7c3aed')").run();
        db.prepare("INSERT INTO tasks (id,list_id,title,notes) VALUES ('welcome','inbox','Welcome to Todo Raptor','This is your inbox task. Edit or delete it.')").run();
        db.prepare("INSERT INTO tasks (id,list_id,title,notes) VALUES ('plan','work','Plan project','Create milestones and schedule user interviews.')").run();
      }
    } catch (e) {
      console.warn('Seeding skipped or failed:', e && e.message ? e.message : e);
    }
    console.log('DB initialized');
    return { used: 'better-sqlite3', dbPath };
  } catch (err) {
    console.error('\nCould not use `better-sqlite3`:', err && err.message ? err.message : err);
    console.error('Attempting sql.js fallback...');
  }

  // Try sql.js
  try {
    const initSqlJs = require('sql.js');
    initSqlJs({
      locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
    })
      .then((SQL) => {
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
        // Seed sample data if none exists
        try {
          const t = conn.exec("SELECT COUNT(*) as c FROM tasks");
          const count = (t && t[0] && t[0].values && t[0].values[0] && t[0].values[0][0]) || 0;
          if (!count) {
            console.log('Seeding sample data into DB (sql.js)');
            conn.exec("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('inbox','Inbox','📥','#64748b');");
            conn.exec("INSERT OR IGNORE INTO lists (id,title,emoji,color) VALUES ('work','Work','💼','#7c3aed');");
            conn.exec("INSERT INTO tasks (id,list_id,title,notes) VALUES ('welcome','inbox','Welcome to Todo Raptor','This is your inbox task. Edit or delete it.');");
            conn.exec("INSERT INTO tasks (id,list_id,title,notes) VALUES ('plan','work','Plan project','Create milestones and schedule user interviews.');");
          }
        } catch (e) {
          console.warn('Seeding skipped or failed (sql.js):', e && e.message ? e.message : e);
        }
        const data = conn.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
        console.log('Initialized DB at', dbPath, '(using sql.js)');
        process.exit(0);
      })
      .catch((e) => {
        console.error('\nFailed to initialize DB with sql.js fallback:', e);
        process.exit(1);
      });
  } catch (e) {
    console.error('\nsql.js fallback is not available or failed to load:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  init();
}

module.exports = { init };
