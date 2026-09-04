import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/helpers.js';
import { getDbType } from '../db/index.js';

const router = Router();

// GET /api/v1/courses/subjects - 获取学科列表
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await queryAll('SELECT * FROM subjects ORDER BY sort_order ASC');
    res.json({ code: 0, data: subjects });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取学科列表失败' });
  }
});

// GET /api/v1/courses - 获取课程列表
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    
    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];
    
    if (subject && subject !== 'all') {
      const dbType = getDbType();
      if (dbType === 'postgres') {
        sql += ' AND subject = $1';
        params.push(subject);
      } else {
        sql += ` AND subject = '${subject}'`;
      }
    }
    
    const courses = await queryAll(sql, params);
    res.json({ code: 0, data: courses });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取课程列表失败' });
  }
});

// GET /api/v1/courses/:id - 获取课程详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbType = getDbType();
    
    let sql: string;
    let params: any[];
    
    if (dbType === 'postgres') {
      sql = 'SELECT * FROM courses WHERE id = $1';
      params = [parseInt(id)];
    } else {
      sql = `SELECT * FROM courses WHERE id = ${id}`;
      params = [];
    }
    
    const course = await queryOne(sql, params);
    
    if (!course) {
      return res.status(404).json({ code: 404, message: '课程不存在' });
    }
    
    res.json({ code: 0, data: course });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取课程详情失败' });
  }
});

export default router;