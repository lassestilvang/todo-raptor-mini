import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET() {
  const db = getDb();
  // @ts-ignore
  const sqlJsConn = (globalThis as any).__SQL_JS_CONN__ || null;
  let sqlJsAvailable = false;
  try {
    // Try to require sql.js to see if it can be loaded

    require('sql.js');
    sqlJsAvailable = true;
  } catch {
    sqlJsAvailable = false;
  }

  return NextResponse.json({ dbPresent: !!db, sqlJsConn: !!sqlJsConn, sqlJsAvailable });
}
