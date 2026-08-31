import { Router } from 'express';
import type { Request, Response } from 'express';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { poems, englishWords } from '../data/mockData.js';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const poemCache = new Map<string, any[]>();
const wordCache = new Map<string, any[]>();

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
 * Upload a photo and use AI vision model to identify and solve the question
 */
router.post('/photo', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ code: 400, message: '请上传图片' });
    }

    const imageBase64 = file.buffer.toString('base64');
    const imageUrl = `data:${file.mimetype || 'image/jpeg'};base64,${imageBase64}`;

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的拍照搜题AI助手。用户会上传一张包含题目的图片，你需要：
1. 仔细识别图片中的所有题目
2. 判断每道题的学科（math/chinese/english/physics/chemistry）
3. 给出完整的解题过程和答案

请严格按照以下JSON格式返回（不要返回任何其他内容，不要用markdown代码块包裹）：
{
  "questions": [
    {
      "id": 1,
      "title": "题目的完整文字内容",
      "subject": "math",
      "subjectName": "数学",
      "type": "choice",
      "difficulty": 3,
      "content": "题目的完整描述",
      "options": ["A. ...", "B. ..."],
      "answer": "最终答案",
      "steps": ["步骤1", "步骤2"],
      "analysis": "详细解析说明",
      "knowledgePoints": ["知识点1"]
    }
  ]
}

要求：
- subject 只能是 math/chinese/english/physics/chemistry 之一
- subjectName 对应：数学/语文/英语/物理/化学
- steps 必须有至少2个步骤，逐步详细讲解
- answer 要简洁明确（选择题写选项字母和内容）
- options 选择题填写选项，填空题/计算题设为空数组
- 如果图片中有多道题，都要识别出来
- 如果图片不清晰或无法识别题目，返回空 questions 数组`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请识别并解答图片中的题目' },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
              detail: 'high' as const,
            },
          },
        ],
      },
    ];

    let fullText = '';
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullText += chunk.content.toString();
      }
    }

    console.log('AI raw response length:', fullText.length);

    let parsedQuestions: any[] = [];
    try {
      const cleaned = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsedQuestions = parsed.questions || [];
    } catch {
      console.error('Direct parse failed, trying regex extraction...');
      const jsonMatch = fullText.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedQuestions = parsed.questions || [];
        } catch {
          console.error('Regex extraction also failed');
          parsedQuestions = [];
        }
      }
    }

    const questions = parsedQuestions.map((q: any, idx: number) => ({
      id: q.id || Date.now() + idx,
      title: q.title || '未识别到题目',
      subject: q.subject || 'math',
      subjectName: q.subjectName || '数学',
      type: q.type || 'fill',
      difficulty: q.difficulty || 3,
      content: q.content || q.title || '',
      answer: q.answer || '',
      analysis: q.analysis || '',
      steps: Array.isArray(q.steps) ? q.steps : [],
      options: Array.isArray(q.options) ? q.options : [],
      knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [],
      matchScore: 95,
    }));

    console.log('Parsed questions count:', questions.length);

    res.json({
      code: 0,
      message: 'Search completed',
      data: {
        questions,
        total: questions.length,
      },
    });
  } catch (error) {
    console.error('Photo search error:', error);
    res.status(500).json({ code: 500, message: 'Search failed' });
  }
});

/**
 * POST /api/v1/search/calc-check
 * Upload a photo of oral calculation problems and use AI to check answers
 */
router.post('/calc-check', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ code: 400, message: '请上传图片' });
    }

    const imageBase64 = file.buffer.toString('base64');
    const imageUrl = `data:${file.mimetype || 'image/jpeg'};base64,${imageBase64}`;

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的口算批改AI助手。用户会上传一张包含口算题的图片（通常是小学生口算练习），你需要：

1. 识别图片中每一道口算题（如 "3+5=8", "12-7=5", "6×8=48" 等）
2. 判断每道题学生写的答案是否正确
3. 如果答案错误，给出正确答案

请严格按照以下JSON格式返回（不要返回任何其他内容，不要用markdown代码块包裹）：
{
  "problems": [
    {
      "expression": "3 + 5",
      "userAnswer": "8",
      "correctAnswer": "8",
      "isCorrect": true
    },
    {
      "expression": "12 - 7",
      "userAnswer": "4",
      "correctAnswer": "5",
      "isCorrect": false
    }
  ]
}

要求：
- expression 只写算式部分，不写等号和答案（如 "3 + 5" 而不是 "3 + 5 = 8"）
- userAnswer 是学生写的答案
- correctAnswer 是正确答案
- isCorrect 判断学生答案是否正确
- 如果图片不清晰或无法识别，返回空 problems 数组
- 尽量识别出所有口算题`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请识别并批改图片中的口算题' },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
              detail: 'high' as const,
            },
          },
        ],
      },
    ];

    let fullText = '';
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.2,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullText += chunk.content.toString();
      }
    }

    console.log('Calc check AI raw response length:', fullText.length);

    let parsedProblems: any[] = [];
    try {
      const cleaned = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsedProblems = parsed.problems || [];
    } catch {
      console.error('Direct parse failed, trying regex extraction...');
      const jsonMatch = fullText.match(/\{[\s\S]*"problems"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedProblems = parsed.problems || [];
        } catch {
          console.error('Regex extraction also failed');
          parsedProblems = [];
        }
      }
    }

    const problems = parsedProblems.map((p: any) => ({
      expression: p.expression || '',
      userAnswer: String(p.userAnswer ?? ''),
      correctAnswer: String(p.correctAnswer ?? ''),
      isCorrect: !!p.isCorrect,
    }));

    const total = problems.length;
    const correct = problems.filter((p: any) => p.isCorrect).length;
    const wrong = total - correct;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    console.log('Calc check result:', { total, correct, wrong, score });

    res.json({
      code: 0,
      message: 'Calc check completed',
      data: {
        total,
        correct,
        wrong,
        problems,
        score,
      },
    });
  } catch (error) {
    console.error('Calc check error:', error);
    res.status(500).json({ code: 500, message: 'Calc check failed' });
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
router.get('/poem', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.json({ code: 0, data: [] });
    }

    const kw = String(keyword);

    const localResults = poems.filter(poem =>
      poem.title.includes(kw) ||
      poem.author.includes(kw) ||
      poem.content.some(line => line.includes(kw))
    ).map(poem => ({
      id: poem.id,
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      content: poem.content,
      translation: poem.translation,
      explanation: poem.explanation,
      tags: poem.tags,
      storyScenes: [] as any[],
      source: 'local' as const,
    }));

    if (localResults.length > 0) {
      const config = new Config();
      const client = new LLMClient(config);
      
      const enrichedResults = await Promise.all(localResults.map(async (poem) => {
        if (poem.storyScenes && poem.storyScenes.length > 0) return poem;
        
        const cacheKey = `story-${poem.title}`;
        const cached = poemCache.get(cacheKey);
        if (cached) {
          return { ...poem, storyScenes: cached[0]?.storyScenes || [] };
        }

        try {
          const storyPrompt = `你是一位古诗词动漫导演。请为"${poem.title}"（${poem.author}）创建一个动漫场景脚本。

请严格按照以下JSON格式返回（不要返回其他内容）：
[
  {"emoji": "场景代表emoji", "narration": "场景旁白文字（20字以内）", "bgColor": "深色背景hex值"}
]

要求：
- 4-6个场景
- emoji要能代表场景画面（如🌙🛏️🏔️💧🏠等）
- narration像动漫旁白，生动有画面感
- bgColor用深色系hex值营造古典氛围（如#1a1a2e, #16213e, #0f3460, #533483等）`;
          
          let storyText = '';
          const stream = client.stream([
            { role: 'system' as const, content: storyPrompt },
            { role: 'user' as const, content: `${poem.title}\n${poem.content.join('\n')}` },
          ], { model: 'doubao-seed-2-0-lite-260215', temperature: 0.7 });

          for await (const chunk of stream) {
            if (chunk.content) storyText += chunk.content.toString();
          }

          let scenes: any[] = [];
          try {
            const jsonMatch = storyText.match(/\[[\s\S]*\]/);
            if (jsonMatch) scenes = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse poem scenes:', e);
          }

          poemCache.set(cacheKey, [{ storyScenes: scenes }]);
          return { ...poem, storyScenes: scenes };
        } catch (e) {
          console.error('Failed to generate story for poem:', e);
          return poem;
        }
      }));

      return res.json({ code: 0, data: enrichedResults });
    }

    const cacheKey = `search-${kw}`;
    const cached = poemCache.get(cacheKey);
    if (cached) {
      return res.json({ code: 0, data: cached });
    }

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位精通中国古诗词的AI助手，擅长用生动有趣的方式讲解诗词。用户会输入诗词标题、作者名或诗句，请返回相关的诗词信息。

请严格按照以下JSON格式返回（不要返回其他内容）：
[
  {
    "title": "诗词标题",
    "author": "作者",
    "dynasty": "朝代",
    "content": ["第一句", "第二句", ...],
    "translation": ["第一句译文", "第二句译文", ...],
    "explanation": "赏析",
    "tags": ["标签1", "标签2"],
    "storyScenes": [
      {"emoji": "场景代表emoji", "narration": "场景旁白（20字以内）", "bgColor": "深色背景hex值"}
    ]
  }
]

storyScenes要求：4-6个场景，emoji代表画面，narration像动漫旁白有画面感，bgColor用深色系营造古典氛围。storyScenes必须填写。
如果有多首相关诗词，返回多首。如果找不到相关诗词，返回空数组 []。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: kw },
    ];

    let fullText = '';
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullText += chunk.content.toString();
      }
    }

    let results: any[] = [];
    try {
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse poem results:', e);
    }

    results = results.map((item: any, index: number) => ({
      id: index + 1,
      ...item,
      source: 'llm',
    }));

    poemCache.set(cacheKey, results);
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
  res.status(404).json({ code: 404, message: '请使用搜索接口查询诗词' });
});

/**
 * GET /api/v1/search/word
 * 搜索英语单词
 * Query: keyword - 单词
 */
router.get('/word', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.json({ code: 0, data: [] });
    }

    const kw = String(keyword).toLowerCase();

    const localResults = englishWords.filter(word =>
      word.word.toLowerCase().includes(kw) ||
      word.meaning.includes(kw)
    ).map(word => {
      const conjugation: any = {};
      if (word.forms.past || word.forms.presentParticiple) {
        conjugation.verb = {
          present: word.word,
          past: word.forms.past || '',
          pastParticiple: word.forms.pastParticiple || '',
          ing: word.forms.presentParticiple || '',
        };
      }
      if (word.forms.comparative || word.forms.superlative) {
        conjugation.adjective = {
          comparative: word.forms.comparative || '',
          superlative: word.forms.superlative || '',
        };
      }
      return {
        id: word.id,
        word: word.word,
        phonetic: word.phonetic,
        partOfSpeech: word.partOfSpeech,
        translation: word.meaning,
        example: word.examples[0] || '',
        exampleTranslation: word.translationExamples?.[0] || '',
        explanation: word.explanation,
        storyScenes: [] as any[],
        conjugation: Object.keys(conjugation).length > 0 ? conjugation : undefined,
        source: 'local' as const,
      };
    });

    if (localResults.length > 0) {
      const config = new Config();
      const client = new LLMClient(config);

      const enrichedResults = await Promise.all(localResults.map(async (word) => {
        if (word.storyScenes && word.storyScenes.length > 0) return word;

        const cacheKey = `story-${word.word}`;
        const cached = wordCache.get(cacheKey);
        if (cached) {
          return { ...word, storyScenes: cached[0]?.storyScenes || [] };
        }

        try {
          const storyPrompt = `你是一位英语动漫导演。请为单词"${word.word}"（${word.translation}）创建一个动漫场景脚本。

请严格按照以下JSON格式返回（不要返回其他内容）：
[
  {"emoji": "场景代表emoji", "narration": "场景旁白（20字以内）", "bgColor": "温暖背景hex值"}
]

要求：
- 3-5个场景
- emoji要能代表场景画面
- narration像动漫旁白，展示单词用法，生动有画面感
- bgColor用温暖色系hex值（如#2d3436, #6c5ce7, #00b894, #e17055等）`;

          let storyText = '';
          const stream = client.stream([
            { role: 'system' as const, content: storyPrompt },
            { role: 'user' as const, content: `${word.word}: ${word.translation}. Example: ${word.example}` },
          ], { model: 'doubao-seed-2-0-lite-260215', temperature: 0.7 });

          for await (const chunk of stream) {
            if (chunk.content) storyText += chunk.content.toString();
          }

          let scenes: any[] = [];
          try {
            const jsonMatch = storyText.match(/\[[\s\S]*\]/);
            if (jsonMatch) scenes = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse word scenes:', e);
          }

          wordCache.set(cacheKey, [{ storyScenes: scenes }]);
          return { ...word, storyScenes: scenes };
        } catch (e) {
          console.error('Failed to generate story for word:', e);
          return word;
        }
      }));

      return res.json({ code: 0, data: enrichedResults });
    }

    const cacheKey = `search-${kw}`;
    const cached = wordCache.get(cacheKey);
    if (cached) {
      return res.json({ code: 0, data: cached });
    }

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的英语教学助手，擅长用生动有趣、像动漫角色一样的方式讲解单词。用户会输入一个英语单词，请返回该单词的详细信息。

请严格按照以下JSON格式返回（不要返回其他内容）：
[
  {
    "word": "单词",
    "phonetic": "音标",
    "partOfSpeech": "词性",
    "translation": "中文释义",
    "example": "例句（英文）",
    "exampleTranslation": "例句中文翻译",
    "explanation": "详细讲解",
    "storyScenes": [
      {"emoji": "场景代表emoji", "narration": "场景旁白（20字以内）", "bgColor": "温暖背景hex值"}
    ],
    "conjugation": {
      "verb": { "present": "现在时", "past": "过去时", "pastParticiple": "过去分词", "ing": "进行时" },
      "adjective": { "comparative": "比较级", "superlative": "最高级" }
    }
  }
]

storyScenes要求：3-5个场景，emoji代表画面，narration像动漫旁白展示单词用法，bgColor用温暖色系。storyScenes和exampleTranslation必须填写。
如果是动词就提供verb变形，如果是形容词就提供adjective变形，都可以不提供或都提供。如果找不到相关单词，返回空数组 []。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: kw },
    ];

    let fullText = '';
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullText += chunk.content.toString();
      }
    }

    let results: any[] = [];
    try {
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse word results:', e);
    }

    results = results.map((item: any, index: number) => ({
      id: index + 1,
      ...item,
      source: 'llm',
    }));

    wordCache.set(cacheKey, results);
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
  res.status(404).json({ code: 404, message: '请使用搜索接口查询单词' });
});

export default router;