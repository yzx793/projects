import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Mock data for export (in real app, this would query from database)
const allQuestions: Record<number, any> = {
  101: {
    id: 101,
    title: '已知函数f(x)=x²+2x+1，求f(x)的最小值',
    subject: 'math',
    subjectName: '数学',
    type: 'fill',
    difficulty: 3,
    content: '已知函数f(x)=x²+2x+1，求f(x)的最小值。',
    answer: 'f(x) = (x+1)²，当x=-1时，f(x)取得最小值0',
    analysis: '将二次函数化为顶点式：f(x) = x² + 2x + 1 = (x+1)²。因为(x+1)²≥0，所以当x=-1时，f(x)取最小值0。',
    knowledgePoints: ['二次函数', '顶点式', '最值问题'],
  },
  102: {
    id: 102,
    title: '下列词语中加点字的读音完全正确的一项是',
    subject: 'chinese',
    subjectName: '语文',
    type: 'choice',
    difficulty: 2,
    content: '下列词语中加点字的读音完全正确的一项是（）\nA. 酝酿(niàng)  黄晕(yūn)  抖擞(sǒu)\nB. 着落(zhuó)  贮蓄(zhù)  澄清(chéng)\nC. 粗犷(kuàng)  静谧(mì)  莅临(lì)\nD. 憔悴(cuì)  匿笑(nì)  祷告(dǎo)',
    answer: 'B',
    analysis: 'A项"晕"应读yùn；C项"犷"应读guǎng；D项全部正确但题目要求选"完全正确"，B项更规范。',
    knowledgePoints: ['字音', '词语辨析'],
  },
  103: {
    id: 103,
    title: 'The teacher asked us _______ late for class.',
    subject: 'english',
    subjectName: '英语',
    type: 'choice',
    difficulty: 2,
    content: 'The teacher asked us _______ late for class.\nA. not to be\nB. don\'t be\nC. not be\nD. to not be',
    answer: 'A',
    analysis: 'ask sb not to do sth 是固定搭配，意为"要求某人不要做某事"。not 要放在 to 前面。',
    knowledgePoints: ['不定式', '固定搭配', '动词用法'],
  },
  104: {
    id: 104,
    title: '一个物体从高处自由下落，求下落3秒后的速度',
    subject: 'physics',
    subjectName: '物理',
    type: 'fill',
    difficulty: 3,
    content: '一个物体从高处自由下落（不计空气阻力，g取10m/s²），求下落3秒后的速度和下落的高度。',
    answer: '速度v=gt=10×3=30m/s，高度h=½gt²=½×10×9=45m',
    analysis: '自由落体运动公式：v=gt，h=½gt²。代入g=10m/s²，t=3s即可求解。',
    knowledgePoints: ['自由落体', '运动学公式', '重力加速度'],
  },
};

/**
 * GET /api/v1/export/:ids
 * Export questions as formatted document
 * ids: comma-separated question IDs (e.g., "101,102,103")
 * Query: format?: 'text' | 'markdown' (default: 'text')
 */
router.get('/:ids', async (req: Request, res: Response) => {
  try {
    const idsStr = String(req.params.ids);
    const format = (req.query.format as string) || 'text';
    const ids = idsStr.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));

    if (ids.length === 0) {
      return res.status(400).json({ code: 400, message: 'No valid question IDs provided' });
    }

    const questions = ids.map(id => allQuestions[id]).filter(Boolean);

    if (questions.length === 0) {
      return res.status(404).json({ code: 404, message: 'No questions found' });
    }

    let document: string;
    let contentType: string;
    let filename: string;

    if (format === 'markdown') {
      // Generate markdown document
      document = generateMarkdown(questions);
      contentType = 'text/markdown';
      filename = `questions_${Date.now()}.md`;
    } else {
      // Generate plain text document
      document = generatePlainText(questions);
      contentType = 'text/plain; charset=utf-8';
      filename = `questions_${Date.now()}.txt`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(document);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ code: 500, message: 'Failed to export questions' });
  }
});

/**
 * GET /api/v1/export/preview/:ids
 * Preview questions as formatted document (returns JSON instead of download)
 */
router.get('/preview/:ids', async (req: Request, res: Response) => {
  try {
    const idsStr = String(req.params.ids);
    const ids = idsStr.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));

    if (ids.length === 0) {
      return res.status(400).json({ code: 400, message: 'No valid question IDs provided' });
    }

    const questions = ids.map(id => allQuestions[id]).filter(Boolean);

    if (questions.length === 0) {
      return res.status(404).json({ code: 404, message: 'No questions found' });
    }

    const markdown = generateMarkdown(questions);
    const plainText = generatePlainText(questions);

    res.json({
      code: 0,
      data: {
        questions,
        markdown,
        plainText,
        total: questions.length,
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ code: 500, message: 'Failed to preview questions' });
  }
});

function generatePlainText(questions: any[]): string {
  const lines: string[] = [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  lines.push('='.repeat(60));
  lines.push('                    狸米新启航 - 题目导出');
  lines.push(`                    导出日期：${dateStr}`);
  lines.push('='.repeat(60));
  lines.push('');

  questions.forEach((q, index) => {
    lines.push(`【第${index + 1}题】${q.subjectName} - ${q.title}`);
    lines.push('-'.repeat(40));
    lines.push(`难度：${'★'.repeat(q.difficulty)}${'☆'.repeat(5 - q.difficulty)}`);
    lines.push(`类型：${q.type === 'choice' ? '选择题' : '填空题'}`);
    lines.push(`知识点：${q.knowledgePoints.join('、')}`);
    lines.push('');
    lines.push('【题目内容】');
    lines.push(q.content);
    lines.push('');
    lines.push('【参考答案】');
    lines.push(q.answer);
    lines.push('');
    lines.push('【解析】');
    lines.push(q.analysis);
    lines.push('');
    lines.push('');
  });

  lines.push('='.repeat(60));
  lines.push(`共 ${questions.length} 道题`);
  lines.push('');
  lines.push('本内容由狸米新启航APP导出');
  lines.push('坚持学习，每天进步一点点！');

  return lines.join('\n');
}

function generateMarkdown(questions: any[]): string {
  const lines: string[] = [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  lines.push('# 狸米新启航 - 题目导出');
  lines.push('');
  lines.push(`> 导出日期：${dateStr} | 共 ${questions.length} 道题`);
  lines.push('');
  lines.push('---');
  lines.push('');

  questions.forEach((q, index) => {
    lines.push(`## 第${index + 1}题：${q.title}`);
    lines.push('');
    lines.push(`**学科**：${q.subjectName} | **难度**：${'★'.repeat(q.difficulty)}${'☆'.repeat(5 - q.difficulty)} | **类型**：${q.type === 'choice' ? '选择题' : '填空题'}`);
    lines.push('');
    lines.push(`**知识点**：${q.knowledgePoints.join('、')}`);
    lines.push('');
    lines.push('### 题目内容');
    lines.push('');
    lines.push('```');
    lines.push(q.content);
    lines.push('```');
    lines.push('');
    lines.push('### 参考答案');
    lines.push('');
    lines.push(`> ${q.answer}`);
    lines.push('');
    lines.push('### 解析');
    lines.push('');
    lines.push(q.analysis);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('*本内容由狸米新启航APP导出*');

  return lines.join('\n');
}

export default router;
