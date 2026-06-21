export type SqlJsStmt = {
  bind: (params: unknown[]) => void;
  step: () => boolean;
  get: () => unknown[];
  columns: string[];
  free: () => void;
};

export type SqlJsConn = {
  prepare: (sql: string) => SqlJsStmt;
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
};

export type RowObject = Record<string, unknown>;

function extractColumnNamesFromSql(sql: string): string[] {
  try {
    const m = /select\s+([\s\S]+?)\s+from\s+/i.exec(sql);
    if (!m) return [];
    return m[1]
      .split(',')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .map((s) => {
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

export function runPrepared(conn: SqlJsConn, sql: string, params: unknown[] = []): RowObject[] {
  if (!conn || typeof conn.prepare !== 'function') return [];
  const stmt = conn.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    let cols: string[] = stmt.columns || [];
    if (!cols.length) cols = extractColumnNamesFromSql(sql);
    const out: RowObject[] = [];
    while (stmt.step()) {
      const vals = stmt.get();
      const obj: RowObject = {};
      if (cols.length) {
        cols.forEach((c, i) => (obj[c] = vals[i]));
      } else {
        vals.forEach((v, i) => (obj[i] = v));
      }
      out.push(obj);
    }
    return out;
  } finally {
    try {
      stmt.free();
    } catch {
      /* ignore */
    }
  }
}

export function getPreparedOne(
  conn: SqlJsConn,
  sql: string,
  params: unknown[] = []
): RowObject | null {
  if (!conn || typeof conn.prepare !== 'function') return null;
  const stmt = conn.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    if (!stmt.step()) return null;
    const vals = stmt.get();
    if (!vals) return null;
    let cols: string[] = stmt.columns || [];
    if (!cols.length) cols = extractColumnNamesFromSql(sql);
    const obj: RowObject = {};
    if (cols.length) {
      cols.forEach((c, i) => (obj[c] = vals[i]));
    } else {
      vals.forEach((v, i) => (obj[i] = v));
    }
    return obj;
  } finally {
    try {
      stmt.free();
    } catch {
      /* ignore */
    }
  }
}

export function execToRows(conn: SqlJsConn, sql: string): RowObject[] {
  if (!conn || typeof conn.exec !== 'function') return [];
  const res = conn.exec(sql);
  if (!res?.[0]?.values) return [];
  const cols: string[] = res[0].columns || extractColumnNamesFromSql(sql);
  return res[0].values.map((vals: unknown[]) => {
    const obj: RowObject = {};
    if (cols.length) {
      cols.forEach((c, i) => (obj[c] = vals[i]));
    } else {
      vals.forEach((v, i) => (obj[i] = v));
    }
    return obj;
  });
}

export function safeQuery(conn: SqlJsConn, sql: string, params: unknown[] = []): RowObject[] {
  if (!conn) return [];
  try {
    if (params.length) return runPrepared(conn, sql, params);
    return execToRows(conn, sql);
  } catch (err) {
    console.error('sqljs-utils.safeQuery error:', err instanceof Error ? err.message : err);
    return [];
  }
}
