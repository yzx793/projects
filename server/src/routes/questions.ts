import { Router } from 'express';
import { allQuestions, subjects, grades, stages } from '../data/questions.js';

const router = Router();

// 获取学科列表
router.get('/subjects', (req, res) => {
  res.json({
    code: 0,
    data: subjects,
  });
});

// 获取年级列表
router.get('/grades', (req, res) => {
  const { stage } = req.query;
  let result = grades;
  if (stage && typeof stage === 'string') {
    result = grades.filter(g => g.stage === stage);
  }
  res.json({
    code: 0,
    data: result,
  });
});

// 获取学段列表
router.get('/stages', (req, res) => {
  res.json({
    code: 0,
    data: stages,
  });
});

// 获取题目列表（支持筛选）
router.get('/', (req, res) => {
  const { subject, grade, stage, keyword, difficulty } = req.query;
  
  let result = [...allQuestions];
  
  // 按学科筛选
  if (subject && typeof subject === 'string') {
    result = result.filter(q => q.subject === subject);
  }
  
  // 按年级筛选
  if (grade && typeof grade === 'string') {
    result = result.filter(q => q.grade === grade);
  }
  
  // 按学段筛选
  if (stage && typeof stage === 'string') {
    const stageGrades = grades.filter(g => g.stage === stage).map(g => g.id);
    result = result.filter(q => stageGrades.includes(q.grade));
  }
  
  // 按关键词搜索
  if (keyword && typeof keyword === 'string') {
    const kw = keyword.toLowerCase();
    result = result.filter(q => 
      q.title.toLowerCase().includes(kw) ||
      q.question.toLowerCase().includes(kw) ||
      q.knowledgePoint.toLowerCase().includes(kw)
    );
  }
  
  // 按难度筛选
  if (difficulty && typeof difficulty === 'string') {
    const diff = parseInt(difficulty);
    if (!isNaN(diff)) {
      result = result.filter(q => q.difficulty === diff);
    }
  }
  
  // 统计信息
  const stats = {
    total: result.length,
    bySubject: subjects.map(s => ({
      subject: s.id,
      subjectName: s.name,
      count: result.filter(q => q.subject === s.id).length,
    })),
    byStage: stages.map(s => ({
      stage: s.id,
      stageName: s.name,
      count: result.filter(q => s.grades.includes(q.grade)).length,
    })),
  };
  
  res.json({
    code: 0,
    data: {
      questions: result,
      stats,
    },
  });
});

// 获取题目详情
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const question = allQuestions.find(q => q.id === id);
  
  if (!question) {
    return res.status(404).json({
      code: 404,
      message: '题目不存在',
    });
  }
  
  res.json({
    code: 0,
    data: question,
  });
});

// 获取某学科某年级的题目
router.get('/subject/:subject/grade/:grade', (req, res) => {
  const { subject, grade } = req.params;
  
  const result = allQuestions.filter(q => 
    q.subject === subject && q.grade === grade
  );
  
  res.json({
    code: 0,
    data: {
      questions: result,
      total: result.length,
      subject,
      grade,
    },
  });
});

// 随机获取题目（用于练习）
router.get('/random/:count', (req, res) => {
  const count = Math.min(parseInt(req.params.count) || 10, 50);
  const { subject, grade, stage } = req.query;
  
  let pool = [...allQuestions];
  
  // 按条件筛选题库
  if (subject && typeof subject === 'string') {
    pool = pool.filter(q => q.subject === subject);
  }
  if (grade && typeof grade === 'string') {
    pool = pool.filter(q => q.grade === grade);
  }
  if (stage && typeof stage === 'string') {
    const stageGrades = grades.filter(g => g.stage === stage).map(g => g.id);
    pool = pool.filter(q => stageGrades.includes(q.grade));
  }
  
  // 随机抽取
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, count);
  
  res.json({
    code: 0,
    data: {
      questions: result,
      total: result.length,
    },
  });
});

export default router;
