// Server-only helpers for working with SQL.js prepared statements and exec results.
// Purpose: centralize the messy `prepare`/`bind`/`step`/`get`/`free` patterns and
// provide a stable, well-tested shape for callers.

export type RowObject = Record<string, any>;

function extractColumnNamesFromSql(sql: string): string[] {
  try {
    const m = /select\s+([\s\S]+?)\s+from\s+/i.exec(sql);
    if (!m) return [];
    return m[1]
      .split(',')
      .map(s => s.replace(/\s+/g, ' ').trim())
      .map(s => {
        // handle `table.col as alias`, `col as alias`, `table.col`, or `col`
        const asMatch = /\s+as\s+(\S+)$/i.exec(s);
        if (asMatch) return asMatch[1].replace(/[`"']/g, '');
        const parts = s.split('.');
        const last = parts[parts.length - 1].trim();
        return last.replace(/[`"']/g, '');
      });
  } catch {
    return [];
  }
}

export function runPrepared(conn: any, sql: string, params: any[] = []): RowObject[] {
  if (!conn || typeof conn.prepare !== 'function') return [];
  const stmt = conn.prepare(sql);
  try {
    if (params && params.length) stmt.bind(params);
    let cols: string[] = stmt.columns || [];
    if (!cols || !cols.length) cols = extractColumnNamesFromSql(sql);
    const out: RowObject[] = [];
    while (typeof stmt.step === 'function' && stmt.step()) {
      const vals = stmt.get();
      const obj: RowObject = {};
      if (cols && cols.length) {
        cols.forEach((c: string, i: number) => (obj[c] = vals[i]));
      } else {
        vals.forEach((v: any, i: number) => (obj[i] = v));
      }
      out.push(obj);
    }
    return out;
  } finally {
    try {
      stmt.free();
    } catch {
      // ignore
    }
  }
}

export function getPreparedOne(conn: any, sql: string, params: any[] = []): RowObject | null {
  if (!conn || typeof conn.prepare !== 'function') return null;
  const stmt = conn.prepare(sql);
  try {
    if (params && params.length) stmt.bind(params);
    // some sql.js builds require step() before get()
    if (typeof stmt.step === 'function' && !stmt.step()) return null;
    const vals = stmt.get();
    if (!vals) return null;
    let cols: string[] = stmt.columns || [];
    if (!cols || !cols.length) cols = extractColumnNamesFromSql(sql);
    const obj: RowObject = {};
    if (cols && cols.length) {
      cols.forEach((c: string, i: number) => (obj[c] = vals[i]));
    } else {
      vals.forEach((v: any, i: number) => (obj[i] = v));
    }
    return obj;
  } finally {
    try {
      stmt.free();
    } catch {
      // ignore
    }
  }
}

export function execToRows(conn: any, sql: string): RowObject[] {
  if (!conn || typeof conn.exec !== 'function') return [];
  const res = conn.exec(sql);
  if (!res || !res[0] || !res[0].values) return [];
  let cols: string[] = res[0].columns || [];
  if (!cols || !cols.length) cols = extractColumnNamesFromSql(sql);
  return res[0].values.map((vals: any[]) => {
    const obj: RowObject = {};
    if (cols && cols.length) {
      cols.forEach((c: string, i: number) => (obj[c] = vals[i]));
    } else {
      vals.forEach((v: any, i: number) => (obj[i] = v));
    }
    return obj;
  });
}

// Convenience: prefer prepared path when params are provided, otherwise exec
export function safeQuery(conn: any, sql: string, params: any[] = []): RowObject[] {
  if (!conn) return [];
  try {
    if (params && params.length) return runPrepared(conn, sql, params);
    return execToRows(conn, sql);
  } catch (err) {
    // don't throw in fallback helpers; callers should handle empty result
    console.error('sqljs-utils.safeQuery error:', (err as any)?.message ?? err);
    return [];
  }
}
