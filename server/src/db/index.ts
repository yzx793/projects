import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

let sqliteDb: any = null;
let pgPool: any = null;

export type DbType = 'sqlite' | 'postgres';

let initializedDbType: DbType = 'sqlite';

export function getDbType(): DbType {
  return initializedDbType;
}

export async function initDatabase() {
  const envDbType = process.env.DATABASE_URL ? 'postgres' : 'sqlite';
  
  if (envDbType === 'postgres') {
    try {
      await initPostgres();
      initializedDbType = 'postgres';
      console.log('✅ Using PostgreSQL database');
    } catch (error) {
      console.warn('⚠️  PostgreSQL connection failed, falling back to SQLite');
      console.warn(`   Error: ${error.message}`);
      await initSQLite();
      initializedDbType = 'sqlite';
    }
  } else {
    await initSQLite();
    initializedDbType = 'sqlite';
  }
}

async function initSQLite() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqliteDb = new SQL.Database(fileBuffer);
    console.log('✅ SQLite database loaded from file');
  } else {
    sqliteDb = new SQL.Database();
    console.log('✅ SQLite database created');
  }
  
  createSQLiteTables();
  seedInitialData();
  
  setInterval(saveSQLiteDatabase, 5000);
  
  return sqliteDb;
}

async function initPostgres() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for PostgreSQL');
  }
  
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  console.log('✅ PostgreSQL connected');
  
  await createPostgresTables();
  await seedPostgresData();
  
  return pgPool;
}

function createSQLiteTables() {
  const tables = [    `CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      grade TEXT,
      avatar TEXT,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS learning_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      stat_date DATE NOT NULL,
      study_duration INTEGER DEFAULT 0,
      questions_answered INTEGER DEFAULT 0,
      correct_rate REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      badge_id TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_icon TEXT,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      task_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS wrong_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT NOT NULL,
      subject_name TEXT,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      user_answer TEXT,
      correct_answer TEXT,
      analysis TEXT,
      knowledge_point TEXT,
      difficulty TEXT DEFAULT 'medium',
      image_url TEXT,
      error_type TEXT,
      tags TEXT,
      notes TEXT,
      solved INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 1,
      review_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question_id INTEGER,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      subject_name TEXT,
      type TEXT,
      difficulty INTEGER,
      content TEXT,
      answer TEXT,
      analysis TEXT,
      knowledge_points TEXT,
      source TEXT,
      note TEXT,
      favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      grade TEXT DEFAULT 'middle',
      difficulty TEXT DEFAULT 'medium',
      phonetic TEXT,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vocab_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      word TEXT NOT NULL,
      mastered INTEGER DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      last_review DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS poems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      dynasty TEXT,
      content TEXT NOT NULL,
      translation TEXT,
      appreciation TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS math_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      analysis TEXT,
      difficulty TEXT DEFAULT 'medium',
      grade TEXT,
      knowledge_point TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT,
      grade TEXT,
      cover_image TEXT,
      lesson_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS practice_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question_id INTEGER,
      user_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      practice_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];
  
  for (const sql of tables) {
    sqliteDb.run(sql);
  }
  
  // Migration: add role column to users if it doesn't exist
  try {
    sqliteDb.run(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Migration: add grade column to users if it doesn't exist
  try {
    sqliteDb.run(`ALTER TABLE users ADD COLUMN grade TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Migration: set default grade for existing students who have NULL grade (SQLite)
  try {
    sqliteDb.run(`UPDATE users SET grade = '5' WHERE role = 'student' AND grade IS NULL`);
  } catch (e) {
    // Ignore
  }
  
  console.log('✅ SQLite tables created');
}

async function createPostgresTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      grade TEXT,
      avatar TEXT,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS learning_stats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      stat_date DATE NOT NULL,
      study_duration INTEGER DEFAULT 0,
      questions_answered INTEGER DEFAULT 0,
      correct_rate REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      badge_id TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_icon TEXT,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      task_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS wrong_questions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      subject TEXT NOT NULL,
      subject_name TEXT,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      user_answer TEXT,
      correct_answer TEXT,
      analysis TEXT,
      knowledge_point TEXT,
      difficulty TEXT DEFAULT 'medium',
      image_url TEXT,
      error_type TEXT,
      tags TEXT,
      notes TEXT,
      solved INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 1,
      review_status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      question_id INTEGER,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      subject_name TEXT,
      type TEXT,
      difficulty INTEGER,
      content TEXT,
      answer TEXT,
      analysis TEXT,
      knowledge_points TEXT,
      source TEXT,
      note TEXT,
      favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vocabulary (
      id SERIAL PRIMARY KEY,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      grade TEXT DEFAULT 'middle',
      difficulty TEXT DEFAULT 'medium',
      phonetic TEXT,
      example TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vocab_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      word TEXT NOT NULL,
      mastered INTEGER DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      last_review TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS poems (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      dynasty TEXT,
      content TEXT NOT NULL,
      translation TEXT,
      appreciation TEXT,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS math_questions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      analysis TEXT,
      difficulty TEXT DEFAULT 'medium',
      grade TEXT,
      knowledge_point TEXT,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT,
      grade TEXT,
      cover_image TEXT,
      lesson_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS practice_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      question_id INTEGER,
      user_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      practice_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];
  
  for (const sql of tables) {
    await pgPool.query(sql);
  }
  
  // Migration: add grade column to users if it doesn't exist (PostgreSQL)
  try {
    await pgPool.query(`ALTER TABLE users ADD COLUMN grade TEXT`);
  } catch (e: any) {
    if (!e.message.includes('already exists') && !e.message.includes('duplicate column')) {
      console.warn('⚠️  PostgreSQL grade column migration warning:', e.message);
    }
  }

  // Migration: set default grade for existing students who have NULL grade
  try {
    await pgPool.query(`UPDATE users SET grade = '5' WHERE role = 'student' AND grade IS NULL`);
  } catch (e: any) {
    console.warn('⚠️  PostgreSQL grade default migration warning:', e.message);
  }
  
  console.log('✅ PostgreSQL tables created');
}

function seedInitialData() {
  const userCount = sqliteDb.exec('SELECT COUNT(*) as count FROM users');
  if (userCount.length > 0 && userCount[0].values[0][0] > 0) {
    console.log('✅ SQLite already has data, skipping seed');
    return;
  }
  
  console.log('🌱 Seeding SQLite initial data...');
  
  seedSubjects(sqliteDb);
  sqliteDb.run(`INSERT INTO users (username, password, role, grade, avatar, level, exp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['student', '123456', 'student', '5', 'https://api.dicebear.com/7.x/adventurer/svg?seed=student', 5, 1200]);
  sqliteDb.run(`INSERT INTO users (username, password, role, grade, avatar, level, exp) VALUES (?, ?, ?, ?, ?, ?)`,
    ['teacher', '123456', 'teacher', null, 'https://api.dicebear.com/7.x/adventurer/svg?seed=teacher', 10, 3000]);
  
  seedVocabulary(sqliteDb);
  seedPoems(sqliteDb);
  seedMathQuestions(sqliteDb);
  seedCourses(sqliteDb);
  seedTasks(sqliteDb);
  
  saveSQLiteDatabase();
  console.log('✅ SQLite initial data seeded');
}

async function seedPostgresData() {
  const result = await pgPool.query('SELECT COUNT(*) FROM users');
  if (parseInt(result.rows[0].count) > 0) {
    console.log('✅ PostgreSQL already has data, skipping seed');
    return;
  }
  
  console.log('🌱 Seeding PostgreSQL initial data...');
  
  await pgPool.query(
    `INSERT INTO users (username, password, role, grade, avatar, level, exp) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    ['student', '123456', 'student', '5', 'https://api.dicebear.com/7.x/adventurer/svg?seed=student', 5, 1200]
  );
  await pgPool.query(
    `INSERT INTO users (username, password, role, grade, avatar, level, exp) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    ['teacher', '123456', 'teacher', null, 'https://api.dicebear.com/7.x/adventurer/svg?seed=teacher', 10, 3000]
  );
  
  await seedSubjectsPg();
  await seedVocabularyPg();
  await seedPoemsPg();
  await seedMathQuestionsPg();
  await seedCoursesPg();
  await seedTasksPg();
  
  console.log('✅ PostgreSQL initial data seeded');
}

function seedSubjects(db: any) {
  const subjectsData = [
    ['chinese', '语文', 'book', '#E17055', 1],
    ['math', '数学', 'calculator', '#6C63FF', 2],
    ['english', '英语', 'globe', '#00B894', 3],
    ['physics', '物理', 'atom', '#0984E3', 4],
    ['chemistry', '化学', 'flask', '#FDCB6E', 5],
  ];
  
  for (const subject of subjectsData) {
    db.run(`INSERT OR IGNORE INTO subjects (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)`, subject);
  }
}

async function seedSubjectsPg() {
  const subjectsData = [
    ['chinese', '语文', 'book', '#E17055', 1],
    ['math', '数学', 'calculator', '#6C63FF', 2],
    ['english', '英语', 'globe', '#00B894', 3],
    ['physics', '物理', 'atom', '#0984E3', 4],
    ['chemistry', '化学', 'flask', '#FDCB6E', 5],
  ];
  
  for (const subject of subjectsData) {
    await pgPool.query(
      `INSERT INTO subjects (id, name, icon, color, sort_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
      subject
    );
  }
}

function seedVocabulary(db: any) {
  const vocabData = [
    ['apple', '苹果', 'elementary', 'easy', '/ˈæp.əl/', 'I eat an apple every day.'],
    ['banana', '香蕉', 'elementary', 'easy', '/bəˈnæn.ə/', 'The banana is yellow.'],
    ['cat', '猫', 'elementary', 'easy', '/kæt/', 'The cat is sleeping.'],
    ['dog', '狗', 'elementary', 'easy', '/dɒɡ/', 'The dog is barking.'],
    ['elephant', '大象', 'elementary', 'easy', '/ˈel.ɪ.fənt/', 'The elephant is very big.'],
    ['friend', '朋友', 'elementary', 'easy', '/frend/', 'She is my best friend.'],
    ['happy', '快乐的', 'elementary', 'easy', '/ˈhæp.i/', 'I am very happy today.'],
    ['school', '学校', 'elementary', 'easy', '/skuːl/', 'I go to school every day.'],
    ['teacher', '老师', 'elementary', 'easy', '/ˈtiː.tʃər/', 'My teacher is very kind.'],
    ['water', '水', 'elementary', 'easy', '/ˈwɔː.tər/', 'Please give me some water.'],
    ['adventure', '冒险', 'middle', 'medium', '/ədˈven.tʃər/', 'Life is a great adventure.'],
    ['beautiful', '美丽的', 'middle', 'medium', '/ˈbjuː.tɪ.fəl/', 'The sunset is beautiful.'],
    ['celebrate', '庆祝', 'middle', 'medium', '/ˈsel.ə.breɪt/', 'We celebrate Christmas every year.'],
    ['dangerous', '危险的', 'middle', 'medium', '/ˈdeɪn.dʒər.əs/', 'It is dangerous to swim here.'],
    ['environment', '环境', 'middle', 'medium', '/ɪnˈvaɪ.rən.mənt/', 'We should protect the environment.'],
    ['important', '重要的', 'middle', 'medium', '/ɪmˈpɔː.tənt/', 'Education is very important.'],
    ['knowledge', '知识', 'middle', 'medium', '/ˈnɒl.ɪdʒ/', 'Knowledge is power.'],
    ['mountain', '山', 'middle', 'medium', '/ˈmaʊn.tɪn/', 'The mountain is very high.'],
    ['practice', '练习', 'middle', 'medium', '/ˈpræk.tɪs/', 'Practice makes perfect.'],
    ['wonderful', '精彩的', 'middle', 'medium', '/ˈwʌn.dər.fəl/', 'What a wonderful day!'],
    ['accomplish', '完成，实现', 'high', 'hard', '/əˈkʌm.plɪʃ/', 'We accomplished our goal.'],
    ['brilliant', '杰出的', 'high', 'hard', '/ˈbrɪl.jənt/', 'She has a brilliant mind.'],
    ['comprehensive', '综合的', 'high', 'hard', '/ˌkɒm.prɪˈhen.sɪv/', 'We need a comprehensive plan.'],
    ['demonstrate', '证明，演示', 'high', 'hard', '/ˈdem.ən.streɪt/', 'Let me demonstrate how it works.'],
    ['enthusiasm', '热情', 'high', 'hard', '/ɪnˈθjuː.zi.æz.əm/', 'She showed great enthusiasm.'],
    ['fundamental', '基本的', 'high', 'hard', '/ˌfʌn.dəˈmen.təl/', 'This is a fundamental principle.'],
    ['generate', '产生', 'high', 'hard', '/ˈdʒen.ər.eɪt/', 'The machine generates electricity.'],
    ['hypothesis', '假设', 'high', 'hard', '/haɪˈpɒθ.ə.sɪs/', 'We need to test this hypothesis.'],
    ['innovative', '创新的', 'high', 'hard', '/ˈɪn.ə.və.tɪv/', 'They have an innovative approach.'],
    ['perspective', '观点', 'high', 'hard', '/pəˈspek.tɪv/', 'Try to see it from my perspective.'],
  ];
  
  for (const vocab of vocabData) {
    db.run(`INSERT INTO vocabulary (word, meaning, grade, difficulty, phonetic, example) VALUES (?, ?, ?, ?, ?, ?)`, vocab);
  }
}

async function seedVocabularyPg() {
  const vocabData = [
    ['apple', '苹果', 'elementary', 'easy', '/ˈæp.əl/', 'I eat an apple every day.'],
    ['banana', '香蕉', 'elementary', 'easy', '/bəˈnæn.ə/', 'The banana is yellow.'],
    ['cat', '猫', 'elementary', 'easy', '/kæt/', 'The cat is sleeping.'],
    ['dog', '狗', 'elementary', 'easy', '/dɒɡ/', 'The dog is barking.'],
    ['elephant', '大象', 'elementary', 'easy', '/ˈel.ɪ.fənt/', 'The elephant is very big.'],
    ['friend', '朋友', 'elementary', 'easy', '/frend/', 'She is my best friend.'],
    ['happy', '快乐的', 'elementary', 'easy', '/ˈhæp.i/', 'I am very happy today.'],
    ['school', '学校', 'elementary', 'easy', '/skuːl/', 'I go to school every day.'],
    ['teacher', '老师', 'elementary', 'easy', '/ˈtiː.tʃər/', 'My teacher is very kind.'],
    ['water', '水', 'elementary', 'easy', '/ˈwɔː.tər/', 'Please give me some water.'],
    ['adventure', '冒险', 'middle', 'medium', '/ədˈven.tʃər/', 'Life is a great adventure.'],
    ['beautiful', '美丽的', 'middle', 'medium', '/ˈbjuː.tɪ.fəl/', 'The sunset is beautiful.'],
    ['celebrate', '庆祝', 'middle', 'medium', '/ˈsel.ə.breɪt/', 'We celebrate Christmas every year.'],
    ['dangerous', '危险的', 'middle', 'medium', '/ˈdeɪn.dʒər.əs/', 'It is dangerous to swim here.'],
    ['environment', '环境', 'middle', 'medium', '/ɪnˈvaɪ.rən.mənt/', 'We should protect the environment.'],
    ['important', '重要的', 'middle', 'medium', '/ɪmˈpɔː.tənt/', 'Education is very important.'],
    ['knowledge', '知识', 'middle', 'medium', '/ˈnɒl.ɪdʒ/', 'Knowledge is power.'],
    ['mountain', '山', 'middle', 'medium', '/ˈmaʊn.tɪn/', 'The mountain is very high.'],
    ['practice', '练习', 'middle', 'medium', '/ˈpræk.tɪs/', 'Practice makes perfect.'],
    ['wonderful', '精彩的', 'middle', 'medium', '/ˈwʌn.dər.fəl/', 'What a wonderful day!'],
    ['accomplish', '完成，实现', 'high', 'hard', '/əˈkʌm.plɪʃ/', 'We accomplished our goal.'],
    ['brilliant', '杰出的', 'high', 'hard', '/ˈbrɪl.jənt/', 'She has a brilliant mind.'],
    ['comprehensive', '综合的', 'high', 'hard', '/ˌkɒm.prɪˈhen.sɪv/', 'We need a comprehensive plan.'],
    ['demonstrate', '证明，演示', 'high', 'hard', '/ˈdem.ən.streɪt/', 'Let me demonstrate how it works.'],
    ['enthusiasm', '热情', 'high', 'hard', '/ɪnˈθjuː.zi.æz.əm/', 'She showed great enthusiasm.'],
    ['fundamental', '基本的', 'high', 'hard', '/ˌfʌn.dəˈmen.təl/', 'This is a fundamental principle.'],
    ['generate', '产生', 'high', 'hard', '/ˈdʒen.ər.eɪt/', 'The machine generates electricity.'],
    ['hypothesis', '假设', 'high', 'hard', '/haɪˈpɒθ.ə.sɪs/', 'We need to test this hypothesis.'],
    ['innovative', '创新的', 'high', 'hard', '/ˈɪn.ə.və.tɪv/', 'They have an innovative approach.'],
    ['perspective', '观点', 'high', 'hard', '/pəˈspek.tɪv/', 'Try to see it from my perspective.'],
  ];
  
  for (const vocab of vocabData) {
    await pgPool.query(
      `INSERT INTO vocabulary (word, meaning, grade, difficulty, phonetic, example) VALUES ($1, $2, $3, $4, $5, $6)`,
      vocab
    );
  }
}

function seedPoems(db: any) {
  const poemsData = [
    ['静夜思', '李白', '唐', '床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。', '明亮的月光洒在床前，好像地上泛起了一层白霜。', '这首诗描写了秋日夜晚，诗人于屋内抬头望月而思念家乡的感受。', '思乡,月亮,夜晚'],
    ['春晓', '孟浩然', '唐', '春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。', '春天的夜晚一直睡到天亮，醒来时只听见窗外一片鸟鸣啁啾。', '这首诗是诗人隐居在鹿门山时所做，意境十分优美。', '春天,早晨,自然'],
    ['登鹳雀楼', '王之涣', '唐', '白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。', '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。', '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负。', '登高,励志,黄河'],
    ['望庐山瀑布', '李白', '唐', '日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。', '太阳照耀香炉峰生出袅袅紫烟，远远望去瀑布像长河悬挂山前。', '这首诗形象地描绘了庐山瀑布雄奇壮丽的景色。', '瀑布,庐山,壮观'],
    ['悯农', '李绅', '唐', '锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。', '盛夏中午，烈日炎炎，农民还在劳作，汗珠滴入泥土。', '这首诗描绘了在烈日当空的正午农民田里劳作的景象。', '农民,劳动,珍惜'],
  ];
  
  for (const poem of poemsData) {
    db.run(`INSERT INTO poems (title, author, dynasty, content, translation, appreciation, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`, poem);
  }
}

async function seedPoemsPg() {
  const poemsData = [
    ['静夜思', '李白', '唐', '床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。', '明亮的月光洒在床前，好像地上泛起了一层白霜。', '这首诗描写了秋日夜晚，诗人于屋内抬头望月而思念家乡的感受。', '思乡,月亮,夜晚'],
    ['春晓', '孟浩然', '唐', '春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。', '春天的夜晚一直睡到天亮，醒来时只听见窗外一片鸟鸣啁啾。', '这首诗是诗人隐居在鹿门山时所做，意境十分优美。', '春天,早晨,自然'],
    ['登鹳雀楼', '王之涣', '唐', '白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。', '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。', '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负。', '登高,励志,黄河'],
    ['望庐山瀑布', '李白', '唐', '日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。', '太阳照耀香炉峰生出袅袅紫烟，远远望去瀑布像长河悬挂山前。', '这首诗形象地描绘了庐山瀑布雄奇壮丽的景色。', '瀑布,庐山,壮观'],
    ['悯农', '李绅', '唐', '锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。', '盛夏中午，烈日炎炎，农民还在劳作，汗珠滴入泥土。', '这首诗描绘了在烈日当空的正午农民田里劳作的景象。', '农民,劳动,珍惜'],
  ];
  
  for (const poem of poemsData) {
    await pgPool.query(
      `INSERT INTO poems (title, author, dynasty, content, translation, appreciation, tags) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      poem
    );
  }
}

function seedMathQuestions(db: any) {
  const mathData = [
    ['鸡兔同笼', '笼子里有若干只鸡和兔。从上面数，有35个头，从下面数，有94只脚。鸡和兔各有几只？', '鸡23只，兔12只', '设鸡有x只，兔有y只。\nx + y = 35\n2x + 4y = 94\n解得：x = 23, y = 12', 'hard', '五年级', '方程,应用题', '经典,方程'],
    ['追及问题', '甲乙两人同时从A地出发去B地，甲每小时走5千米，乙每小时走3千米。甲到达B地后立即返回，在距B地6千米处与乙相遇。求AB两地的距离。', '24千米', '设AB距离为x千米。\n甲走的时间 = x/5 + 6/5\n乙走的时间 = (x-6)/3\n两者时间相等，解得 x = 24', 'hard', '五年级', '行程问题', '追及,行程'],
    ['分数应用', '一本书，第一天看了全书的1/4，第二天看了余下的2/5，还剩90页没看。这本书共有多少页？', '200页', '设全书共x页。\n第一天看了 x/4，余下 3x/4\n第二天看了 3x/4 × 2/5 = 3x/10\n剩余：x - x/4 - 3x/10 = 90\n解得 x = 200', 'medium', '五年级', '分数,应用题', '分数,剩余'],
    ['面积计算', '一个长方形，长是宽的3倍，周长是48厘米。求这个长方形的面积。', '108平方厘米', '设宽为x厘米，则长为3x厘米。\n周长 = 2(x + 3x) = 48\n8x = 48, x = 6\n长 = 18厘米\n面积 = 18 × 6 = 108平方厘米', 'medium', '四年级', '几何,面积', '长方形,周长'],
    ['比例问题', '甲乙丙三人分一批糖果，甲乙之比是3:4，乙丙之比是5:6。已知甲比丙少14颗，求这批糖果共有多少颗。', '106颗', '甲:乙 = 3:4 = 15:20\n乙:丙 = 5:6 = 20:24\n所以 甲:乙:丙 = 15:20:24\n甲比丙少 24-15 = 9份 = 14颗\n每份 = 14/9\n总数 = (15+20+24) × 14/9 = 106颗', 'hard', '六年级', '比例,分配', '比例,分配'],
  ];
  
  for (const math of mathData) {
    db.run(`INSERT INTO math_questions (title, question, answer, analysis, difficulty, grade, knowledge_point, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, math);
  }
}

async function seedMathQuestionsPg() {
  const mathData = [
    ['鸡兔同笼', '笼子里有若干只鸡和兔。从上面数，有35个头，从下面数，有94只脚。鸡和兔各有几只？', '鸡23只，兔12只', '设鸡有x只，兔有y只。\nx + y = 35\n2x + 4y = 94\n解得：x = 23, y = 12', 'hard', '五年级', '方程,应用题', '经典,方程'],
    ['追及问题', '甲乙两人同时从A地出发去B地，甲每小时走5千米，乙每小时走3千米。甲到达B地后立即返回，在距B地6千米处与乙相遇。求AB两地的距离。', '24千米', '设AB距离为x千米。\n甲走的时间 = x/5 + 6/5\n乙走的时间 = (x-6)/3\n两者时间相等，解得 x = 24', 'hard', '五年级', '行程问题', '追及,行程'],
    ['分数应用', '一本书，第一天看了全书的1/4，第二天看了余下的2/5，还剩90页没看。这本书共有多少页？', '200页', '设全书共x页。\n第一天看了 x/4，余下 3x/4\n第二天看了 3x/4 × 2/5 = 3x/10\n剩余：x - x/4 - 3x/10 = 90\n解得 x = 200', 'medium', '五年级', '分数,应用题', '分数,剩余'],
    ['面积计算', '一个长方形，长是宽的3倍，周长是48厘米。求这个长方形的面积。', '108平方厘米', '设宽为x厘米，则长为3x厘米。\n周长 = 2(x + 3x) = 48\n8x = 48, x = 6\n长 = 18厘米\n面积 = 18 × 6 = 108平方厘米', 'medium', '四年级', '几何,面积', '长方形,周长'],
    ['比例问题', '甲乙丙三人分一批糖果，甲乙之比是3:4，乙丙之比是5:6。已知甲比丙少14颗，求这批糖果共有多少颗。', '106颗', '甲:乙 = 3:4 = 15:20\n乙:丙 = 5:6 = 20:24\n所以 甲:乙:丙 = 15:20:24\n甲比丙少 24-15 = 9份 = 14颗\n每份 = 14/9\n总数 = (15+20+24) × 14/9 = 106颗', 'hard', '六年级', '比例,分配', '比例,分配'],
  ];
  
  for (const math of mathData) {
    await pgPool.query(
      `INSERT INTO math_questions (title, question, answer, analysis, difficulty, grade, knowledge_point, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      math
    );
  }
}

function seedCourses(db: any) {
  const coursesData = [
    ['小学数学同步辅导', '同步教材，夯实基础，提升成绩', 'math', '五年级', 'https://picsum.photos/seed/math1/400/300', 20],
    ['初中英语语法精讲', '系统讲解英语语法，轻松应对考试', 'english', '七年级', 'https://picsum.photos/seed/english1/400/300', 15],
    ['小学语文阅读理解', '提高阅读理解能力，掌握答题技巧', 'chinese', '四年级', 'https://picsum.photos/seed/chinese1/400/300', 18],
    ['初中物理基础入门', '从零基础开始，轻松学物理', 'physics', '八年级', 'https://picsum.photos/seed/physics1/400/300', 12],
  ];
  
  for (const course of coursesData) {
    db.run(`INSERT INTO courses (title, description, subject, grade, cover_image, lesson_count) VALUES (?, ?, ?, ?, ?, ?)`, course);
  }
}

async function seedCoursesPg() {
  const coursesData = [
    ['小学数学同步辅导', '同步教材，夯实基础，提升成绩', 'math', '五年级', 'https://picsum.photos/seed/math1/400/300', 20],
    ['初中英语语法精讲', '系统讲解英语语法，轻松应对考试', 'english', '七年级', 'https://picsum.photos/seed/english1/400/300', 15],
    ['小学语文阅读理解', '提高阅读理解能力，掌握答题技巧', 'chinese', '四年级', 'https://picsum.photos/seed/chinese1/400/300', 18],
    ['初中物理基础入门', '从零基础开始，轻松学物理', 'physics', '八年级', 'https://picsum.photos/seed/physics1/400/300', 12],
  ];
  
  for (const course of coursesData) {
    await pgPool.query(
      `INSERT INTO courses (title, description, subject, grade, cover_image, lesson_count) VALUES ($1, $2, $3, $4, $5, $6)`,
      course
    );
  }
}

function seedTasks(db: any) {
  const tasksData = [
    [1, '完成数学练习册第5章', '完成第5章所有习题，重点练习应用题', 30, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '背诵古诗词3首', '背诵《静夜思》《春晓》《登鹳雀楼》', 20, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '英语学习30分钟', '学习新单词10个，复习旧单词20个', 30, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '阅读课外书', '阅读《小王子》第3-5章', 25, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '错题整理', '整理本周错题，重新做一遍', 20, 0, 0, new Date().toISOString().split('T')[0]],
  ];
  
  for (const task of tasksData) {
    db.run(`INSERT INTO tasks (user_id, title, description, duration, completed, progress, task_date) VALUES (?, ?, ?, ?, ?, ?, ?)`, task);
  }
}

async function seedTasksPg() {
  const tasksData = [
    [1, '完成数学练习册第5章', '完成第5章所有习题，重点练习应用题', 30, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '背诵古诗词3首', '背诵《静夜思》《春晓》《登鹳雀楼》', 20, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '英语学习30分钟', '学习新单词10个，复习旧单词20个', 30, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '阅读课外书', '阅读《小王子》第3-5章', 25, 0, 0, new Date().toISOString().split('T')[0]],
    [1, '错题整理', '整理本周错题，重新做一遍', 20, 0, 0, new Date().toISOString().split('T')[0]],
  ];
  
  for (const task of tasksData) {
    await pgPool.query(
      `INSERT INTO tasks (user_id, title, description, duration, completed, progress, task_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      task
    );
  }
}

function saveSQLiteDatabase() {
  if (sqliteDb) {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function getDatabase() {
  const dbType = getDbType();
  
  if (dbType === 'postgres') {
    if (!pgPool) {
      throw new Error('PostgreSQL not initialized. Call initDatabase() first.');
    }
    return { type: 'postgres' as const, pool: pgPool };
  } else {
    if (!sqliteDb) {
      throw new Error('SQLite not initialized. Call initDatabase() first.');
    }
    return { type: 'sqlite' as const, db: sqliteDb };
  }
}