import { getDatabase, getDbType } from './index.js';

export interface QueryResult {
  rows: any[];
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, $3...
function toPgSql(sql: string, params?: any[]): { sql: string; params: any[] } {
  if (!params || params.length === 0) return { sql, params: [] };
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: pgSql, params };
}

export async function query(sql: string, params?: any[]): Promise<QueryResult> {
  const dbType = getDbType();
  
  if (dbType === 'postgres') {
    const { pool } = getDatabase();
    const { sql: pgSql, params: pgParams } = toPgSql(sql, params);
    const result = await pool.query(pgSql, pgParams);
    return { rows: result.rows };
  } else {
    const { db } = getDatabase();
    
    if (params && params.length > 0) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return { rows };
    } else {
      const result = db.exec(sql);
      if (result.length === 0) {
        return { rows: [] };
      }
      const columns = result[0].columns;
      const rows: any[] = [];
      for (const row of result[0].values) {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        rows.push(obj);
      }
      return { rows };
    }
  }
}

export async function run(sql: string, params?: any[]): Promise<void> {
  const dbType = getDbType();
  
  if (dbType === 'postgres') {
    const { pool } = getDatabase();
    const { sql: pgSql, params: pgParams } = toPgSql(sql, params);
    await pool.query(pgSql, pgParams);
  } else {
    const { db } = getDatabase();
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    stmt.step();
    stmt.free();
  }
}

export async function queryOne(sql: string, params?: any[]): Promise<any | null> {
  const result = await query(sql, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function queryAll(sql: string, params?: any[]): Promise<any[]> {
  const result = await query(sql, params);
  return result.rows;
}