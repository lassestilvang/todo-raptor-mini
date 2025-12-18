#!/usr/bin/env node
/* global require, process, setTimeout, console */
const Module = require('module');
const path = require('path');
const originalLoad = Module._load;
// Intercept require('better-sqlite3') to simulate it's missing
Module._load = function(request, _parent, _isMain) {
  if (request === 'better-sqlite3') throw new Error('Cannot find module better-sqlite3 (simulated)');
  return originalLoad.apply(this, arguments);
};
(async () => {
  try {
    // require the lib which will attempt to init DB and fallback to sql.js
    require(path.join(process.cwd(), 'lib', 'db.js'));
    // wait a bit for async fallback to run
    await new Promise((r) => setTimeout(r, 1000));
    if ((globalThis).__SQL_JS_CONN__) {
      console.log('SQL.js fallback initialized');
      process.exit(0);
    } else {
      console.error('SQL.js fallback NOT initialized');
      process.exit(1);
    }
  } catch (e) {
    console.error('Error while requiring lib/db:', e);
    process.exit(1);
  }
})();