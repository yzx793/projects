import express from 'express';
import { allMathQuestions, mathGrades, mathKnowledgePoints, type MathQuestion } from '../data/mathQuestions.js';

const router = express.Router();

// GET /api/v1/math/grades - 获取年级列表
router.get('/grades', (req, res) => {
  try {
    res.json({
      success: true,
      data: mathGrades,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取年级列表失败' });
  }
});

// GET /api/v1/math/knowledge-points - 获取知识点列表
router.get('/knowledge-points', (req, res) => {
  try {
    res.json({
      success: true,
      data: mathKnowledgePoints,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取知识点列表失败' });
  }
});

// GET /api/v1/math/questions - 获取题目列表（支持筛选）
router.get('/questions', (req, res) => {
  try {
    const { grade, knowledgePoint, difficulty, type, semester, limit, offset } = req.query;

    let filtered = [...allMathQuestions];

    // 按年级筛选
    if (grade && typeof grade === 'string') {
      filtered = filtered.filter(q => q.grade === grade);
    }

    // 按学期筛选
    if (semester && typeof semester === 'string') {
      filtered = filtered.filter(q => q.semester === semester);
    }

    // 按知识点筛选
    if (knowledgePoint && typeof knowledgePoint === 'string') {
      filtered = filtered.filter(q => 
        q.knowledgePoint === knowledgePoint || 
        q.knowledgeTags.includes(knowledgePoint)
      );
    }

    // 按难度筛选
    if (difficulty && typeof difficulty === 'string') {
      const diff = parseInt(difficulty);
      if (!isNaN(diff)) {
        filtered = filtered.filter(q => q.difficulty === diff);
      }
    }

    // 按题型筛选
    if (type && typeof type === 'string') {
      filtered = filtered.filter(q => q.type === type);
    }

    const total = filtered.length;

    // 分页
    const offsetVal = offset ? parseInt(offset as string) : 0;
    const limitVal = limit ? parseInt(limit as string) : 20;
    const paginated = filtered.slice(offsetVal, offsetVal + limitVal);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        offset: offsetVal,
        limit: limitVal,
        hasMore: offsetVal + limitVal < total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取题目列表失败' });
  }
});

// GET /api/v1/math/questions/random - 随机获取题目
router.get('/questions/random', (req, res) => {
  try {
    const { grade, count, difficulty } = req.query;

    let filtered = [...allMathQuestions];

    if (grade && typeof grade === 'string') {
      filtered = filtered.filter(q => q.grade === grade);
    }

    if (difficulty && typeof difficulty === 'string') {
      const diff = parseInt(difficulty);
      if (!isNaN(diff)) {
        filtered = filtered.filter(q => q.difficulty === diff);
      }
    }

    const countVal = count ? parseInt(count as string) : 5;
    
    // 随机打乱并取指定数量
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(countVal, shuffled.length));

    res.json({
      success: true,
      data: selected,
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '随机获取题目失败' });
  }
});

// GET /api/v1/math/questions/:id - 获取单个题目详情
router.get('/questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const question = allMathQuestions.find(q => q.id === parseInt(id));

    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取题目详情失败' });
  }
});

// GET /api/v1/math/stats - 获取题库统计
router.get('/stats', (req, res) => {
  try {
    const stats = {
      total: allMathQuestions.length,
      byGrade: {} as Record<string, number>,
      byDifficulty: {} as Record<number, number>,
      byType: {} as Record<string, number>,
      bySemester: { upper: 0, lower: 0 },
    };

    allMathQuestions.forEach(q => {
      stats.byGrade[q.grade] = (stats.byGrade[q.grade] || 0) + 1;
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
      stats.bySemester[q.semester]++;
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取统计信息失败' });
  }
});

export default router;
