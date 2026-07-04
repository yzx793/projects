import { Router } from 'express';
import { wrongQuestions } from '../data/mockData.js';

const router = Router();

// GET /api/v1/wrong-questions - 获取错题列表
// Query 参数: subject?: string, solved?: boolean
router.get('/', (req, res) => {
  const { subject, solved } = req.query;
  let filtered = [...wrongQuestions];

  if (subject && subject !== 'all') {
    filtered = filtered.filter(q => q.subject === subject);
  }

  if (solved !== undefined) {
    const isSolved = solved === 'true';
    filtered = filtered.filter(q => q.solved === isSolved);
  }

  // 按学科分组统计
  const subjectStats = filtered.reduce((acc, q) => {
    if (!acc[q.subject]) {
      acc[q.subject] = { subject: q.subject, subjectName: q.subjectName, count: 0 };
    }
    acc[q.subject].count++;
    return acc;
  }, {} as Record<string, { subject: string; subjectName: string; count: number }>);

  res.json({
    code: 0,
    data: {
      questions: filtered,
      stats: Object.values(subjectStats),
      total: filtered.length,
      unsolved: filtered.filter(q => !q.solved).length,
    },
  });
});

// GET /api/v1/wrong-questions/:id - 获取错题详情
// Path 参数: id: number
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const question = wrongQuestions.find(q => q.id === Number(id));

  if (!question) {
    return res.status(404).json({ code: 404, message: '错题不存在' });
  }

  res.json({ code: 0, data: question });
});

// POST /api/v1/wrong-questions/:id/solve - 标记错题已解决
// Path 参数: id: number
router.post('/:id/solve', (req, res) => {
  const { id } = req.params;
  const question = wrongQuestions.find(q => q.id === Number(id));

  if (!question) {
    return res.status(404).json({ code: 404, message: '错题不存在' });
  }

  question.solved = true;
  res.json({ code: 0, data: question, message: '已标记为解决' });
});

export default router;
