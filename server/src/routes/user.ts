import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/helpers.js';

const router = Router();

// POST /api/v1/auth/login - 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    
    const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    res.json({
      code: 0,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + user.username,
        level: user.level || 1,
        exp: user.exp || 0,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

// POST /api/v1/auth/register - 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, role = 'student' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ code: 400, message: '角色只能是 student 或 teacher' });
    }
    
    const existing = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ code: 409, message: '用户名已存在' });
    }
    
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
    await run('INSERT INTO users (username, password, role, avatar) VALUES (?, ?, ?, ?)', [username, password, role, avatar]);
    
    const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
    
    res.json({
      code: 0,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        level: user.level || 1,
        exp: user.exp || 0,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ code: 500, message: '注册失败' });
  }
});

// GET /api/v1/user/profile - 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const users = await queryAll('SELECT * FROM users LIMIT 1');
    
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    const user = users[0];
    res.json({
      code: 0,
      data: {
        id: user.id,
        name: user.username,
        avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=student',
        grade: '五年级',
        school: '实验小学',
        streak: 7,
        totalStudyHours: 120,
        level: user.level || 5,
        exp: user.exp || 1200,
        nextLevelExp: 2000,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ code: 500, message: '获取用户信息失败' });
  }
});

// GET /api/v1/user/stats - 获取学习统计数据
router.get('/stats', async (req, res) => {
  try {
    const stats = await queryAll('SELECT * FROM learning_stats ORDER BY stat_date DESC LIMIT 7');
    
    const totalDuration = stats.reduce((sum: number, s: any) => sum + (s.study_duration || 0), 0);
    const totalQuestions = stats.reduce((sum: number, s: any) => sum + (s.questions_answered || 0), 0);
    const avgCorrectRate = stats.length > 0 
      ? stats.reduce((sum: number, s: any) => sum + (s.correct_rate || 0), 0) / stats.length 
      : 0;
    
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weeklyStudyHours = stats.map((s: any) => Math.round((s.study_duration || 0) / 60 * 10) / 10);
    const weeklyDays = stats.map((s: any) => {
      const d = new Date(s.stat_date);
      return dayNames[d.getDay()];
    });
    
    res.json({
      code: 0,
      data: {
        todayStudyMinutes: stats.length > 0 ? stats[0].study_duration || 0 : 0,
        todayTargetMinutes: 60,
        weeklyStudyHours,
        weeklyDays,
        accuracyRate: Math.round(avgCorrectRate * 100),
        totalQuestions,
        correctQuestions: Math.round(totalQuestions * avgCorrectRate),
        streakDays: stats.length,
        rankInClass: 3,
        totalClassStudents: 45,
        subjectStats: [
          { subject: '数学', accuracy: 85, trend: 'up' },
          { subject: '语文', accuracy: 78, trend: 'stable' },
          { subject: '英语', accuracy: 92, trend: 'up' },
        ],
      },
    });
  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({ code: 500, message: '获取学习统计失败' });
  }
});

// GET /api/v1/user/badges - 获取勋章列表
router.get('/badges', async (req, res) => {
  try {
    const badges = await queryAll('SELECT * FROM badges');
    
    const badgeColors = ['#6C63FF', '#00B894', '#FF6584', '#FDCB6E', '#0984E3', '#E17055'];
    const badgeDescriptions: Record<string, string> = {
      'first_login': '首次登录奖励',
      'study_streak': '连续学习7天',
      'math_master': '数学练习达人',
      'reading_star': '阅读之星',
      'perfect_score': '满分成就',
      'early_bird': '早起学习奖励',
    };
    
    const formattedBadges = badges.map((b: any, i: number) => ({
      id: b.id,
      name: b.badge_name,
      description: badgeDescriptions[b.badge_id] || '成就勋章',
      icon: b.badge_icon || 'trophy',
      unlocked: true,
      color: badgeColors[i % badgeColors.length],
    }));
    
    res.json({ code: 0, data: formattedBadges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ code: 500, message: '获取勋章列表失败' });
  }
});

export default router;