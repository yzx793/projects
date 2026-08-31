import { Router } from 'express';
import type { Request, Response } from 'express';
import { LLMClient, Config, TTSClient, ASRClient } from 'coze-coding-dev-sdk';
import multer from 'multer';
import { queryAll, queryOne } from '../db/helpers.js';
import { getDbType } from '../db/index.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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
router.get('/words', async (req: Request, res: Response) => {
  try {
    const { grade = 'middle' } = req.query;
    
    const words = await queryAll('SELECT * FROM vocabulary WHERE grade = ? ORDER BY RANDOM() LIMIT 5', [grade]);
    
    res.json({
      code: 0,
      data: {
        words: words.map(w => ({
          word: w.word,
          meaning: w.meaning,
          difficulty: w.difficulty,
          phonetic: w.phonetic,
          example: w.example,
        })),
      },
    });
  } catch (error) {
    console.error('Get vocab words error:', error);
    res.status(500).json({ code: 500, message: '获取单词失败' });
  }
});

/**
 * POST /api/v1/vocab-chat/start
 * 开始新的对话会话
 * Body: { words: string[] }
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ code: 400, message: '单词列表不能为空' });
    }
    
    const sessionId = `session_${Date.now()}`;
    
    userLearningRecords.set(sessionId, {
      words,
      masteredWords: [],
      wrongWords: [],
      conversationHistory: [],
    });
    
    // Fetch vocabulary from database (works with both SQLite and PostgreSQL)
    const vocabResults = await Promise.all(
      words.map(async (w) => {
        const vocab = await queryOne('SELECT * FROM vocabulary WHERE word = ?', [w]);
        if (vocab) {
          return `${vocab.word} (${vocab.meaning})`;
        }
        return w;
      })
    );
    const wordList = vocabResults.join('、');
    
    const systemPrompt = `# Role
你是一位幽默、有耐心的英语口语外教。你的任务是通过【情景对话】的方式，帮助学生快速记住并掌握今天给定的【目标单词】。

# Task
1. 每次对话开始前，接收系统传入的 3-5 个【目标单词】及其释义。
2. 设定一个与这些单词强相关的日常情景（如点餐、旅游、职场、超市购物等），主动向学生抛出问题，引导对话。
3. 在你的回复中，必须自然地使用至少 1 个目标单词，并用加粗标出（如 **apple**）。
4. 引导学生在接下来的回复中，必须尝试使用剩余的【目标单词】来回答你。

# Constraint
1. 每次回复保持在 3 句话以内，语言地道、简单易懂（匹配学生的学段）。
2. 如果学生拼写错误、语法错误，或者没有使用目标单词，请先温柔地纠正，然后鼓励他们再试一次。
3. 当所有【目标单词】都被学生正确使用过一次后，主动结束本次情景对话，并给出一段简短的夸奖和总结。

# 今天的目标单词
${wordList}

# 回复格式要求
- 第一行是英文回复（目标单词用**加粗**标出）
- 第二行以【翻译】开头，给出中文翻译
- 如果学生正确使用了目标单词，在回复末尾加上【掌握:单词】（每个正确使用的单词单独标记）
- 如果学生用错了单词，在回复末尾加上【纠正:错误单词->正确单词】
- 当所有单词都被掌握后，在回复末尾加上【对话结束】

# 开场白
现在，请用一句友好的开场白开始对话，介绍今天需要学习的单词，并设定一个有趣的情景。`;

    const record = userLearningRecords.get(sessionId);
    if (record) {
      record.conversationHistory.push({ role: 'system', content: systemPrompt });
    }
    
    res.json({
      code: 0,
      data: { sessionId, systemPrompt },
    });
  } catch (error) {
    console.error('Start vocab chat error:', error);
    res.status(500).json({ code: 500, message: '开始对话失败' });
  }
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
  
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  try {
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
    
    record.conversationHistory.push({ role: 'assistant', content: fullResponse });
    
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
    
    const isConversationEnd = fullResponse.includes('【对话结束】');
    
    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      masteredWords: record.masteredWords,
      wrongWords: record.wrongWords,
      conversationEnd: isConversationEnd,
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
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ code: 400, message: '会话ID不能为空' });
    }
    
    const record = userLearningRecords.get(sessionId);
    if (!record) {
      return res.status(404).json({ code: 404, message: '会话不存在' });
    }
    
    const totalWords = record.words.length;
    const masteredCount = record.masteredWords.length;
    const wrongCount = record.wrongWords.length;
    const masteryRate = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    
    const report = {
      sessionId,
      totalWords,
      masteredWords: record.masteredWords,
      wrongWords: record.wrongWords,
      masteryRate,
      conversationRounds: Math.floor(record.conversationHistory.filter(m => m.role === 'user').length),
      timestamp: new Date().toISOString(),
    };
    
    userLearningRecords.delete(sessionId);
    
    res.json({
      code: 0,
      data: report,
    });
  } catch (error) {
    console.error('Settle vocab chat error:', error);
    res.status(500).json({ code: 500, message: '结算失败' });
  }
});

export default router;