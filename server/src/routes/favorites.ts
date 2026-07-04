import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// In-memory favorites storage
interface Favorite {
  id: number;
  questionId: number;
  title: string;
  subject: string;
  subjectName: string;
  type: string;
  difficulty: number;
  content: string;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  source: string;
  createdAt: string;
  favoritedAt: string;
  note?: string;
}

const favorites: Favorite[] = [];
let favoriteIdCounter = 1;

/**
 * GET /api/v1/favorites
 * Get all favorites with optional subject filter
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject } = req.query;
    
    let filteredFavorites = [...favorites];
    
    if (subject && subject !== 'all') {
      filteredFavorites = filteredFavorites.filter(f => f.subject === subject);
    }

    // Group by subject for stats
    const subjectStats: Record<string, number> = {};
    filteredFavorites.forEach(f => {
      subjectStats[f.subject] = (subjectStats[f.subject] || 0) + 1;
    });

    res.json({
      code: 0,
      data: {
        favorites: filteredFavorites.sort((a, b) => 
          new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime()
        ),
        total: filteredFavorites.length,
        subjectStats,
      },
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ code: 500, message: 'Failed to get favorites' });
  }
});

/**
 * POST /api/v1/favorites
 * Add a question to favorites
 * Body: { questionId, title, subject, subjectName, type, difficulty, content, answer, analysis, knowledgePoints, source, note? }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { questionId, title, subject, subjectName, type, difficulty, content, answer, analysis, knowledgePoints, source, note } = req.body;

    // Check if already favorited
    const existing = favorites.find(f => f.questionId === questionId);
    if (existing) {
      return res.json({
        code: 0,
        message: 'Already in favorites',
        data: existing,
      });
    }

    const newFavorite: Favorite = {
      id: favoriteIdCounter++,
      questionId,
      title,
      subject,
      subjectName,
      type,
      difficulty,
      content,
      answer,
      analysis,
      knowledgePoints,
      source,
      createdAt: new Date().toISOString(),
      favoritedAt: new Date().toISOString(),
      note,
    };

    favorites.push(newFavorite);

    res.json({
      code: 0,
      message: 'Added to favorites',
      data: newFavorite,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ code: 500, message: 'Failed to add favorite' });
  }
});

/**
 * DELETE /api/v1/favorites/:id
 * Remove a question from favorites
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const index = favorites.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({ code: 404, message: 'Favorite not found' });
    }

    favorites.splice(index, 1);

    res.json({
      code: 0,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ code: 500, message: 'Failed to remove favorite' });
  }
});

/**
 * GET /api/v1/favorites/check/:questionId
 * Check if a question is in favorites
 */
router.get('/check/:questionId', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(String(req.params.questionId));
    const favorite = favorites.find(f => f.questionId === questionId);

    res.json({
      code: 0,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite?.id,
      },
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ code: 500, message: 'Failed to check favorite' });
  }
});

export default router;
