import { Router } from 'express';
import { vocabBooks, editions, stages, vocabTypes } from '../data/vocabBooks.js';
import axios from 'axios';

const router = Router();

// GET /api/v1/vocab/books - 获取词书列表
router.get('/books', (_req, res) => {
  const bookList = vocabBooks.map(b => ({
    id: b.id,
    name: b.name,
    edition: b.edition,
    stage: b.stage,
    grade: b.grade,
    semester: b.semester,
    type: b.type,
    wordCount: b.wordCount,
  }));
  res.json({ success: true, data: bookList });
});

// GET /api/v1/vocab/books/:bookId - 获取词书详情（含单词列表）
router.get('/books/:bookId', (req, res) => {
  const book = vocabBooks.find(b => b.id === req.params.bookId);
  if (!book) {
    res.status(404).json({ success: false, error: '词书不存在' });
    return;
  }
  res.json({ success: true, data: book });
});

// GET /api/v1/vocab/books/:bookId/words - 获取词书中的单词
router.get('/books/:bookId/words', (req, res) => {
  const book = vocabBooks.find(b => b.id === req.params.bookId);
  if (!book) {
    res.status(404).json({ success: false, error: '词书不存在' });
    return;
  }
  res.json({ success: true, data: book.words });
});

// GET /api/v1/vocab/editions - 获取版本列表
router.get('/editions', (_req, res) => {
  res.json({ success: true, data: editions });
});

// GET /api/v1/vocab/stages - 获取学段列表
router.get('/stages', (_req, res) => {
  res.json({ success: true, data: stages });
});

// GET /api/v1/vocab/types - 获取词书类型列表
router.get('/types', (_req, res) => {
  res.json({ success: true, data: vocabTypes });
});

// GET /api/v1/vocab/dictionary/:word - 查询单词详情（调用 Free Dictionary API）
router.get('/dictionary/:word', async (req, res) => {
  try {
    const word = req.params.word.toLowerCase();
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { timeout: 5000 }
    );
    const data = response.data;
    if (!data || data.length === 0) {
      res.json({ success: false, error: '未找到该单词' });
      return;
    }
    const entry = data[0];
    const result = {
      word: entry.word,
      phonetic: entry.phonetic || '',
      phonetics: (entry.phonetics || [])
        .filter((p: { text?: string }) => p.text)
        .map((p: { text: string; audio?: string }) => ({
          text: p.text,
          audio: p.audio || '',
        })),
      meanings: (entry.meanings || []).map((m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.slice(0, 3).map((d: { definition: string; example?: string }) => ({
          definition: d.definition,
          example: d.example || '',
        })),
      })),
    };
    res.json({ success: true, data: result });
  } catch (error) {
    // 如果 Free Dictionary API 不可用，返回本地数据
    const word = req.params.word.toLowerCase();
    const localBook = vocabBooks.find(b => b.words.some(w => w.word.toLowerCase() === word));
    if (localBook) {
      const localWord = localBook.words.find(w => w.word.toLowerCase() === word);
      if (localWord) {
        res.json({
          success: true,
          data: {
            word: localWord.word,
            phonetic: localWord.phonetic,
            phonetics: [],
            meanings: [{
              partOfSpeech: localWord.pos,
              definitions: [{
                definition: localWord.meaning,
                example: localWord.example || '',
              }],
            }],
          },
        });
        return;
      }
    }
    res.json({ success: false, error: '查询单词详情失败' });
  }
});

// GET /api/v1/vocab/filter - 按条件筛选词书
router.get('/filter', (req, res) => {
  const { edition, stage, type } = req.query;
  let filtered = vocabBooks;

  if (edition && typeof edition === 'string') {
    filtered = filtered.filter(b => b.edition === edition);
  }
  if (stage && typeof stage === 'string') {
    filtered = filtered.filter(b => b.stage === stage);
  }
  if (type && typeof type === 'string') {
    filtered = filtered.filter(b => b.type === type);
  }

  const bookList = filtered.map(b => ({
    id: b.id,
    name: b.name,
    edition: b.edition,
    stage: b.stage,
    grade: b.grade,
    semester: b.semester,
    type: b.type,
    wordCount: b.wordCount,
  }));

  res.json({ success: true, data: bookList });
});

export default router;
