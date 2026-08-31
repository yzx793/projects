import pg from 'pg';

async function check() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const result = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vocabulary' ORDER BY ordinal_position");
  console.log('Vocabulary table columns:');
  console.log(JSON.stringify(result.rows, null, 2));
  
  const count = await pool.query("SELECT COUNT(*) FROM vocabulary");
  console.log('\nVocabulary count:', count.rows[0].count);
  
  await pool.end();
}

check().catch(console.error);
