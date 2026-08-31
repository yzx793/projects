import { Router } from 'express';
import { allPoems, poetryTypes, dynasties } from '../data/poetry.js';

const router = Router();

// GET /api/v1/poetry - 获取诗词列表（支持筛选）
router.get('/', (req, res) => {
  const { type, dynasty, author, grade } = req.query;
  let filtered = allPoems;

  if (type && typeof type === 'string') {
    filtered = filtered.filter(p => p.type === type);
  }
  if (dynasty && typeof dynasty === 'string') {
    filtered = filtered.filter(p => p.dynasty === dynasty);
  }
  if (author && typeof author === 'string') {
    filtered = filtered.filter(p => p.author.includes(author));
  }
  if (grade && typeof grade === 'string') {
    filtered = filtered.filter(p => p.grade === grade);
  }

  const list = filtered.map(p => ({
    id: p.id,
    title: p.title,
    author: p.author,
    dynasty: p.dynasty,
    type: p.type,
    content: p.content,
    grade: p.grade,
  }));

  res.json({ success: true, data: list });
});

// GET /api/v1/poetry/types - 获取诗词类型列表
router.get('/types', (_req, res) => {
  res.json({ success: true, data: poetryTypes });
});

// GET /api/v1/poetry/dynasties - 获取朝代列表
router.get('/dynasties', (_req, res) => {
  res.json({ success: true, data: dynasties });
});

// GET /api/v1/poetry/authors - 获取作者列表
router.get('/authors', (_req, res) => {
  const authors = [...new Set(allPoems.map(p => p.author))];
  res.json({ success: true, data: authors });
});

// GET /api/v1/poetry/random - 随机获取一首诗词
router.get('/random', (req, res) => {
  const { type } = req.query;
  let pool = allPoems;
  if (type && typeof type === 'string') {
    pool = pool.filter(p => p.type === type);
  }
  if (pool.length === 0) {
    res.json({ success: false, error: '没有符合条件的诗词' });
    return;
  }
  const random = pool[Math.floor(Math.random() * pool.length)];
  res.json({ success: true, data: random });
});

// GET /api/v1/poetry/:id - 获取诗词详情
router.get('/:id', (req, res) => {
  const poem = allPoems.find(p => p.id === req.params.id);
  if (!poem) {
    res.status(404).json({ success: false, error: '诗词不存在' });
    return;
  }
  res.json({ success: true, data: poem });
});

export default router;
