/**
 * 数据同步脚本：从 SQLite 迁移到 PostgreSQL
 */
import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase } from 'sql.js';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_PATH = path.join(__dirname, '../../database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function sync() {
  console.log('🔄 Starting data sync from SQLite to PostgreSQL...\n');

  // Connect to SQLite using sql.js
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(SQLITE_PATH);
  const sqlite = new SQL.Database(fileBuffer);
  console.log('✅ Connected to SQLite');

  // Connect to PostgreSQL
  const pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL\n');

    // Create tables in PostgreSQL
    console.log('📋 Creating tables in PostgreSQL...');
    await createTables(pgPool);
    console.log('✅ Tables created\n');

    // Sync each table
    const tables = [
      { name: 'subjects', sqlite: 'SELECT * FROM subjects', pg: 'subjects' },
      { name: 'vocabulary', sqlite: 'SELECT * FROM vocabulary', pg: 'vocabulary' },
      { name: 'questions', sqlite: 'SELECT * FROM questions', pg: 'questions' },
      { name: 'poems', sqlite: 'SELECT * FROM poems', pg: 'poems' },
      { name: 'sync_records', sqlite: 'SELECT * FROM sync_records', pg: 'sync_records' },
    ];

    for (const table of tables) {
      await syncTable(sqlite, pgPool, table);
    }

    console.log('\n🎉 Data sync completed successfully!');

    // Print summary
    const summary = await pgPool.query(`
      SELECT 
        (SELECT COUNT(*) FROM subjects) as subjects,
        (SELECT COUNT(*) FROM vocabulary) as vocabulary,
        (SELECT COUNT(*) FROM questions) as questions,
        (SELECT COUNT(*) FROM poems) as poems,
        (SELECT COUNT(*) FROM sync_records) as sync_records
    `);
    console.log('\n📊 PostgreSQL data summary:');
    console.log(JSON.stringify(summary.rows[0], null, 2));

  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    sqlite.close();
    await pgPool.end();
  }
}

async function createTables(pool: pg.Pool) {
  // Subjects table - matches SQLite schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vocabulary table - matches SQLite schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id SERIAL PRIMARY KEY,
      word VARCHAR(100) NOT NULL,
      meaning TEXT NOT NULL,
      grade VARCHAR(50) DEFAULT 'middle',
      difficulty VARCHAR(50) DEFAULT 'medium',
      phonetic VARCHAR(100),
      example TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Questions table - matches SQLite schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(50) NOT NULL,
      grade VARCHAR(50) NOT NULL,
      semester VARCHAR(20),
      question_type VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      analysis TEXT,
      knowledge_points TEXT,
      difficulty INTEGER DEFAULT 1,
      source VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Poems table - matches SQLite schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS poems (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(100) NOT NULL,
      dynasty VARCHAR(50),
      content TEXT NOT NULL,
      translation TEXT,
      appreciation TEXT,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sync records table - matches SQLite schema
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_records (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(50) NOT NULL,
      grade VARCHAR(50),
      edition VARCHAR(100),
      sync_type VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      total_count INTEGER DEFAULT 0,
      synced_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function syncTable(sqlite: SqlJsDatabase, pgPool: pg.Pool, table: { name: string; sqlite: string; pg: string }) {
  console.log(`📦 Syncing ${table.name}...`);

  let result;
  try {
    result = sqlite.exec(table.sqlite);
  } catch (e) {
    console.log(`   ⏭️  Skipped (table not found or empty)`);
    return;
  }

  if (result.length === 0 || result[0].values.length === 0) {
    console.log(`   ⏭️  Skipped (no data)`);
    return;
  }

  const columns = result[0].columns;
  const rows = result[0].values.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });

  console.log(`   Found ${rows.length} records in SQLite`);

  // Clear existing data
  await pgPool.query(`DELETE FROM ${table.pg}`);

  // Insert data in batches
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values: any[] = [];
    const placeholders: string[] = [];

    batch.forEach((row, idx) => {
      const rowValues: string[] = [];
      const cols = Object.keys(row);

      cols.forEach((col, colIdx) => {
        const paramIdx = idx * cols.length + colIdx + 1;
        rowValues.push(`$${paramIdx}`);

        let value = row[col];
        // Handle JSON fields
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        values.push(value);
      });

      placeholders.push(`(${rowValues.join(', ')})`);
    });

    const cols = Object.keys(batch[0]);
    const sql = `INSERT INTO ${table.pg} (${cols.join(', ')}) VALUES ${placeholders.join(', ')}`;

    await pgPool.query(sql, values);
    inserted += batch.length;
    process.stdout.write(`\r   Progress: ${inserted}/${rows.length}`);
  }

  console.log(`\n   ✅ ${table.name}: ${inserted} records synced`);
}

sync().catch(console.error);
