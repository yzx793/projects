import { Router } from 'express';
import { courses, subjects } from '../data/mockData.js';

const router = Router();

// GET /api/v1/courses/subjects - 获取学科列表
router.get('/subjects', (req, res) => {
  res.json({ code: 0, data: subjects });
});

// GET /api/v1/courses - 获取课程列表
// Query 参数: subject?: string (学科筛选)
router.get('/', (req, res) => {
  const { subject } = req.query;
  let filtered = courses;

  if (subject && subject !== 'all') {
    filtered = courses.filter(c => c.subject === subject);
  }

  res.json({ code: 0, data: filtered });
});

// GET /api/v1/courses/:id - 获取课程详情
// Path 参数: id: number
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const course = courses.find(c => c.id === Number(id));

  if (!course) {
    return res.status(404).json({ code: 404, message: '课程不存在' });
  }

  res.json({ code: 0, data: course });
});

export default router;
