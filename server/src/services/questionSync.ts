/**
 * 题库同步服务
 * 负责从第三方API同步题目到本地数据库
 */

import {
  isXuekubaoAvailable,
  getSubjectEditions,
  getChapters,
  getQuestions,
  syncQuestionsToLocal,
  SUBJECT_IDS,
  PHASE_IDS,
  type SubjectEdition,
  type Chapter,
  type XuekubaoQuestion,
} from './xuekubao.js';

// 同步状态类型
interface SyncStatus {
  subject: string;
  phase: string;
  grade: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress: number;
  total: number;
  synced: number;
  errors: number;
  lastSyncAt?: string;
  message?: string;
}

// 全局同步状态（实际生产环境应使用数据库存储）
const syncStatuses: Map<string, SyncStatus> = new Map();

/**
 * 获取同步状态
 */
export function getSyncStatus(key: string): SyncStatus | undefined {
  return syncStatuses.get(key);
}

/**
 * 获取所有同步状态
 */
export function getAllSyncStatuses(): SyncStatus[] {
  return Array.from(syncStatuses.values());
}

/**
 * 更新同步状态
 */
function updateSyncStatus(key: string, updates: Partial<SyncStatus>): void {
  const current = syncStatuses.get(key) || {
    subject: '',
    phase: '',
    grade: '',
    status: 'idle' as const,
    progress: 0,
    total: 0,
    synced: 0,
    errors: 0,
  };
  syncStatuses.set(key, { ...current, ...updates });
}

/**
 * 生成同步状态key
 */
function generateSyncKey(subject: string, phase: string, grade: string): string {
  return `${subject}_${phase}_${grade}`;
}

/**
 * 检查第三方API可用性
 */
export function checkThirdPartyAPIStatus(): {
  xuekubao: boolean;
  message: string;
} {
  const xuekubaoAvailable = isXuekubaoAvailable();
  return {
    xuekubao: xuekubaoAvailable,
    message: xuekubaoAvailable
      ? '学库宝API已配置，可以同步题库'
      : '学库宝API未配置，请设置 XUEKUBAO_ACCESS_KEY 环境变量。当前使用本地题库数据。',
  };
}

/**
 * 同步指定学科/年级的题库
 */
export async function syncQuestionBank(params: {
  subject: 'chinese' | 'math' | 'english';
  phase: 'primary' | 'middle' | 'high';
  grade: string;
  edition?: string;
}): Promise<{ success: boolean; message: string; synced: number }> {
  const key = generateSyncKey(params.subject, params.phase, params.grade);

  // 检查是否正在同步
  const currentStatus = syncStatuses.get(key);
  if (currentStatus?.status === 'syncing') {
    return {
      success: false,
      message: '该学科/年级正在同步中，请稍后再试',
      synced: 0,
    };
  }

  // 检查API可用性
  if (!isXuekubaoAvailable()) {
    return {
      success: false,
      message: '学库宝API未配置，无法同步。请设置 XUEKUBAO_ACCESS_KEY 环境变量。',
      synced: 0,
    };
  }

  // 初始化同步状态
  updateSyncStatus(key, {
    subject: params.subject,
    phase: params.phase,
    grade: params.grade,
    status: 'syncing',
    progress: 0,
    total: 0,
    synced: 0,
    errors: 0,
  });

  try {
    // 获取章节/知识点
    const phaseId = PHASE_IDS[params.phase];
    const subjectId = SUBJECT_IDS[params.subject];

    const chapters = await getChapters({
      phaseId: String(phaseId),
      subjectId: String(subjectId),
      gradeId: params.grade,
      editionId: params.edition,
    });

    // 统计总知识点数
    const totalKnowledgePoints = countKnowledgePoints(chapters);
    updateSyncStatus(key, { total: totalKnowledgePoints });

    let syncedCount = 0;
    let errorCount = 0;
    let processedCount = 0;

    // 遍历所有知识点，同步题目
    for (const chapter of chapters) {
      const knowledgePoints = extractKnowledgePoints(chapter);

      for (const kp of knowledgePoints) {
        try {
          const result = await syncQuestionsToLocal({
            subject: params.subject,
            phase: params.phase,
            grade: params.grade,
            edition: params.edition,
            knowledgeId: kp.oldId,
            maxPages: 3,
          });

          syncedCount += result.synced;
          errorCount += result.errors;
        } catch (error) {
          console.error(`[SyncService] Sync knowledge point ${kp.name} error:`, error);
          errorCount++;
        }

        processedCount++;
        updateSyncStatus(key, {
          progress: Math.round((processedCount / totalKnowledgePoints) * 100),
          synced: syncedCount,
          errors: errorCount,
        });
      }
    }

    // 更新完成状态
    updateSyncStatus(key, {
      status: 'completed',
      progress: 100,
      synced: syncedCount,
      errors: errorCount,
      lastSyncAt: new Date().toISOString(),
      message: `同步完成，共同步 ${syncedCount} 道题目`,
    });

    return {
      success: true,
      message: `同步完成，共同步 ${syncedCount} 道题目`,
      synced: syncedCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '同步失败';
    updateSyncStatus(key, {
      status: 'error',
      message: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
      synced: 0,
    };
  }
}

/**
 * 计算知识点总数
 */
function countKnowledgePoints(chapters: Chapter[]): number {
  let count = 0;
  for (const chapter of chapters) {
    if (chapter.children && chapter.children.length > 0) {
      count += countKnowledgePoints(chapter.children);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * 提取叶子节点（知识点）
 */
function extractKnowledgePoints(chapter: Chapter): Chapter[] {
  if (!chapter.children || chapter.children.length === 0) {
    return [chapter];
  }
  const results: Chapter[] = [];
  for (const child of chapter.children) {
    results.push(...extractKnowledgePoints(child));
  }
  return results;
}

/**
 * 获取可用的教材版本列表
 */
export async function getAvailableEditions(): Promise<{
  primary: SubjectEdition[];
  middle: SubjectEdition[];
  high: SubjectEdition[];
} | null> {
  if (!isXuekubaoAvailable()) {
    return null;
  }

  try {
    const editions = await getSubjectEditions();

    const primary = editions.filter(e => e.pharseId === '1');
    const middle = editions.filter(e => e.pharseId === '2');
    const high = editions.filter(e => e.pharseId === '3');

    return { primary, middle, high };
  } catch (error) {
    console.error('[SyncService] getAvailableEditions error:', error);
    return null;
  }
}

/**
 * 预览可同步的题目数量
 */
export async function previewSyncCount(params: {
  subject: 'chinese' | 'math' | 'english';
  phase: 'primary' | 'middle' | 'high';
  grade: string;
  knowledgeId: string;
}): Promise<{ count: number; sample: XuekubaoQuestion[] }> {
  if (!isXuekubaoAvailable()) {
    return { count: 0, sample: [] };
  }

  try {
    const result = await getQuestions({
      knowledgeId: params.knowledgeId,
      page: 1,
    });

    return {
      count: result.total,
      sample: result.questions.slice(0, 3),
    };
  } catch (error) {
    console.error('[SyncService] previewSyncCount error:', error);
    return { count: 0, sample: [] };
  }
}

export type { SyncStatus };
