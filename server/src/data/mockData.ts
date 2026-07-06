// 狸米新启航 - 模拟数据
// 用户数据
export const userProfile = {
  id: 1,
  name: '李明',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  grade: '初二',
  school: '阳光中学',
  streak: 15,
  totalStudyHours: 128,
  level: 12,
  exp: 2450,
  nextLevelExp: 3000,
};

// 学科列表
export const subjects = [
  { id: 'chinese', name: '语文', icon: 'book', color: '#E17055', totalCourses: 42 },
  { id: 'math', name: '数学', icon: 'calculator', color: '#6C63FF', totalCourses: 56 },
  { id: 'english', name: '英语', icon: 'globe', color: '#00B894', totalCourses: 38 },
  { id: 'physics', name: '物理', icon: 'atom', color: '#0984E3', totalCourses: 34 },
  { id: 'chemistry', name: '化学', icon: 'flask', color: '#FDCB6E', totalCourses: 28 },
];

// 今日学习任务
export const todayTasks = [
  {
    id: 1,
    title: '古诗词鉴赏 - 唐诗三百首',
    subject: 'chinese',
    subjectName: '语文 · 七年级',
    type: 'video',
    duration: 20,
    completed: false,
    progress: 0,
  },
  {
    id: 2,
    title: '计算打卡 - 有理数运算',
    subject: 'math',
    subjectName: '数学 · 七年级',
    type: 'exercise',
    duration: 15,
    completed: false,
    progress: 0,
  },
  {
    id: 3,
    title: '单词背诵 - 初中核心词汇',
    subject: 'english',
    subjectName: '英语 · 七年级',
    type: 'exercise',
    duration: 25,
    completed: false,
    progress: 0,
  },
];

// 课程列表
export const courses = [
  {
    id: 1,
    title: '二次函数入门',
    subject: 'math',
    subjectName: '数学',
    teacher: '王老师',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
    duration: 25,
    lessons: 8,
    completedLessons: 5,
    difficulty: 'medium',
    description: '系统学习二次函数的基本概念、图像性质和解题方法',
  },
  {
    id: 2,
    title: '古诗词鉴赏技巧',
    subject: 'chinese',
    subjectName: '语文',
    teacher: '李老师',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
    duration: 30,
    lessons: 10,
    completedLessons: 3,
    difficulty: 'easy',
    description: '掌握古诗词鉴赏的核心方法，提升文学素养',
  },
  {
    id: 3,
    title: '英语时态全攻略',
    subject: 'english',
    subjectName: '英语',
    teacher: '张老师',
    thumbnail: 'https://images.unsplash.com/photo-1543103759-80f2e467b851?w=400&h=250&fit=crop',
    duration: 35,
    lessons: 12,
    completedLessons: 8,
    difficulty: 'medium',
    description: '从基础到进阶，全面掌握英语八大时态',
  },
  {
    id: 4,
    title: '力学基础 - 牛顿定律',
    subject: 'physics',
    subjectName: '物理',
    teacher: '赵老师',
    thumbnail: 'https://images.unsplash.com/photo-1636466497215-2ac8b1e3390c?w=400&h=250&fit=crop',
    duration: 28,
    lessons: 6,
    completedLessons: 2,
    difficulty: 'hard',
    description: '深入理解牛顿三大定律，掌握力学分析方法',
  },
  {
    id: 5,
    title: '化学方程式配平',
    subject: 'chemistry',
    subjectName: '化学',
    teacher: '孙老师',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop',
    duration: 20,
    lessons: 5,
    completedLessons: 0,
    difficulty: 'easy',
    description: '快速掌握化学方程式配平的核心技巧',
  },
  {
    id: 6,
    title: '文言文阅读突破',
    subject: 'chinese',
    subjectName: '语文',
    teacher: '周老师',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
    duration: 32,
    lessons: 8,
    completedLessons: 6,
    difficulty: 'hard',
    description: '攻克文言文阅读难点，提升古文理解能力',
  },
];

// 错题数据
export const wrongQuestions = [
  {
    id: 1,
    subject: 'math',
    subjectName: '数学',
    title: '二次函数顶点坐标求解',
    question: '已知二次函数 y = 2x² - 4x + 5，求其顶点坐标。',
    userAnswer: '(1, 5)',
    correctAnswer: '(1, 3)',
    analysis: '将 x=1 代入 y = 2(1)² - 4(1) + 5 = 2 - 4 + 5 = 3，所以顶点坐标为 (1, 3)。',
    knowledgePoint: '二次函数顶点公式',
    difficulty: 'medium',
    createdAt: '2025-01-10',
    solved: false,
    wrongCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1635070041285-d0ccc366ec6c?w=400&h=300&fit=crop',
    reviewStatus: 'pending' as const, // pending: 待复习, mastered: 已掌握, reviewing: 复习中
    errorType: 'calculation' as const, // calculation: 计算错误, concept: 概念错误, careless: 粗心
    tags: ['二次函数', '顶点坐标', '配方法'],
    notes: '',
  },
  {
    id: 2,
    subject: 'english',
    subjectName: '英语',
    title: '现在完成时 vs 一般过去时',
    question: 'I ___ (live) in Beijing since 2020.',
    userAnswer: 'lived',
    correctAnswer: 'have lived',
    analysis: '"since 2020" 表示从过去某个时间持续到现在，应使用现在完成时 have/has + 过去分词。',
    knowledgePoint: '现在完成时',
    difficulty: 'easy',
    createdAt: '2025-01-09',
    solved: false,
    wrongCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    reviewStatus: 'pending' as const,
    errorType: 'concept' as const,
    tags: ['时态', '现在完成时', 'since用法'],
    notes: '',
  },
  {
    id: 3,
    subject: 'physics',
    subjectName: '物理',
    title: '牛顿第二定律应用',
    question: '一个质量为 2kg 的物体受到 10N 的合力作用，求加速度。',
    userAnswer: '20 m/s²',
    correctAnswer: '5 m/s²',
    analysis: '根据 F = ma，a = F/m = 10/2 = 5 m/s²。注意是 F 除以 m，不是 F 乘以 m。',
    knowledgePoint: '牛顿第二定律 F=ma',
    difficulty: 'easy',
    createdAt: '2025-01-08',
    solved: true,
    wrongCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1636466472877-9d8e16a3c43f?w=400&h=300&fit=crop',
    reviewStatus: 'mastered' as const,
    errorType: 'careless' as const,
    tags: ['牛顿定律', '力学', 'F=ma'],
    notes: '公式记反了，下次注意',
  },
  {
    id: 4,
    subject: 'chinese',
    subjectName: '语文',
    title: '通假字辨析',
    question: '"学而时习之，不亦说乎"中的"说"是什么意思？',
    userAnswer: '说话',
    correctAnswer: '"说"通"悦"，高兴、愉快的意思',
    analysis: '古汉语中"说"常通假为"悦"，表示高兴。这句话意思是：学习并时常温习，不也是很愉快吗？',
    knowledgePoint: '通假字',
    difficulty: 'medium',
    createdAt: '2025-01-07',
    solved: false,
    wrongCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    reviewStatus: 'reviewing' as const,
    errorType: 'concept' as const,
    tags: ['文言文', '通假字', '论语'],
    notes: '',
  },
  {
    id: 5,
    subject: 'chemistry',
    subjectName: '化学',
    title: '化学方程式配平',
    question: '配平：Fe + O₂ → Fe₃O₄',
    userAnswer: '2Fe + O₂ → Fe₃O₄',
    correctAnswer: '3Fe + 2O₂ → Fe₃O₄',
    analysis: '右边有3个Fe，所以左边Fe系数为3；右边有4个O，所以O₂系数为2。验证：左边3Fe + 4O = 右边3Fe + 4O。',
    knowledgePoint: '化学方程式配平',
    difficulty: 'medium',
    createdAt: '2025-01-06',
    solved: false,
    wrongCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1532634737-cae2f63472f7?w=400&h=300&fit=crop',
    reviewStatus: 'pending' as const,
    errorType: 'calculation' as const,
    tags: ['化学方程式', '配平', '氧化还原'],
    notes: '',
  },
];

// 学习统计数据
export const learningStats = {
  todayStudyMinutes: 45,
  todayTargetMinutes: 90,
  weeklyStudyHours: [3.5, 2.0, 4.0, 1.5, 3.0, 5.0, 2.5],
  weeklyDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  accuracyRate: 78,
  totalQuestions: 356,
  correctQuestions: 278,
  streakDays: 15,
  rankInClass: 5,
  totalClassStudents: 42,
  subjectStats: [
    { subject: '数学', accuracy: 82, trend: 'up' },
    { subject: '语文', accuracy: 75, trend: 'up' },
    { subject: '英语', accuracy: 88, trend: 'stable' },
    { subject: '物理', accuracy: 70, trend: 'down' },
    { subject: '化学', accuracy: 65, trend: 'up' },
  ],
};

// 诗词数据库
export const poems = [
  {
    id: 1,
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    translation: [
      '明亮的月光洒在床前的窗户纸上',
      '好像地上泛起了一层白霜',
      '我禁不住抬起头来，看那天窗外空中的一轮明月',
      '不由得低头沉思，想起远方的家乡'
    ],
    explanation: '这首诗写的是在寂静的月夜思念家乡的感受。诗的前两句写诗人在作客他乡的特定环境中一刹那间产生的错觉。后两句通过动作神态的刻画，深化思乡之情。全诗运用比喻、衬托等手法，表达客居思乡之情，语言清新朴素而韵味含蓄无穷。',
    tags: ['思乡', '月亮', '唐诗'],
  },
  {
    id: 2,
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: ['春眠不觉晓', '处处闻啼鸟', '夜来风雨声', '花落知多少'],
    translation: [
      '春日里贪睡不知不觉天就亮了',
      '到处可以听见小鸟的鸣叫声',
      '回想昨夜的阵阵风雨声',
      '吹落了多少芳香的春花'
    ],
    explanation: '这首诗是诗人隐居在鹿门山时所做，意境十分优美。诗人抓住春天的早晨刚刚醒来时的一瞬间展开描写和联想，生动地表达了诗人对春天的热爱和怜惜之情。',
    tags: ['春天', '自然', '唐诗'],
  },
  {
    id: 3,
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'],
    translation: [
      '夕阳依傍着西山慢慢地沉没',
      '滔滔黄河朝着东海汹涌奔流',
      '若想把千里的风光景物看够',
      '那就要登上更高的一层城楼'
    ],
    explanation: '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负，反映了盛唐时期人们积极向上的进取精神。诗的前两句写所见，后两句写所思，写得出人意料，把哲理与景物、情势溶化得天衣无缝。',
    tags: ['登高', '哲理', '唐诗'],
  },
];

// 英语单词数据库
export const englishWords = [
  {
    id: 1,
    word: 'beautiful',
    phonetic: '/ˈbjuːtɪfl/',
    partOfSpeech: 'adj.',
    meaning: '美丽的，漂亮的',
    examples: [
      'She is a beautiful girl.',
      'What a beautiful day!',
      'The scenery is beautiful.'
    ],
    translationExamples: [
      '她是一个美丽的女孩。',
      '多么美好的一天！',
      '风景很美。'
    ],
    forms: {
      comparative: 'more beautiful',
      superlative: 'most beautiful',
      adverb: 'beautifully'
    },
    explanation: '用来形容人、事物或景色非常好看，给人愉悦的视觉感受。',
  },
  {
    id: 2,
    word: 'run',
    phonetic: '/rʌn/',
    partOfSpeech: 'v.',
    meaning: '跑，奔跑；经营；运行',
    examples: [
      'I run every morning.',
      'She runs a small business.',
      'The program runs smoothly.'
    ],
    translationExamples: [
      '我每天早上跑步。',
      '她经营一家小生意。',
      '程序运行得很顺利。'
    ],
    forms: {
      past: 'ran',
      pastParticiple: 'run',
      presentParticiple: 'running',
      noun: 'runner'
    },
    explanation: '基本意思是快速移动，也可表示经营管理或机器运行。',
  },
  {
    id: 3,
    word: 'happy',
    phonetic: '/ˈhæpi/',
    partOfSpeech: 'adj.',
    meaning: '快乐的，幸福的',
    examples: [
      'I am very happy today.',
      'Happy birthday to you!',
      'They lived happily ever after.'
    ],
    translationExamples: [
      '我今天非常开心。',
      '祝你生日快乐！',
      '从此他们过上了幸福的生活。'
    ],
    forms: {
      comparative: 'happier',
      superlative: 'happiest',
      adverb: 'happily',
      noun: 'happiness'
    },
    explanation: '表示感到愉悦、满足或幸运的状态。',
  },
];

// 勋章数据
export const badges = [
  { id: 1, name: '初出茅庐', description: '完成首次学习', icon: 'star', unlocked: true, color: '#FDCB6E' },
  { id: 2, name: '勤学苦练', description: '连续学习7天', icon: 'flame', unlocked: true, color: '#FF6584' },
  { id: 3, name: '学霸之路', description: '连续学习30天', icon: 'trophy', unlocked: false, color: '#6C63FF' },
  { id: 4, name: '错题克星', description: '解决100道错题', icon: 'check-circle', unlocked: true, color: '#00B894' },
  { id: 5, name: '全科达人', description: '所有学科均达到80分', icon: 'award', unlocked: false, color: '#0984E3' },
  { id: 6, name: '知识王者', description: '累计学习500小时', icon: 'crown', unlocked: false, color: '#E17055' },
];
