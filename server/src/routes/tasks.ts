import { Router } from 'express';
import { todayTasks } from '../data/mockData.js';

const router = Router();

// GET /api/v1/tasks - 获取今日学习任务
// Query 参数: date?: string (可选，默认今天)
router.get('/', (req, res) => {
  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const totalDuration = todayTasks.reduce((sum, t) => sum + t.duration, 0);
  const completedDuration = todayTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.duration, 0);

  res.json({
    code: 0,
    data: {
      tasks: todayTasks,
      summary: {
        total: totalCount,
        completed: completedCount,
        totalDuration,
        completedDuration,
        progress: Math.round((completedCount / totalCount) * 100),
      },
    },
  });
});

// POST /api/v1/tasks/:id/complete - 标记任务完成
// Path 参数: id: number
router.post('/:id/complete', (req, res) => {
  const { id } = req.params;
  const task = todayTasks.find(t => t.id === Number(id));

  if (!task) {
    return res.status(404).json({ code: 404, message: '任务不存在' });
  }

  task.completed = true;
  task.progress = 100;
  res.json({ code: 0, data: task, message: '任务已完成' });
});

export default router;
