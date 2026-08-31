import { Router } from 'express';
import type { Request, Response } from 'express';
import { queryAll, queryOne, run } from '../db/helpers.js';

const router = Router();

/**
 * GET /api/v1/favorites
 * Get all favorites with optional subject filter
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject } = req.query;
    
    let query = 'SELECT * FROM favorites WHERE 1=1';
    if (subject && subject !== 'all') {
      query += ` AND subject = '${subject}'`;
    }
    query += ' ORDER BY favorited_at DESC';
    
    const favorites = await queryAll(query);
    
    favorites.forEach((fav: any) => {
      fav.knowledge_points = fav.knowledge_points ? fav.knowledge_points.split(',') : [];
    });
    
    const subjectStats: Record<string, number> = {};
    favorites.forEach((f: any) => {
      subjectStats[f.subject] = (subjectStats[f.subject] || 0) + 1;
    });

    res.json({
      code: 0,
      data: {
        favorites,
        total: favorites.length,
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
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { questionId, title, subject, subjectName, type, difficulty, content, answer, analysis, knowledgePoints, source, note } = req.body;

    const existing = await queryOne(`SELECT * FROM favorites WHERE question_id = ${questionId}`);
    if (existing) {
      existing.knowledge_points = existing.knowledge_points ? existing.knowledge_points.split(',') : [];
      
      return res.json({
        code: 0,
        message: 'Already in favorites',
        data: existing,
      });
    }

    const kpStr = Array.isArray(knowledgePoints) ? knowledgePoints.join(',') : knowledgePoints || '';
    
    await run(
      `INSERT INTO favorites (question_id, title, subject, subject_name, type, difficulty, content, answer, analysis, knowledge_points, source, note) VALUES (${questionId}, '${title}', '${subject}', '${subjectName}', '${type}', ${difficulty}, '${content}', '${answer}', '${analysis}', '${kpStr}', '${source}', '${note}')`
    );

    const newFavorite = await queryOne('SELECT * FROM favorites ORDER BY id DESC LIMIT 1');
    newFavorite.knowledge_points = newFavorite.knowledge_points ? newFavorite.knowledge_points.split(',') : [];

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
    
    const existing = await queryOne(`SELECT * FROM favorites WHERE id = ${id}`);
    if (!existing) {
      return res.status(404).json({ code: 404, message: 'Favorite not found' });
    }

    await run(`DELETE FROM favorites WHERE id = ${id}`);

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
    
    const existing = await queryOne(`SELECT * FROM favorites WHERE question_id = ${questionId}`);
    const isFavorited = !!existing;
    
    let favoriteId = null;
    if (isFavorited) {
      favoriteId = existing.id;
    }

    res.json({
      code: 0,
      data: {
        isFavorited,
        favoriteId,
      },
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ code: 500, message: 'Failed to check favorite' });
  }
});

export default router;