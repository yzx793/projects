import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/helpers.js';

const router = Router();

// GET /api/v1/wrong-questions - 获取错题列表
router.get('/', async (req, res) => {
  try {
    const { subject, solved, reviewStatus, search, tag } = req.query;
    
    let query = 'SELECT * FROM wrong_questions WHERE 1=1';
    const conditions: string[] = [];
    
    if (subject && subject !== 'all') {
      conditions.push(`subject = '${subject}'`);
    }
    
    if (solved !== undefined) {
      const isSolved = solved === 'true' ? 1 : 0;
      conditions.push(`solved = ${isSolved}`);
    }
    
    if (reviewStatus && reviewStatus !== 'all') {
      conditions.push(`review_status = '${reviewStatus}'`);
    }
    
    if (tag && tag !== 'all') {
      conditions.push(`tags LIKE '%${tag}%'`);
    }
    
    if (search) {
      const keyword = String(search);
      conditions.push(`(title LIKE '%${keyword}%' OR question LIKE '%${keyword}%' OR knowledge_point LIKE '%${keyword}%')`);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    const questions = await queryAll(query);
    
    questions.forEach((q: any) => {
      q.solved = q.solved === 1;
      q.tags = q.tags ? q.tags.split(',') : [];
    });
    
    const subjectStats = questions.reduce((acc, q) => {
      if (!acc[q.subject]) {
        acc[q.subject] = { subject: q.subject, subjectName: q.subject_name, count: 0 };
      }
      acc[q.subject].count++;
      return acc;
    }, {} as Record<string, { subject: string; subjectName: string; count: number }>);
    
    const reviewStats = {
      pending: questions.filter((q: any) => q.review_status === 'pending').length,
      reviewing: questions.filter((q: any) => q.review_status === 'reviewing').length,
      mastered: questions.filter((q: any) => q.review_status === 'mastered').length,
    };
    
    res.json({
      code: 0,
      data: {
        questions,
        stats: Object.values(subjectStats),
        reviewStats,
        total: questions.length,
        unsolved: questions.filter((q: any) => !q.solved).length,
      },
    });
  } catch (error) {
    console.error('Get wrong questions error:', error);
    res.status(500).json({ code: 500, message: '获取错题列表失败' });
  }
});

// GET /api/v1/wrong-questions/:id - 获取错题详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    
    if (!question) {
      return res.status(404).json({ code: 404, message: '错题不存在' });
    }
    
    question.solved = question.solved === 1;
    question.tags = question.tags ? question.tags.split(',') : [];
    
    res.json({ code: 0, data: question });
  } catch (error) {
    console.error('Get wrong question error:', error);
    res.status(500).json({ code: 500, message: '获取错题详情失败' });
  }
});

// POST /api/v1/wrong-questions - 创建新错题
router.post('/', async (req, res) => {
  try {
    const { subject, subjectName, title, question: qText, userAnswer, correctAnswer, analysis, knowledgePoint, difficulty, imageUrl, errorType, tags, notes } = req.body;
    
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags || '';
    
    await run(
      `INSERT INTO wrong_questions (subject, subject_name, title, question, user_answer, correct_answer, analysis, knowledge_point, difficulty, image_url, error_type, tags, notes) VALUES ('${subject || 'math'}', '${subjectName || '数学'}', '${title || '新错题'}', '${qText || ''}', '${userAnswer || ''}', '${correctAnswer || ''}', '${analysis || ''}', '${knowledgePoint || ''}', '${difficulty || 'medium'}', '${imageUrl || ''}', '${errorType || 'calculation'}', '${tagsStr}', '${notes || ''}')`
    );
    
    const newQuestion = await queryOne('SELECT * FROM wrong_questions ORDER BY id DESC LIMIT 1');
    newQuestion.solved = false;
    newQuestion.tags = newQuestion.tags ? newQuestion.tags.split(',') : [];
    
    res.json({ code: 0, data: newQuestion, message: '错题创建成功' });
  } catch (error) {
    console.error('Create wrong question error:', error);
    res.status(500).json({ code: 500, message: '创建错题失败' });
  }
});

// PUT /api/v1/wrong-questions/:id - 更新错题
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '错题不存在' });
    }
    
    const { title, question: qText, userAnswer, correctAnswer, analysis, knowledgePoint, difficulty, imageUrl, errorType, tags, notes, subject, subjectName } = req.body;
    
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    
    await run(
      `UPDATE wrong_questions SET title = '${title}', question = '${qText}', user_answer = '${userAnswer}', correct_answer = '${correctAnswer}', analysis = '${analysis}', knowledge_point = '${knowledgePoint}', difficulty = '${difficulty}', image_url = '${imageUrl}', error_type = '${errorType}', tags = '${tagsStr}', notes = '${notes}', subject = '${subject}', subject_name = '${subjectName}' WHERE id = ${id}`
    );
    
    const question = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    question.solved = question.solved === 1;
    question.tags = question.tags ? question.tags.split(',') : [];
    
    res.json({ code: 0, data: question, message: '错题更新成功' });
  } catch (error) {
    console.error('Update wrong question error:', error);
    res.status(500).json({ code: 500, message: '更新错题失败' });
  }
});

// POST /api/v1/wrong-questions/:id/solve - 标记错题已解决
router.post('/:id/solve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '错题不存在' });
    }
    
    await run(`UPDATE wrong_questions SET solved = 1, review_status = 'mastered' WHERE id = ${id}`);
    
    const question = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    question.solved = true;
    question.tags = question.tags ? question.tags.split(',') : [];
    
    res.json({ code: 0, data: question, message: '已标记为解决' });
  } catch (error) {
    console.error('Solve wrong question error:', error);
    res.status(500).json({ code: 500, message: '标记解决失败' });
  }
});

// POST /api/v1/wrong-questions/:id/review - 更新复习状态
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus } = req.body;
    
    const existing = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '错题不存在' });
    }
    
    if (!['pending', 'reviewing', 'mastered'].includes(reviewStatus)) {
      return res.status(400).json({ code: 400, message: '无效的复习状态' });
    }
    
    const solved = reviewStatus === 'mastered' ? 1 : 0;
    await run(`UPDATE wrong_questions SET review_status = '${reviewStatus}', solved = ${solved} WHERE id = ${id}`);
    
    const question = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    question.solved = question.solved === 1;
    question.tags = question.tags ? question.tags.split(',') : [];
    
    res.json({ code: 0, data: question, message: '复习状态已更新' });
  } catch (error) {
    console.error('Review wrong question error:', error);
    res.status(500).json({ code: 500, message: '更新复习状态失败' });
  }
});

// DELETE /api/v1/wrong-questions/:id - 删除错题
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await queryOne(`SELECT * FROM wrong_questions WHERE id = ${id}`);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '错题不存在' });
    }
    
    await run(`DELETE FROM wrong_questions WHERE id = ${id}`);
    res.json({ code: 0, message: '错题已删除' });
  } catch (error) {
    console.error('Delete wrong question error:', error);
    res.status(500).json({ code: 500, message: '删除错题失败' });
  }
});

// POST /api/v1/wrong-questions/batch/delete - 批量删除错题
router.post('/batch/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: '请提供要删除的错题ID列表' });
    }
    
    const idsStr = ids.join(',');
    await run(`DELETE FROM wrong_questions WHERE id IN (${idsStr})`);
    
    res.json({ code: 0, message: `成功删除 ${ids.length} 道错题`, data: { deletedCount: ids.length } });
  } catch (error) {
    console.error('Batch delete wrong questions error:', error);
    res.status(500).json({ code: 500, message: '批量删除失败' });
  }
});

export default router;