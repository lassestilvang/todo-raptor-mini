declare module 'drizzle-orm/sqlite-core' {
  export function sqliteTable(name: string, columns: any): any;
  export function text(name: string): any;
  export function integer(name: string): any;
  export function boolean(name: string): any;
  export function timestamp(name: string): any;
  export function json(name: string): any;
}

declare module 'drizzle-orm/better-sqlite3' {
  export function drizzle(db: any): any;
}
