#!/usr/bin/env bun
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'db', 'data.db')
const migrationsDir = path.join(process.cwd(), 'db', 'migrations')

if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
console.log('Initializing DB at', dbPath)

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
for (const file of files) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  db.exec(sql)
  console.log('Applied', file)
}

console.log('DB initialized')
