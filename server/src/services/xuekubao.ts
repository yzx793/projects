/**
 * 第三方题库API服务 - 学库宝 (xuekubao.com)
 * 支持语文、数学、英语三科题库同步
 * 
 * API文档: http://www.tikuapi.com/
 * 接口基础URL: http://api.xuekubao.com/api/v1/
 * 
 * 需要配置环境变量:
 * - XUEKUBAO_ACCESS_KEY: 学库宝API访问密钥
 */

import axios from 'axios';

// 学库宝API配置
const XUEKUBAO_BASE_URL = 'http://api.xuekubao.com/api/v1';
const XUEKUBAO_ACCESS_KEY = process.env.XUEKUBAO_ACCESS_KEY || '';

// 学科ID映射
const SUBJECT_IDS = {
  chinese: 1,    // 语文
  math: 2,       // 数学
  english: 3,    // 英语
  physics: 4,    // 物理
  chemistry: 5,  // 化学
  biology: 6,    // 生物
};

// 学段ID映射
const PHASE_IDS = {
  primary: 1,    // 小学
  middle: 2,     // 初中
  high: 3,       // 高中
};

// 题型ID映射
const QUESTION_TYPE_IDS = {
  choice: 1,      // 选择题
  fill: 2,        // 填空题
  short_answer: 3, // 简答题
  calculation: 4,  // 计算题
  essay: 5,       // 作文题
  reading: 6,     // 阅读理解
  translation: 7, // 翻译题
};

// 难度ID映射
const DIFFICULTY_IDS = {
  easy: 1,     // 简单
  medium: 2,   // 中等
  hard: 3,     // 困难
};

// API响应类型
interface XuekubaoResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 基础信息类型
interface SubjectEdition {
  pharseId: string;
  subjectId: string;
  gradeId: string;
  editionId: string;
  pharseName: string;
  subjectName: string;
  gradeName: string;
  editionName: string;
}

// 章节/知识点类型
interface Chapter {
  id: string;
  oldId: string;
  name: string;
  children?: Chapter[];
}

// 题目类型
interface XuekubaoQuestion {
  qid: string;
  content: string;
  answer: string;
  analysis: string;
  knowledgeId: string;
  knowledgeName: string;
  qtypeId: string;
  qtypeName: string;
  diff: string;
  diffName: string;
  year: string;
  paperType: string;
  paperTypeName: string;
}

/**
 * 检查API是否可用
 */
export function isXuekubaoAvailable(): boolean {
  return !!XUEKUBAO_ACCESS_KEY;
}

/**
 * 获取基础信息（学段、学科、年级、教材版本）
 */
export async function getSubjectEditions(): Promise<SubjectEdition[]> {
  if (!isXuekubaoAvailable()) {
    throw new Error('学库宝API未配置，请设置 XUEKUBAO_ACCESS_KEY 环境变量');
  }

  try {
    const response = await axios.post<XuekubaoResponse<SubjectEdition[]>>(
      `${XUEKUBAO_BASE_URL}/subjectEditionApi`,
      {},
      {
        headers: {
          'accessKey': XUEKUBAO_ACCESS_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.msg || '获取基础信息失败');
  } catch (error) {
    console.error('[XuekubaoAPI] getSubjectEditions error:', error);
    throw error;
  }
}

/**
 * 获取章节/知识点树形结构
 */
export async function getChapters(params: {
  phaseId: string;
  subjectId?: string;
  editionId?: string;
  gradeId?: string;
}): Promise<Chapter[]> {
  if (!isXuekubaoAvailable()) {
    throw new Error('学库宝API未配置，请设置 XUEKUBAO_ACCESS_KEY 环境变量');
  }

  try {
    const response = await axios.post<XuekubaoResponse<Chapter[]>>(
      `${XUEKUBAO_BASE_URL}/chapterApi`,
      {
        pharseId: params.phaseId,
        subjectId: params.subjectId,
        editionId: params.editionId,
        gradeId: params.gradeId,
      },
      {
        headers: {
          'accessKey': XUEKUBAO_ACCESS_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.msg || '获取章节失败');
  } catch (error) {
    console.error('[XuekubaoAPI] getChapters error:', error);
    throw error;
  }
}

/**
 * 根据知识点获取试题
 */
export async function getQuestions(params: {
  knowledgeId: string;
  qtypeId?: string;
  paperType?: string;
  diff?: string;
  year?: string;
  page: number;
}): Promise<{ questions: XuekubaoQuestion[]; total: number }> {
  if (!isXuekubaoAvailable()) {
    throw new Error('学库宝API未配置，请设置 XUEKUBAO_ACCESS_KEY 环境变量');
  }

  try {
    const response = await axios.post<XuekubaoResponse<{ list: XuekubaoQuestion[]; total: number }>>(
      `${XUEKUBAO_BASE_URL}/getQuestions`,
      {
        knowledgeId: params.knowledgeId,
        qtypeId: params.qtypeId,
        paperType: params.paperType,
        diff: params.diff,
        year: params.year,
        page: params.page,
      },
      {
        headers: {
          'accessKey': XUEKUBAO_ACCESS_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data.code === 200) {
      return {
        questions: response.data.data.list,
        total: response.data.data.total,
      };
    }
    throw new Error(response.data.msg || '获取试题失败');
  } catch (error) {
    console.error('[XuekubaoAPI] getQuestions error:', error);
    throw error;
  }
}

/**
 * 根据试题ID获取答案解析
 */
export async function getAnswers(qids: string[]): Promise<Record<string, { answer: string; analysis: string }>> {
  if (!isXuekubaoAvailable()) {
    throw new Error('学库宝API未配置，请设置 XUEKUBAO_ACCESS_KEY 环境变量');
  }

  try {
    const response = await axios.post<XuekubaoResponse<Record<string, { answer: string; analysis: string }>>>(
      `${XUEKUBAO_BASE_URL}/getAnswer`,
      {
        qid: qids.join(','),
      },
      {
        headers: {
          'accessKey': XUEKUBAO_ACCESS_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.msg || '获取答案失败');
  } catch (error) {
    console.error('[XuekubaoAPI] getAnswers error:', error);
    throw error;
  }
}

/**
 * 同步试题到本地数据库
 * 从第三方API获取试题并存储到本地
 */
export async function syncQuestionsToLocal(params: {
  subject: 'chinese' | 'math' | 'english';
  phase: 'primary' | 'middle' | 'high';
  grade: string;
  edition?: string;
  knowledgeId: string;
  maxPages?: number;
}): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;
  const maxPages = params.maxPages || 5;

  for (let page = 1; page <= maxPages; page++) {
    try {
      const result = await getQuestions({
        knowledgeId: params.knowledgeId,
        page,
      });

      // 这里应该将题目存储到本地数据库
      // 由于当前使用内存数据，我们只返回统计信息
      synced += result.questions.length;

      // 如果没有更多数据，提前结束
      if (result.questions.length === 0) {
        break;
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`[XuekubaoAPI] Sync page ${page} error:`, error);
      errors++;
    }
  }

  return { synced, errors };
}

// 导出类型供其他模块使用
export type {
  SubjectEdition,
  Chapter,
  XuekubaoQuestion,
};

export {
  SUBJECT_IDS,
  PHASE_IDS,
  QUESTION_TYPE_IDS,
  DIFFICULTY_IDS,
};
