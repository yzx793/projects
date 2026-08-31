import { Router } from 'express';
import { queryAll, queryOne } from '../db/helpers.js';

const router = Router();

// GET /api/v1/poetry - 获取诗词列表（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { type, dynasty, author, grade } = req.query;
    
    let query = 'SELECT * FROM poems WHERE 1=1';
    const params: any[] = [];
    
    if (type && typeof type === 'string') {
      query += ' AND tags LIKE ?';
      params.push(`%${type}%`);
    }
    if (dynasty && typeof dynasty === 'string') {
      query += ' AND dynasty = ?';
      params.push(dynasty);
    }
    if (author && typeof author === 'string') {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }
    
    const rows = await queryAll(query, params);
    const poems = rows.map((p: any) => ({
      ...p,
      tags: p.tags ? p.tags.split(',') : [],
    }));
    
    res.json({ success: true, data: poems });
  } catch (error) {
    console.error('Get poems error:', error);
    res.status(500).json({ success: false, error: '获取诗词列表失败' });
  }
});

// GET /api/v1/poetry/types - 获取诗词类型列表
router.get('/types', async (req, res) => {
  try {
    const rows = await queryAll('SELECT DISTINCT tags FROM poems WHERE tags IS NOT NULL');
    const types: string[] = [];
    for (const row of rows) {
      if (row.tags) {
        row.tags.split(',').forEach((t: string) => {
          if (t.trim() && !types.includes(t.trim())) {
            types.push(t.trim());
          }
        });
      }
    }
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取诗词类型失败' });
  }
});

// GET /api/v1/poetry/dynasties - 获取朝代列表
router.get('/dynasties', async (req, res) => {
  try {
    const rows = await queryAll('SELECT DISTINCT dynasty FROM poems WHERE dynasty IS NOT NULL');
    const dynasties = rows.map((r: any) => r.dynasty);
    res.json({ success: true, data: dynasties });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取朝代列表失败' });
  }
});

// GET /api/v1/poetry/authors - 获取作者列表
router.get('/authors', async (req, res) => {
  try {
    const rows = await queryAll('SELECT DISTINCT author FROM poems WHERE author IS NOT NULL');
    const authors = rows.map((r: any) => r.author);
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取作者列表失败' });
  }
});

// GET /api/v1/poetry/random - 随机获取一首诗词
router.get('/random', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM poems WHERE 1=1';
    const params: any[] = [];
    
    if (type && typeof type === 'string') {
      query += ' AND tags LIKE ?';
      params.push(`%${type}%`);
    }
    query += ' ORDER BY RANDOM() LIMIT 1';
    
    const rows = await queryAll(query, params);
    if (rows.length === 0) {
      return res.json({ success: false, error: '没有符合条件的诗词' });
    }
    
    const poem = {
      ...rows[0],
      tags: rows[0].tags ? rows[0].tags.split(',') : [],
    };
    
    res.json({ success: true, data: poem });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取随机诗词失败' });
  }
});

// GET /api/v1/poetry/:id - 获取诗词详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poem = await queryOne('SELECT * FROM poems WHERE id = ?', [id]);
    
    if (!poem) {
      return res.status(404).json({ success: false, error: '诗词不存在' });
    }
    
    poem.tags = poem.tags ? poem.tags.split(',') : [];
    res.json({ success: true, data: poem });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取诗词详情失败' });
  }
});

export default router;