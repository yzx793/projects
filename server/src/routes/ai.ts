import { Router } from 'express';
import type { Request, Response } from 'express';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { wrongQuestions ,poems} from '../data/mockData.js';

const router = Router();


/**
 * POST /api/v1/ai/chat
 * AI对话接口 - 支持语文诗词和英语对话
 * Body: { message: string, mode: 'chinese' | 'english' }
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, mode = 'chinese' } = req.body;

  if (!message) {
    return res.status(400).json({ code: 400, message: '消息内容不能为空' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const config = new Config();
    const client = new LLMClient(config);

    let systemPrompt = '';
    
    if (mode === 'chinese') {
      // 语文诗词对话模式
      const poemTitles = poems.map(p => p.title).join('、');
      systemPrompt = `你是一位精通中国古诗词的AI助手。
      
当前诗词库包含：${poemTitles}

你的任务：
1. 当用户说出上句诗时，给出下句
2. 当用户问诗词时，提供原文、翻译和赏析
3. 用优美、古典的语言风格回应

请用中文回复。`;
    } else {
      // 英语对话模式
      systemPrompt = `你是一位英语学习助手。
      
你的任务：
1. 用英语与用户对话
2. 实时提供中文翻译
3. 纠正语法错误（如果有的话）
4. 提供单词解释和例句

回复格式：
【英文回复】...
【中文翻译】...`;
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI对话失败，请稍后重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});


/**
 * POST /api/v1/ai/analyze
 * AI分析题目 - SSE流式输出
 * Body: { questionId: number }
 */
router.post('/analyze', async (req: Request, res: Response) => {
  const { questionId } = req.body;

  if (!questionId) {
    return res.status(400).json({
      code: 400,
      message: '题目ID不能为空',
    });
  }

  // 获取题目信息
  const question = wrongQuestions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({
      code: 404,
      message: '题目不存在',
    });
  }

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const config = new Config();
    const client = new LLMClient(config);

    // 构建提示词
    const systemPrompt = `你是一位专业的教育辅导AI助手，擅长为中小学生分析讲解各学科题目。
请按照以下格式分析题目：

## 题目分析
简要分析题目的类型、难度和考查的知识点。

## 解题思路
分步骤讲解解题思路，每步清晰明了。

## 详细解答
给出完整的解题过程和答案。

## 知识拓展
总结相关的知识点和学习建议。

请用通俗易懂的语言，适合学生理解。`;

    const userPrompt = `请分析以下${question.subjectName}题目：

【题目类型】${question.subject === 'math' ? '数学题' : question.subject === 'english' ? '英语题' : question.subject === 'chinese' ? '语文题' : '题目'}
【难度】${question.difficulty}
【题目内容】
${question.question}

【学生答案】${question.userAnswer}
【正确答案】${question.correctAnswer}
【原解析】${question.analysis}

请详细分析并讲解这道题目，帮助学生理解解题思路。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`);
      }
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI分析错误:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI分析失败，请稍后重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

/**
 * POST /api/v1/ai/analyze-image
 * AI分析图片题目 - 支持上传图片进行分析
 * 使用base64图片传给LLM
 */
router.post('/analyze-image', async (req: Request, res: Response) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      code: 400,
      message: '图片数据不能为空',
    });
  }

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的教育辅导AI助手，擅长识别和分析图片中的题目。
请按照以下步骤处理：

1. 首先识别图片中的题目内容
2. 分析题目类型和考查知识点
3. 给出详细的解题思路和步骤
4. 提供完整的答案
5. 总结相关知识点

请用通俗易懂的语言，适合学生理解。`;

    const messages = [
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请识别并分析图片中的题目，给出详细的解题过程和答案。' },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high' as const,
            },
          },
        ],
      },
    ];

    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI图片分析错误:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI分析失败，请稍后重试' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
