/**
 * 题库同步路由
 * 提供第三方题库同步功能的API接口
 */

import express from 'express';
import {
  checkThirdPartyAPIStatus,
  syncQuestionBank,
  getSyncStatus,
  getAllSyncStatuses,
  getAvailableEditions,
  previewSyncCount,
} from '../services/questionSync.js';

const router = express.Router();

/**
 * GET /api/v1/sync/status
 * 检查第三方API配置状态
 */
router.get('/status', (req, res) => {
  const apiStatus = checkThirdPartyAPIStatus();
  const syncStatuses = getAllSyncStatuses();

  res.json({
    api: apiStatus,
    syncStatuses,
  });
});

/**
 * GET /api/v1/sync/editions
 * 获取可用的教材版本列表
 */
router.get('/editions', async (req, res) => {
  try {
    const editions = await getAvailableEditions();

    if (!editions) {
      res.json({
        success: false,
        message: '学库宝API未配置，使用本地题库数据',
        editions: null,
      });
      return;
    }

    res.json({
      success: true,
      editions,
    });
  } catch (error) {
    console.error('[SyncAPI] get editions error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取教材版本失败',
    });
  }
});

/**
 * GET /api/v1/sync/preview
 * 预览可同步的题目数量
 * Query: subject, phase, grade, knowledgeId
 */
router.get('/preview', async (req, res) => {
  try {
    const { subject, phase, grade, knowledgeId } = req.query;

    if (!subject || !phase || !grade || !knowledgeId) {
      res.status(400).json({
        success: false,
        message: '缺少必要参数: subject, phase, grade, knowledgeId',
      });
      return;
    }

    const result = await previewSyncCount({
      subject: subject as 'chinese' | 'math' | 'english',
      phase: phase as 'primary' | 'middle' | 'high',
      grade: grade as string,
      knowledgeId: knowledgeId as string,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[SyncAPI] preview error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '预览失败',
    });
  }
});

/**
 * POST /api/v1/sync/start
 * 开始同步题库
 * Body: { subject, phase, grade, edition? }
 */
router.post('/start', async (req, res) => {
  try {
    const { subject, phase, grade, edition } = req.body;

    if (!subject || !phase || !grade) {
      res.status(400).json({
        success: false,
        message: '缺少必要参数: subject, phase, grade',
      });
      return;
    }

    if (!['chinese', 'math', 'english'].includes(subject)) {
      res.status(400).json({
        success: false,
        message: '无效的学科: 仅支持 chinese, math, english',
      });
      return;
    }

    if (!['primary', 'middle', 'high'].includes(phase)) {
      res.status(400).json({
        success: false,
        message: '无效的学段: 仅支持 primary, middle, high',
      });
      return;
    }

    // 异步执行同步，立即返回
    res.json({
      success: true,
      message: '同步任务已启动',
    });

    // 在后台执行同步
    syncQuestionBank({
      subject,
      phase,
      grade,
      edition,
    }).catch(error => {
      console.error('[SyncAPI] sync error:', error);
    });
  } catch (error) {
    console.error('[SyncAPI] start sync error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '启动同步失败',
    });
  }
});

/**
 * GET /api/v1/sync/progress/:key
 * 获取同步进度
 * Param: key (subject_phase_grade)
 */
router.get('/progress/:key', (req, res) => {
  const { key } = req.params;
  const status = getSyncStatus(key);

  if (!status) {
    res.json({
      success: true,
      status: null,
      message: '未找到同步记录',
    });
    return;
  }

  res.json({
    success: true,
    status,
  });
});

/**
 * GET /api/v1/sync/progress
 * 获取所有同步进度
 */
router.get('/progress', (req, res) => {
  const statuses = getAllSyncStatuses();

  res.json({
    success: true,
    statuses,
  });
});

export default router;
