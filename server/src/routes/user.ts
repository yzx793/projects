import { Router } from 'express';
import { userProfile, learningStats, badges } from '../data/mockData.js';

const router = Router();

// GET /api/v1/user/profile - 获取用户信息
router.get('/profile', (req, res) => {
  res.json({ code: 0, data: userProfile });
});

// GET /api/v1/user/stats - 获取学习统计数据
router.get('/stats', (req, res) => {
  res.json({ code: 0, data: learningStats });
});

// GET /api/v1/user/badges - 获取勋章列表
router.get('/badges', (req, res) => {
  res.json({ code: 0, data: badges });
});

export default router;
