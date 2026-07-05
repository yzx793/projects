import { Router } from 'express';
import { wrongQuestions } from '../data/mockData.js';

const router = Router();

// POST /api/v1/practice/generate - 生成练习卷
// Body 参数: subject?: string, count?: number, includeAnswer?: boolean, difficulty?: string
router.post('/generate', (req, res) => {
  const { subject, count = 5, includeAnswer = true, difficulty } = req.body;

  let filtered = wrongQuestions.filter(q => !q.solved);

  if (subject && subject !== 'all') {
    filtered = filtered.filter(q => q.subject === subject);
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // 按错误次数排序，优先选择错得多的题目
  filtered.sort((a, b) => b.wrongCount - a.wrongCount);

  // 取指定数量的题目
  const selectedQuestions = filtered.slice(0, count);

  // 生成练习卷内容
  const practiceContent = selectedQuestions.map((q, index) => {
    let content = `## 第${index + 1}题\n\n`;
    content += `**科目**: ${q.subjectName}  **难度**: ${q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}\n\n`;
    content += `**题目**:\n${q.question}\n\n`;

    if (includeAnswer) {
      content += `**参考答案**:\n${q.correctAnswer}\n\n`;
      content += `**解析**:\n${q.analysis}\n\n`;
      content += `**知识点**: ${q.knowledgePoint}\n\n`;
    }

    content += '---\n';
    return content;
  }).join('\n');

  // 统计信息
  const stats = {
    totalQuestions: selectedQuestions.length,
    subjects: [...new Set(selectedQuestions.map(q => q.subjectName))],
    avgWrongCount: selectedQuestions.length > 0
      ? (selectedQuestions.reduce((sum, q) => sum + q.wrongCount, 0) / selectedQuestions.length).toFixed(1)
      : 0,
  };

  res.json({
    code: 0,
    data: {
      title: `错题练习卷 - ${new Date().toLocaleDateString('zh-CN')}`,
      content: practiceContent,
      questions: selectedQuestions,
      stats,
      includeAnswer,
    },
  });
});

// GET /api/v1/practice/stats - 获取练习统计
router.get('/stats', (req, res) => {
  const totalQuestions = wrongQuestions.length;
  const solvedQuestions = wrongQuestions.filter(q => q.solved).length;
  const pendingReview = wrongQuestions.filter(q => q.reviewStatus === 'pending').length;

  // 科目分布
  const subjectDistribution = wrongQuestions.reduce((acc, q) => {
    if (!acc[q.subject]) {
      acc[q.subject] = { subject: q.subject, subjectName: q.subjectName, count: 0 };
    }
    acc[q.subject].count++;
    return acc;
  }, {} as Record<string, { subject: string; subjectName: string; count: number }>);

  // 错误类型分布
  const errorTypeDistribution = wrongQuestions.reduce((acc, q) => {
    const type = q.errorType || 'other';
    if (!acc[type]) {
      acc[type] = { type, count: 0 };
    }
    acc[type].count++;
    return acc;
  }, {} as Record<string, { type: string; count: number }>);

  // 薄弱知识点（出现次数最多的知识点）
  const knowledgePoints = wrongQuestions.reduce((acc, q) => {
    const kp = q.knowledgePoint;
    if (kp) {
      if (!acc[kp]) {
        acc[kp] = { name: kp, count: 0, subject: q.subjectName };
      }
      acc[kp].count++;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; subject: string }>);

  const weakPoints = Object.values(knowledgePoints)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    code: 0,
    data: {
      totalQuestions,
      solvedQuestions,
      pendingReview,
      masteryRate: totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0,
      subjectDistribution: Object.values(subjectDistribution),
      errorTypeDistribution: Object.values(errorTypeDistribution),
      weakPoints,
    },
  });
});

export default router;
