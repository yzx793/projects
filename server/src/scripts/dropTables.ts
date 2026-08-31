import pg from 'pg';

async function dropTables() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await pool.query('DROP TABLE IF EXISTS subjects, vocabulary, questions, poems, sync_records CASCADE');
  console.log('✅ Tables dropped successfully');
  
  await pool.end();
}

dropTables().catch(console.error);
