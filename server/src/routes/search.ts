import { Router } from 'express';
import type { Request, Response } from 'express';
import { poems, englishWords } from '../data/mockData.js'; 
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Mock question database for search results
const mockQuestions = [
  {
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
    source: '拍照搜题',
    createdAt: new Date().toISOString(),
    solved: false,
  },
  {
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
    source: '拍照搜题',
    createdAt: new Date().toISOString(),
    solved: false,
  },
  {
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
    source: '拍照搜题',
    createdAt: new Date().toISOString(),
    solved: false,
  },
  {
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
    source: '拍照搜题',
    createdAt: new Date().toISOString(),
    solved: false,
  },
];

/**
 * POST /api/v1/search/photo
 * Upload a photo and search for matching questions
 */
router.post('/photo', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // In a real app, this would use OCR/AI to analyze the image
    // For now, return mock search results
    const results = mockQuestions.map(q => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      subjectName: q.subjectName,
      type: q.type,
      difficulty: q.difficulty,
      matchScore: Math.floor(Math.random() * 20 + 80), // 80-100% match
    }));

    res.json({
      code: 0,
      message: 'Search completed',
      data: {
        questions: results,
        total: results.length,
      },
    });
  } catch (error) {
    console.error('Photo search error:', error);
    res.status(500).json({ code: 500, message: 'Search failed' });
  }
});

/**
 * GET /api/v1/search/question/:id
 * Get full question details by ID
 */
router.get('/question/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const question = mockQuestions.find(q => q.id === id);
    
    if (!question) {
      return res.status(404).json({ code: 404, message: 'Question not found' });
    }

    res.json({
      code: 0,
      data: question,
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ code: 500, message: 'Failed to get question' });
  }
});

/**
 * GET /api/v1/search/poem
 * 搜索古诗词
 * Query: keyword - 诗词标题或作者
 */
router.get('/poem', (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.json({ code: 0, data: poems });
    }
    
    const results = poems.filter(poem => 
      poem.title.includes(String(keyword)) || 
      poem.author.includes(String(keyword))
    );
    
    res.json({ code: 0, data: results });
  } catch (error) {
    console.error('Poem search error:', error);
    res.status(500).json({ code: 500, message: 'Search failed' });
  }
});

/**
 * GET /api/v1/search/poem/:id
 * 获取诗词详情
 */
router.get('/poem/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const poem = poems.find(p => p.id === id);
    
    if (!poem) {
      return res.status(404).json({ code: 404, message: '诗词不存在' });
    }
    
    res.json({ code: 0, data: poem });
  } catch (error) {
    console.error('Get poem error:', error);
    res.status(500).json({ code: 500, message: 'Failed to get poem' });
  }
});

/**
 * GET /api/v1/search/word
 * 搜索英语单词
 * Query: keyword - 单词
 */
router.get('/word', (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.json({ code: 0, data: englishWords });
    }
    
    const results = englishWords.filter(word => 
      word.word.toLowerCase().includes(String(keyword).toLowerCase())
    );
    
    res.json({ code: 0, data: results });
  } catch (error) {
    console.error('Word search error:', error);
    res.status(500).json({ code: 500, message: 'Search failed' });
  }
});

/**
 * GET /api/v1/search/word/:id
 * 获取单词详情
 */
router.get('/word/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const word = englishWords.find(w => w.id === id);
    
    if (!word) {
      return res.status(404).json({ code: 404, message: '单词不存在' });
    }
    
    res.json({ code: 0, data: word });
  } catch (error) {
    console.error('Get word error:', error);
    res.status(500).json({ code: 500, message: 'Failed to get word' });
  }
});

export default router;
