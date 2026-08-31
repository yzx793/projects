import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/helpers.js';

const router = Router();

// GET /api/v1/tasks - 获取今日学习任务
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await queryAll(`SELECT * FROM tasks WHERE task_date = '${today}' OR task_date IS NULL`);
    
    tasks.forEach((task: any) => {
      task.completed = task.completed === 1;
    });
    
    const completedCount = tasks.filter((t: any) => t.completed).length;
    const totalCount = tasks.length;
    const totalDuration = tasks.reduce((sum: number, t: any) => sum + (t.duration || 0), 0);
    const completedDuration = tasks
      .filter((t: any) => t.completed)
      .reduce((sum: number, t: any) => sum + (t.duration || 0), 0);

    res.json({
      code: 0,
      data: {
        tasks,
        summary: {
          total: totalCount,
          completed: completedCount,
          totalDuration,
          completedDuration,
          progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ code: 500, message: '获取任务失败' });
  }
});

// POST /api/v1/tasks/:id/complete - 标记任务完成
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await queryOne(`SELECT * FROM tasks WHERE id = ${id}`);
    if (!task) {
      return res.status(404).json({ code: 404, message: '任务不存在' });
    }
    
    await run(`UPDATE tasks SET completed = 1, progress = 100 WHERE id = ${id}`);
    
    const updatedTask = await queryOne(`SELECT * FROM tasks WHERE id = ${id}`);
    updatedTask.completed = true;
    
    res.json({ code: 0, data: updatedTask, message: '任务已完成' });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ code: 500, message: '完成任务失败' });
  }
});

export default router;