import express from 'express';
import { queryAll, queryOne } from '../db/helpers.js';

const router = express.Router();

// GET /api/v1/math/grades - 获取年级列表
router.get('/grades', async (req, res) => {
  try {
    const result = await queryAll('SELECT DISTINCT grade FROM math_questions WHERE grade IS NOT NULL');
    const grades = result.map((row: any) => row.grade);
    res.json({ success: true, data: grades });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取年级列表失败' });
  }
});

// GET /api/v1/math/knowledge-points - 获取知识点列表
router.get('/knowledge-points', async (req, res) => {
  try {
    const result = await queryAll('SELECT DISTINCT knowledge_point FROM math_questions WHERE knowledge_point IS NOT NULL');
    const points: string[] = [];
    for (const row of result) {
      if (row.knowledge_point) {
        (row.knowledge_point as string).split(',').forEach(p => {
          if (p.trim() && !points.includes(p.trim())) {
            points.push(p.trim());
          }
        });
      }
    }
    res.json({ success: true, data: points });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取知识点列表失败' });
  }
});

// GET /api/v1/math/questions - 获取题目列表（支持筛选）
router.get('/questions', async (req, res) => {
  try {
    const { grade, knowledgePoint, difficulty, limit, offset } = req.query;

    let query = 'SELECT * FROM math_questions WHERE 1=1';
    const conditions: string[] = [];

    if (grade && typeof grade === 'string') {
      conditions.push(`grade = '${grade}'`);
    }

    if (knowledgePoint && typeof knowledgePoint === 'string') {
      conditions.push(`knowledge_point LIKE '%${knowledgePoint}%'`);
    }

    if (difficulty && typeof difficulty === 'string') {
      conditions.push(`difficulty = '${difficulty}'`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const offsetVal = offset ? parseInt(offset as string) : 0;
    const limitVal = limit ? parseInt(limit as string) : 20;
    query += ` LIMIT ${limitVal} OFFSET ${offsetVal}`;

    const questions = await queryAll(query);
    
    questions.forEach((q: any) => {
      q.tags = q.tags ? q.tags.split(',') : [];
    });

    const countResult = await queryAll(query.replace(/LIMIT.*$/, '').replace('SELECT *', 'SELECT COUNT(*) as count'));
    const total = countResult.length > 0 ? countResult[0].count : 0;

    res.json({
      success: true,
      data: questions,
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
router.get('/questions/random', async (req, res) => {
  try {
    const { grade, count = 5, difficulty } = req.query;

    let query = 'SELECT * FROM math_questions WHERE 1=1';
    if (grade && typeof grade === 'string') {
      query += ` AND grade = '${grade}'`;
    }
    if (difficulty && typeof difficulty === 'string') {
      query += ` AND difficulty = '${difficulty}'`;
    }
    query += ` ORDER BY RANDOM() LIMIT ${count}`;

    const questions = await queryAll(query);
    
    questions.forEach((q: any) => {
      q.tags = q.tags ? q.tags.split(',') : [];
    });

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取随机题目失败' });
  }
});

// GET /api/v1/math/questions/:id - 获取题目详情
router.get('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await queryOne(`SELECT * FROM math_questions WHERE id = ${id}`);

    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    question.tags = question.tags ? question.tags.split(',') : [];

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取题目详情失败' });
  }
});

export default router;