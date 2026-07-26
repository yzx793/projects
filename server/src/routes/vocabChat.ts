import { Router } from 'express';
import type { Request, Response } from 'express';
import { LLMClient, Config, TTSClient, ASRClient } from 'coze-coding-dev-sdk';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// 单词库 - 按年级和难度分类
const vocabularyBank = [
  // 小学常用单词
  { word: 'apple', meaning: '苹果', grade: 'elementary', difficulty: 'easy' },
  { word: 'banana', meaning: '香蕉', grade: 'elementary', difficulty: 'easy' },
  { word: 'cat', meaning: '猫', grade: 'elementary', difficulty: 'easy' },
  { word: 'dog', meaning: '狗', grade: 'elementary', difficulty: 'easy' },
  { word: 'elephant', meaning: '大象', grade: 'elementary', difficulty: 'easy' },
  { word: 'friend', meaning: '朋友', grade: 'elementary', difficulty: 'easy' },
  { word: 'happy', meaning: '快乐的', grade: 'elementary', difficulty: 'easy' },
  { word: 'school', meaning: '学校', grade: 'elementary', difficulty: 'easy' },
  { word: 'teacher', meaning: '老师', grade: 'elementary', difficulty: 'easy' },
  { word: 'water', meaning: '水', grade: 'elementary', difficulty: 'easy' },
  // 初中常用单词
  { word: 'adventure', meaning: '冒险', grade: 'middle', difficulty: 'medium' },
  { word: 'beautiful', meaning: '美丽的', grade: 'middle', difficulty: 'medium' },
  { word: 'celebrate', meaning: '庆祝', grade: 'middle', difficulty: 'medium' },
  { word: 'dangerous', meaning: '危险的', grade: 'middle', difficulty: 'medium' },
  { word: 'environment', meaning: '环境', grade: 'middle', difficulty: 'medium' },
  { word: 'important', meaning: '重要的', grade: 'middle', difficulty: 'medium' },
  { word: 'knowledge', meaning: '知识', grade: 'middle', difficulty: 'medium' },
  { word: 'mountain', meaning: '山', grade: 'middle', difficulty: 'medium' },
  { word: 'practice', meaning: '练习', grade: 'middle', difficulty: 'medium' },
  { word: 'wonderful', meaning: '精彩的', grade: 'middle', difficulty: 'medium' },
  // 高中常用单词
  { word: 'accomplish', meaning: '完成，实现', grade: 'high', difficulty: 'hard' },
  { word: 'brilliant', meaning: '杰出的，灿烂的', grade: 'high', difficulty: 'hard' },
  { word: 'comprehensive', meaning: '综合的，全面的', grade: 'high', difficulty: 'hard' },
  { word: 'demonstrate', meaning: '证明，演示', grade: 'high', difficulty: 'hard' },
  { word: 'enthusiasm', meaning: '热情，热忱', grade: 'high', difficulty: 'hard' },
  { word: 'fundamental', meaning: '基本的，根本的', grade: 'high', difficulty: 'hard' },
  { word: 'generate', meaning: '产生，生成', grade: 'high', difficulty: 'hard' },
  { word: 'hypothesis', meaning: '假设，假说', grade: 'high', difficulty: 'hard' },
  { word: 'innovative', meaning: '创新的', grade: 'high', difficulty: 'hard' },
  { word: 'perspective', meaning: '观点，视角', grade: 'high', difficulty: 'hard' },
];

// 存储用户的学习记录（内存中，实际应该用数据库）
const userLearningRecords: Map<string, {
  words: string[];
  masteredWords: string[];
  wrongWords: string[];
  conversationHistory: Array<{ role: string; content: string }>;
}> = new Map();

/**
 * GET /api/v1/vocab-chat/words
 * 获取今日需要学习的5个单词
 * Query: grade?: 'elementary' | 'middle' | 'high'
 */
router.get('/words', (req: Request, res: Response) => {
  const { grade = 'middle' } = req.query;
  
  // 根据年级筛选单词
  const filteredWords = vocabularyBank.filter(w => w.grade === grade);
  
  // 随机选择5个单词
  const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, 5);
  
  res.json({
    code: 0,
    data: {
      words: selectedWords.map(w => ({
        word: w.word,
        meaning: w.meaning,
        difficulty: w.difficulty,
      })),
    },
  });
});

/**
 * POST /api/v1/vocab-chat/start
 * 开始新的对话会话
 * Body: { words: string[] }
 */
router.post('/start', (req: Request, res: Response) => {
  const { words } = req.body;
  
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ code: 400, message: '单词列表不能为空' });
  }
  
  const sessionId = `session_${Date.now()}`;
  
  // 初始化学习记录
  userLearningRecords.set(sessionId, {
    words,
    masteredWords: [],
    wrongWords: [],
    conversationHistory: [],
  });
  
  // 生成系统提示词
  const wordList = words.map(w => {
    const vocab = vocabularyBank.find(v => v.word.toLowerCase() === w.toLowerCase());
    return vocab ? `${vocab.word} (${vocab.meaning})` : w;
  }).join('、');
  
  const systemPrompt = `你是一位友善的英语老师，正在帮助学生练习英语单词。

今天需要掌握的单词是：${wordList}

你的任务：
1. 用简单易懂的英语与学生对话
2. 在对话中自然地使用今天的目标单词
3. 当学生使用正确的单词时，给予鼓励
4. 当学生用错单词时，温和地纠正
5. 每次回复控制在2-3句话，保持对话节奏

回复格式要求：
- 第一行是英文回复
- 第二行以【翻译】开头，给出中文翻译
- 如果学生正确使用了目标单词，在回复末尾加上【掌握:单词】
- 如果学生用错了单词，在回复末尾加上【纠正:错误单词->正确单词】

现在，请用一句友好的开场白开始对话，介绍今天需要学习的单词。`;

  const record = userLearningRecords.get(sessionId);
  if (record) {
    record.conversationHistory.push({ role: 'system', content: systemPrompt });
  }
  
  res.json({
    code: 0,
    data: { sessionId, systemPrompt },
  });
});

/**
 * POST /api/v1/vocab-chat/message
 * 发送消息给AI老师 - SSE流式输出
 * Body: { sessionId: string, message: string }
 */
router.post('/message', async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;
  
  if (!sessionId || !message) {
    return res.status(400).json({ code: 400, message: '会话ID和消息不能为空' });
  }
  
  const record = userLearningRecords.get(sessionId);
  if (!record) {
    return res.status(404).json({ code: 404, message: '会话不存在' });
  }
  
  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  try {
    // 添加用户消息到历史
    record.conversationHistory.push({ role: 'user' as const, content: message });
    
    const config = new Config();
    const client = new LLMClient(config);
    
    const stream = client.stream(record.conversationHistory as any, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      if (chunk.content) {
        const content = chunk.content.toString();
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    // 添加AI回复到历史
    record.conversationHistory.push({ role: 'assistant', content: fullResponse });
    
    // 解析掌握和纠正的单词
    const masteredMatch = fullResponse.match(/【掌握:([^】]+)】/g);
    if (masteredMatch) {
      masteredMatch.forEach(match => {
        const word = match.replace(/【掌握:|】/g, '');
        if (!record.masteredWords.includes(word.toLowerCase())) {
          record.masteredWords.push(word.toLowerCase());
        }
      });
    }
    
    const correctedMatch = fullResponse.match(/【纠正:([^->]+)->([^】]+)】/g);
    if (correctedMatch) {
      correctedMatch.forEach(match => {
        const parts = match.replace(/【纠正:|】/g, '').split('->');
        if (parts.length === 2) {
          const wrongWord = parts[0].trim().toLowerCase();
          if (!record.wrongWords.includes(wrongWord)) {
            record.wrongWords.push(wrongWord);
          }
        }
      });
    }
    
    // 发送掌握状态更新
    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      masteredWords: record.masteredWords,
      wrongWords: record.wrongWords,
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Vocab chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI对话失败，请稍后重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

/**
 * POST /api/v1/vocab-chat/tts
 * 文字转语音
 * Body: { text: string, speaker?: string }
 */
router.post('/tts', async (req: Request, res: Response) => {
  const { text, speaker = 'zh_female_vv_uranus_bigtts' } = req.body;
  
  if (!text) {
    return res.status(400).json({ code: 400, message: '文本不能为空' });
  }
  
  try {
    const config = new Config();
    const client = new TTSClient(config);
    
    const response = await client.synthesize({
      uid: `user_${Date.now()}`,
      text,
      speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
    });
    
    res.json({
      code: 0,
      data: {
        audioUrl: response.audioUri,
        audioSize: response.audioSize,
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ code: 500, message: '语音合成失败' });
  }
});

/**
 * POST /api/v1/vocab-chat/asr
 * 语音转文字
 * Body: FormData with audio file
 */
router.post('/asr', upload.single('audio'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '音频文件不能为空' });
  }
  
  try {
    const config = new Config();
    const client = new ASRClient(config);
    
    // 将音频转换为base64
    const audioBase64 = req.file.buffer.toString('base64');
    
    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      base64Data: audioBase64,
    });
    
    res.json({
      code: 0,
      data: {
        text: result.text,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error('ASR error:', error);
    res.status(500).json({ code: 500, message: '语音识别失败' });
  }
});

/**
 * POST /api/v1/vocab-chat/settle
 * 结算对话，保存学习记录
 * Body: { sessionId: string }
 */
router.post('/settle', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ code: 400, message: '会话ID不能为空' });
  }
  
  const record = userLearningRecords.get(sessionId);
  if (!record) {
    return res.status(404).json({ code: 404, message: '会话不存在' });
  }
  
  // 计算学习结果
  const totalWords = record.words.length;
  const masteredCount = record.masteredWords.length;
  const wrongCount = record.wrongWords.length;
  const masteryRate = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  
  // 生成学习报告
  const report = {
    sessionId,
    totalWords,
    masteredWords: record.masteredWords,
    wrongWords: record.wrongWords,
    masteryRate,
    conversationRounds: Math.floor(record.conversationHistory.filter(m => m.role === 'user').length),
    timestamp: new Date().toISOString(),
  };
  
  // 清理会话记录
  userLearningRecords.delete(sessionId);
  
  res.json({
    code: 0,
    data: report,
  });
});

export default router;
