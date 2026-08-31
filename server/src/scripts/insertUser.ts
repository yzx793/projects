import pg from 'pg';

async function insertUser() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Check if users exist
  const count = await pool.query("SELECT COUNT(*) FROM users");
  console.log('Current user count:', count.rows[0].count);
  
  if (parseInt(count.rows[0].count) === 0) {
    // Insert a user so seed function skips
    await pool.query(
      `INSERT INTO users (username, password, role, avatar, level, exp) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['student', '123456', 'student', 'https://api.dicebear.com/7.x/adventurer/svg?seed=student', 5, 1200]
    );
    console.log('✅ User inserted');
  } else {
    console.log('✅ Users already exist');
  }
  
  await pool.end();
}

insertUser().catch(console.error);
