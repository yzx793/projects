import { Router } from 'express';
import { wrongQuestions } from '../data/mockData.js';

const router = Router();

// GET /api/v1/wrong-questions - 获取错题列表
// Query 参数: subject?: string, solved?: boolean, reviewStatus?: string, search?: string, tag?: string
router.get('/', (req, res) => {
  const { subject, solved, reviewStatus, search, tag } = req.query;
  let filtered = [...wrongQuestions];

  if (subject && subject !== 'all') {
    filtered = filtered.filter(q => q.subject === subject);
  }

  if (solved !== undefined) {
    const isSolved = solved === 'true';
    filtered = filtered.filter(q => q.solved === isSolved);
  }

  if (reviewStatus && reviewStatus !== 'all') {
    filtered = filtered.filter(q => q.reviewStatus === reviewStatus);
  }

  if (tag && tag !== 'all') {
    filtered = filtered.filter(q => q.tags.includes(String(tag)));
  }

  if (search) {
    const keyword = String(search).toLowerCase();
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(keyword) ||
      q.question.toLowerCase().includes(keyword) ||
      q.knowledgePoint.toLowerCase().includes(keyword) ||
      q.tags.some(t => t.toLowerCase().includes(keyword))
    );
  }

  // 按学科分组统计
  const subjectStats = filtered.reduce((acc, q) => {
    if (!acc[q.subject]) {
      acc[q.subject] = { subject: q.subject, subjectName: q.subjectName, count: 0 };
    }
    acc[q.subject].count++;
    return acc;
  }, {} as Record<string, { subject: string; subjectName: string; count: number }>);

  // 复习状态统计
  const reviewStats = {
    pending: filtered.filter(q => q.reviewStatus === 'pending').length,
    reviewing: filtered.filter(q => q.reviewStatus === 'reviewing').length,
    mastered: filtered.filter(q => q.reviewStatus === 'mastered').length,
  };

  res.json({
    code: 0,
    data: {
      questions: filtered,
      stats: Object.values(subjectStats),
      reviewStats,
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

// POST /api/v1/wrong-questions - 创建新错题
// Body 参数: subject: string, subjectName: string, title: string, question: string,
//            userAnswer?: string, correctAnswer?: string, analysis?: string,
//            knowledgePoint?: string, difficulty?: string, imageUrl?: string,
//            errorType?: string, tags?: string[]
router.post('/', (req, res) => {
  const newId = Math.max(...wrongQuestions.map(q => q.id)) + 1;
  const newQuestion = {
    id: newId,
    subject: req.body.subject || 'math',
    subjectName: req.body.subjectName || '数学',
    title: req.body.title || '新错题',
    question: req.body.question || '',
    userAnswer: req.body.userAnswer || '',
    correctAnswer: req.body.correctAnswer || '',
    analysis: req.body.analysis || '',
    knowledgePoint: req.body.knowledgePoint || '',
    difficulty: req.body.difficulty || 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    solved: false,
    wrongCount: 1,
    imageUrl: req.body.imageUrl || '',
    reviewStatus: 'pending' as const,
    errorType: req.body.errorType || 'calculation',
    tags: req.body.tags || [],
    notes: req.body.notes || '',
  };

  wrongQuestions.push(newQuestion);
  res.json({ code: 0, data: newQuestion, message: '错题创建成功' });
});

// PUT /api/v1/wrong-questions/:id - 更新错题
// Path 参数: id: number
// Body 参数: 同创建接口
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const question = wrongQuestions.find(q => q.id === Number(id));

  if (!question) {
    return res.status(404).json({ code: 404, message: '错题不存在' });
  }

  // 更新可修改的字段
  const updatableFields = ['title', 'question', 'userAnswer', 'correctAnswer', 'analysis',
    'knowledgePoint', 'difficulty', 'imageUrl', 'errorType', 'tags', 'notes', 'subject', 'subjectName'];

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      (question as Record<string, unknown>)[field] = req.body[field];
    }
  }

  res.json({ code: 0, data: question, message: '错题更新成功' });
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
  question.reviewStatus = 'mastered';
  res.json({ code: 0, data: question, message: '已标记为解决' });
});

// POST /api/v1/wrong-questions/:id/review - 更新复习状态
// Path 参数: id: number
// Body 参数: reviewStatus: 'pending' | 'reviewing' | 'mastered'
router.post('/:id/review', (req, res) => {
  const { id } = req.params;
  const { reviewStatus } = req.body;

  const question = wrongQuestions.find(q => q.id === Number(id));

  if (!question) {
    return res.status(404).json({ code: 404, message: '错题不存在' });
  }

  if (!['pending', 'reviewing', 'mastered'].includes(reviewStatus)) {
    return res.status(400).json({ code: 400, message: '无效的复习状态' });
  }

  question.reviewStatus = reviewStatus;
  if (reviewStatus === 'mastered') {
    question.solved = true;
  }

  res.json({ code: 0, data: question, message: '复习状态已更新' });
});

// DELETE /api/v1/wrong-questions/:id - 删除错题
// Path 参数: id: number
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = wrongQuestions.findIndex(q => q.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ code: 404, message: '错题不存在' });
  }

  wrongQuestions.splice(index, 1);
  res.json({ code: 0, message: '错题已删除' });
});

// POST /api/v1/wrong-questions/batch/delete - 批量删除错题
// Body 参数: ids: number[]
router.post('/batch/delete', (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ code: 400, message: '请提供要删除的错题ID列表' });
  }

  const deletedCount = ids.reduce((count, id) => {
    const index = wrongQuestions.findIndex(q => q.id === id);
    if (index !== -1) {
      wrongQuestions.splice(index, 1);
      return count + 1;
    }
    return count;
  }, 0);

  res.json({ code: 0, message: `成功删除 ${deletedCount} 道错题`, data: { deletedCount } });
});

export default router;
