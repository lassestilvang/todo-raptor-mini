/* global require, process, console */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

// Simple Node test: create temp migrations, run scripts/init-db.node.js and assert DB file created and contains expected data via sql.js
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-node-db-'));
  const migrationsDir = path.join(tmp, 'migrations');
  fs.mkdirSync(migrationsDir);

  const migration = `CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT);
  INSERT INTO test_table (name) VALUES ('bob');`;
  fs.writeFileSync(path.join(migrationsDir, '001_create_test.sql'), migration);

  const dbPath = path.join(tmp, 'data.db');

  // Run the Node init script with env vars pointing to our temp dirs
  console.log('Running node init script...');
  execSync(
    `NODE_ENV=test MIGRATIONS_DIR=${migrationsDir} DATABASE_URL=${dbPath} node scripts/init-db.node.js`,
    { stdio: 'inherit' }
  );

  assert.ok(fs.existsSync(dbPath), 'DB file should exist');

  // Load file with sql.js
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
  const fileBuf = fs.readFileSync(dbPath);
  const db = new SQL.Database(new Uint8Array(fileBuf));
  const rows = db.exec('SELECT name FROM test_table WHERE id = 1');
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].values[0][0], 'bob');

  // cleanup
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Node init test passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
