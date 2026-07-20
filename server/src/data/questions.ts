// 学科题目数据库 - 小学一年级到高中各学科

export interface Question {
  id: number;
  subject: string;
  subjectName: string;
  grade: string;
  gradeName: string;
  title: string;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
  knowledgePoint: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: 'choice' | 'fill' | 'calculation' | 'essay';
}

// 小学题目
const elementaryQuestions: Question[] = [
  // 一年级数学
  {
    id: 1001,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade1',
    gradeName: '一年级',
    title: '10以内加法',
    question: '小明有3个苹果，妈妈又给了他2个苹果，小明现在一共有几个苹果？',
    options: ['4个', '5个', '6个', '7个'],
    answer: 'B',
    analysis: '这是一道加法题。小明原来有3个苹果，妈妈又给了他2个，所以要用加法：3 + 2 = 5（个）。答案是5个苹果。',
    knowledgePoint: '10以内加法',
    difficulty: 1,
    type: 'choice'
  },
  {
    id: 1002,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade1',
    gradeName: '一年级',
    title: '10以内减法',
    question: '树上有8只小鸟，飞走了3只，树上还剩几只小鸟？',
    options: ['4只', '5只', '6只', '11只'],
    answer: 'B',
    analysis: '这是一道减法题。树上原来有8只小鸟，飞走了3只，所以要用减法：8 - 3 = 5（只）。答案是还剩5只小鸟。',
    knowledgePoint: '10以内减法',
    difficulty: 1,
    type: 'choice'
  },
  {
    id: 1003,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade1',
    gradeName: '一年级',
    title: '数的组成',
    question: '7可以分成3和几？',
    answer: '4',
    analysis: '7可以分成3和4，因为3 + 4 = 7。数的组成是学习加减法的基础。',
    knowledgePoint: '数的组成',
    difficulty: 1,
    type: 'fill'
  },
  {
    id: 1004,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade1',
    gradeName: '一年级',
    title: '比较大小',
    question: '在○里填上">"、"<"或"="：6 ○ 9',
    answer: '<',
    analysis: '6小于9，所以6 < 9。比较数的大小时，可以看数数时谁先数到，先数到的数较小。',
    knowledgePoint: '比较大小',
    difficulty: 1,
    type: 'fill'
  },
  // 三年级数学
  {
    id: 1005,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade3',
    gradeName: '三年级',
    title: '两位数加法',
    question: '计算：45 + 27 = ?',
    answer: '72',
    analysis: '45 + 27，个位5 + 7 = 12，写2进1；十位4 + 2 + 1 = 7。所以45 + 27 = 72。注意进位加法。',
    knowledgePoint: '两位数加法',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 1006,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade3',
    gradeName: '三年级',
    title: '乘法口诀',
    question: '7 × 8 = ?',
    answer: '56',
    analysis: '根据乘法口诀"七八五十六"，7 × 8 = 56。乘法口诀是计算乘法的基础。',
    knowledgePoint: '乘法口诀',
    difficulty: 2,
    type: 'fill'
  },
  // 三年级语文
  {
    id: 1007,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade3',
    gradeName: '三年级',
    title: '看拼音写词语',
    question: '看拼音写词语：qīng chén（    ）',
    answer: '清晨',
    analysis: '"qīng chén"对应的词语是"清晨"，意思是清早、太阳刚出来的时候。注意"晨"字的写法，上面是"日"，下面是"辰"。',
    knowledgePoint: '拼音与汉字',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 1008,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade3',
    gradeName: '三年级',
    title: '组词',
    question: '用"花"字组两个词：花（  ）、花（  ）',
    answer: '花朵、花园',
    analysis: '"花"可以组成很多词语，如：花朵、花园、花草、开花、鲜花等。组词时要注意词语的意义要完整。',
    knowledgePoint: '组词',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 1009,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade3',
    gradeName: '三年级',
    title: '近义词',
    question: '"安静"的近义词是什么？',
    options: ['热闹', '寂静', '吵闹', '喧哗'],
    answer: 'B',
    analysis: '"安静"的意思是没有声音、很平静。它的近义词是"寂静"。"热闹"是反义词，"吵闹"和"喧哗"也是反义词。',
    knowledgePoint: '近义词',
    difficulty: 2,
    type: 'choice'
  },
  // 五年级英语
  {
    id: 1010,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade5',
    gradeName: '五年级',
    title: '单词翻译',
    question: '"apple"的中文意思是？',
    options: ['香蕉', '苹果', '橙子', '葡萄'],
    answer: 'B',
    analysis: '"apple"是英语单词，意思是"苹果"。常见的水果单词还有：banana（香蕉）、orange（橙子）、grape（葡萄）。',
    knowledgePoint: '基础词汇',
    difficulty: 2,
    type: 'choice'
  },
  {
    id: 1011,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade5',
    gradeName: '五年级',
    title: '句子翻译',
    question: '"How are you?"的中文意思是？',
    options: ['你是谁？', '你好吗？', '你叫什么？', '你在哪？'],
    answer: 'B',
    analysis: '"How are you?"是英语中常用的问候语，意思是"你好吗？"。回答通常是"I\'m fine, thank you."（我很好，谢谢。）',
    knowledgePoint: '日常用语',
    difficulty: 2,
    type: 'choice'
  },
  // 六年级数学
  {
    id: 1012,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade6',
    gradeName: '六年级',
    title: '分数加法',
    question: '计算：1/4 + 2/4 = ?',
    options: ['3/8', '3/4', '1/2', '2/4'],
    answer: 'B',
    analysis: '同分母分数相加，分母不变，分子相加。1/4 + 2/4 = (1+2)/4 = 3/4。',
    knowledgePoint: '分数加法',
    difficulty: 3,
    type: 'choice'
  },
];

// 初中题目
const middleSchoolQuestions: Question[] = [
  // 七年级数学
  {
    id: 2001,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade7',
    gradeName: '七年级',
    title: '有理数加法',
    question: '计算：(-3) + (+5) = ?',
    answer: '2',
    analysis: '异号两数相加，取绝对值较大的数的符号，并用较大的绝对值减去较小的绝对值。|+5| > |-3|，所以结果为正，5 - 3 = 2。',
    knowledgePoint: '有理数加法',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 2002,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade7',
    gradeName: '七年级',
    title: '一元一次方程',
    question: '解方程：2x + 3 = 9',
    answer: 'x = 3',
    analysis: '解一元一次方程的步骤：\n1. 移项：2x = 9 - 3\n2. 合并：2x = 6\n3. 系数化为1：x = 6 ÷ 2 = 3\n所以 x = 3。',
    knowledgePoint: '一元一次方程',
    difficulty: 3,
    type: 'fill'
  },
  // 八年级数学
  {
    id: 2003,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade8',
    gradeName: '八年级',
    title: '勾股定理',
    question: '直角三角形的两条直角边分别为3和4，求斜边的长度。',
    answer: '5',
    analysis: '根据勾股定理：a² + b² = c²，其中a、b是直角边，c是斜边。\n3² + 4² = c²\n9 + 16 = c²\n25 = c²\nc = 5\n所以斜边长度为5。',
    knowledgePoint: '勾股定理',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 2004,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade8',
    gradeName: '八年级',
    title: '因式分解',
    question: '因式分解：x² - 9 = ?',
    answer: '(x + 3)(x - 3)',
    analysis: '这是平方差公式的应用。平方差公式：a² - b² = (a + b)(a - b)。\nx² - 9 = x² - 3² = (x + 3)(x - 3)',
    knowledgePoint: '因式分解',
    difficulty: 3,
    type: 'fill'
  },
  // 九年级数学
  {
    id: 2005,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade9',
    gradeName: '九年级',
    title: '一元二次方程',
    question: '解方程：x² - 5x + 6 = 0',
    answer: 'x₁ = 2, x₂ = 3',
    analysis: '使用因式分解法：\nx² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\n所以 x - 2 = 0 或 x - 3 = 0\n解得 x₁ = 2, x₂ = 3',
    knowledgePoint: '一元二次方程',
    difficulty: 4,
    type: 'fill'
  },
  {
    id: 2006,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade9',
    gradeName: '九年级',
    title: '一元二次方程判别式',
    question: '已知关于x的方程x² - 4x + m = 0有两个相等的实数根，求m的值。',
    answer: 'm = 4',
    analysis: '一元二次方程ax² + bx + c = 0有两个相等的实数根的条件是判别式Δ = 0。\nΔ = b² - 4ac = 0\n(-4)² - 4(1)(m) = 0\n16 - 4m = 0\nm = 4',
    knowledgePoint: '一元二次方程判别式',
    difficulty: 4,
    type: 'fill'
  },
  // 初中语文
  {
    id: 2007,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade7',
    gradeName: '七年级',
    title: '古诗词默写',
    question: '默写：《静夜思》李白\n床前明月光，疑是地上霜。\n举头望明月，______。',
    answer: '低头思故乡',
    analysis: '《静夜思》是唐代诗人李白的作品，全诗为：\n床前明月光，疑是地上霜。\n举头望明月，低头思故乡。\n这首诗表达了诗人对故乡的思念之情。',
    knowledgePoint: '古诗词默写',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 2008,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade8',
    gradeName: '八年级',
    title: '文言文翻译',
    question: '翻译：「学而时习之，不亦说乎？」',
    answer: '学习并时常复习，不也是很愉快的事吗？',
    analysis: '这句话出自《论语·学而》。\n- 学：学习\n- 而：连词，表示并列\n- 时：按时、时常\n- 习：复习、练习\n- 之：代词，指学过的知识\n- 不亦...乎：不也是...吗（反问句式）\n- 说：通"悦"，愉快',
    knowledgePoint: '文言文翻译',
    difficulty: 3,
    type: 'fill'
  },
  // 初中英语
  {
    id: 2009,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade7',
    gradeName: '七年级',
    title: '一般现在时',
    question: '用所给词的适当形式填空：He ______ (go) to school every day.',
    answer: 'goes',
    analysis: '这是一般现在时的用法。主语"He"是第三人称单数，谓语动词要用第三人称单数形式。go的第三人称单数形式是goes（以o结尾，加es）。',
    knowledgePoint: '一般现在时',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 2010,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade8',
    gradeName: '八年级',
    title: '过去进行时',
    question: '用所给词的适当形式填空：I ______ (read) a book at 8 o\'clock last night.',
    answer: 'was reading',
    analysis: '这是过去进行时的用法。过去进行时的结构是：was/were + 动词ing形式。\n- 时间状语"at 8 o\'clock last night"表示过去某一时刻\n- 主语"I"用was\n- read的ing形式是reading\n所以答案是was reading。',
    knowledgePoint: '过去进行时',
    difficulty: 3,
    type: 'fill'
  },
  // 初中物理
  {
    id: 2011,
    subject: 'physics',
    subjectName: '物理',
    grade: 'grade8',
    gradeName: '八年级',
    title: '速度计算',
    question: '一辆汽车在平直公路上行驶，2小时内行驶了120公里，求汽车的平均速度。',
    answer: '60 km/h',
    analysis: '根据速度公式：v = s/t\n- s = 120 km（路程）\n- t = 2 h（时间）\nv = 120 km ÷ 2 h = 60 km/h\n所以汽车的平均速度是60 km/h。',
    knowledgePoint: '速度计算',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 2012,
    subject: 'physics',
    subjectName: '物理',
    grade: 'grade9',
    gradeName: '九年级',
    title: '欧姆定律',
    question: '一个电阻为10Ω的导体，两端电压为6V，求通过导体的电流。',
    answer: '0.6 A',
    analysis: '根据欧姆定律：I = U/R\n- U = 6 V（电压）\n- R = 10 Ω（电阻）\nI = 6 V ÷ 10 Ω = 0.6 A\n所以通过导体的电流是0.6 A。',
    knowledgePoint: '欧姆定律',
    difficulty: 3,
    type: 'fill'
  },
  // 初中化学
  {
    id: 2013,
    subject: 'chemistry',
    subjectName: '化学',
    grade: 'grade9',
    gradeName: '九年级',
    title: '元素符号',
    question: '写出下列元素的符号：氢、氧、碳、铁',
    answer: 'H、O、C、Fe',
    analysis: '常见元素的符号：\n- 氢：H（Hydrogen）\n- 氧：O（Oxygen）\n- 碳：C（Carbon）\n- 铁：Fe（Ferrum，拉丁文）\n注意：元素符号第一个字母大写，第二个字母小写。',
    knowledgePoint: '元素符号',
    difficulty: 2,
    type: 'fill'
  },
  {
    id: 2014,
    subject: 'chemistry',
    subjectName: '化学',
    grade: 'grade9',
    gradeName: '九年级',
    title: '化学方程式',
    question: '写出水通电分解的化学方程式。',
    answer: '2H₂O → 2H₂↑ + O₂↑（通电）',
    analysis: '水通电分解生成氢气和氧气：\n2H₂O =通电= 2H₂↑ + O₂↑\n注意：\n1. 要配平化学方程式\n2. 生成气体要标"↑"\n3. 反应条件要标注',
    knowledgePoint: '化学方程式',
    difficulty: 3,
    type: 'fill'
  },
];

// 高中题目
const highSchoolQuestions: Question[] = [
  // 高一数学
  {
    id: 3001,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade10',
    gradeName: '高一',
    title: '集合运算',
    question: '已知集合A = {1, 2, 3, 4}，B = {2, 4, 6, 8}，求A∩B和A∪B。',
    answer: 'A∩B = {2, 4}，A∪B = {1, 2, 3, 4, 6, 8}',
    analysis: '集合的运算：\n- 交集A∩B：由属于A且属于B的所有元素组成\n  A∩B = {2, 4}（2和4同时在A和B中）\n- 并集A∪B：由属于A或属于B的所有元素组成\n  A∪B = {1, 2, 3, 4, 6, 8}（合并所有元素，不重复）',
    knowledgePoint: '集合运算',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 3002,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade10',
    gradeName: '高一',
    title: '函数定义域',
    question: '求函数f(x) = √(x-1)的定义域。',
    answer: '[1, +∞)',
    analysis: '求函数定义域时，要使根号内的式子有意义，需要：\nx - 1 ≥ 0\nx ≥ 1\n所以函数的定义域为[1, +∞)。',
    knowledgePoint: '函数定义域',
    difficulty: 3,
    type: 'fill'
  },
  // 高二数学
  {
    id: 3003,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade11',
    gradeName: '高二',
    title: '等差数列',
    question: '等差数列{an}中，a₁ = 2，公差d = 3，求a₁₀和前10项和S₁₀。',
    answer: 'a₁₀ = 29，S₁₀ = 155',
    analysis: '等差数列公式：\n1. 通项公式：an = a₁ + (n-1)d\n   a₁₀ = 2 + (10-1)×3 = 2 + 27 = 29\n\n2. 前n项和公式：Sn = n×a₁ + n(n-1)d/2\n   S₁₀ = 10×2 + 10×9×3/2 = 20 + 135 = 155',
    knowledgePoint: '等差数列',
    difficulty: 4,
    type: 'fill'
  },
  {
    id: 3004,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade11',
    gradeName: '高二',
    title: '导数',
    question: '求函数f(x) = x³ - 3x² + 2的导数。',
    answer: "f'(x) = 3x² - 6x",
    analysis: '利用求导法则：\n- (xⁿ)\' = nxⁿ⁻¹\n- (常数)\' = 0\n\nf(x) = x³ - 3x² + 2\nf\'(x) = 3x² - 3×2x + 0 = 3x² - 6x',
    knowledgePoint: '导数',
    difficulty: 4,
    type: 'fill'
  },
  // 高三数学
  {
    id: 3005,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade12',
    gradeName: '高三',
    title: '三角函数',
    question: '已知sinα = 3/5，α为第二象限角，求cosα和tanα。',
    answer: 'cosα = -4/5，tanα = -3/4',
    analysis: '利用三角函数基本关系：\n1. sin²α + cos²α = 1\n   (3/5)² + cos²α = 1\n   9/25 + cos²α = 1\n   cos²α = 16/25\n   cosα = ±4/5\n\n2. 因为α为第二象限角，cosα < 0\n   所以cosα = -4/5\n\n3. tanα = sinα/cosα = (3/5)/(-4/5) = -3/4',
    knowledgePoint: '三角函数',
    difficulty: 4,
    type: 'fill'
  },
  {
    id: 3006,
    subject: 'math',
    subjectName: '数学',
    grade: 'grade12',
    gradeName: '高三',
    title: '概率',
    question: '从1,2,3,4,5这五个数中随机取两个数，求取出的两个数之和为偶数的概率。',
    answer: 'P = 2/5',
    analysis: '从5个数中取2个，共有C(5,2) = 10种取法。\n\n两数之和为偶数的情况：\n1. 两个都是奇数：从{1,3,5}中取2个，C(3,2) = 3种\n2. 两个都是偶数：从{2,4}中取2个，C(2,2) = 1种\n\n共3 + 1 = 4种\n\n所以P = 4/10 = 2/5',
    knowledgePoint: '概率',
    difficulty: 4,
    type: 'fill'
  },
  // 高中语文
  {
    id: 3007,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade10',
    gradeName: '高一',
    title: '文言文虚词',
    question: '解释下列句中"之"的用法：\n「师道之不传也久矣」',
    answer: '助词，用于主谓之间，取消句子独立性，不译',
    analysis: '"师道之不传也久矣"出自韩愈《师说》。\n\n"之"的用法分析：\n- "师道"是主语\n- "不传"是谓语\n- "之"用在主谓之间，使"师道不传"这个主谓结构变成名词性短语，作整个句子的主语\n- 这种用法叫"取消句子独立性"\n\n全句意思：从师学习的风尚不流传已经很久了。',
    knowledgePoint: '文言文虚词',
    difficulty: 4,
    type: 'fill'
  },
  {
    id: 3008,
    subject: 'chinese',
    subjectName: '语文',
    grade: 'grade11',
    gradeName: '高二',
    title: '古诗词鉴赏',
    question: '分析杜甫《登高》中"无边落木萧萧下，不尽长江滚滚来"的意境。',
    answer: '这两句诗通过描绘秋天落叶纷飞、长江奔流不息的景象，营造出雄浑壮阔而又萧瑟悲凉的意境，表达了诗人漂泊无依、老病孤愁的感慨。',
    analysis: '意境分析：\n1. "无边落木萧萧下"\n   - "无边"写落叶之广\n   - "萧萧"拟声，写落叶之声\n   - 描绘秋天树叶飘落的景象，暗含生命凋零之意\n\n2. "不尽长江滚滚来"\n   - "不尽"写江水之长\n   - "滚滚"写江水之势\n   - 描绘长江奔流的壮阔景象\n\n3. 两句对比\n   - 落木萧萧（生命短暂）vs 长江滚滚（时间永恒）\n   - 表达了诗人对时光流逝、人生短暂的感慨',
    knowledgePoint: '古诗词鉴赏',
    difficulty: 5,
    type: 'essay'
  },
  // 高中英语
  {
    id: 3009,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade10',
    gradeName: '高一',
    title: '定语从句',
    question: '用定语从句合并句子：\nThe book is very interesting. I bought it yesterday.',
    answer: 'The book that/which I bought yesterday is very interesting.',
    analysis: '定语从句的构成：\n1. 确定先行词：The book（物）\n2. 选择关系代词：指物用that或which\n3. 合并句子：\n   - 主句：The book is very interesting\n   - 从句：I bought it yesterday → I bought ___ yesterday\n   - 合并：The book that/which I bought yesterday is very interesting.',
    knowledgePoint: '定语从句',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 3010,
    subject: 'english',
    subjectName: '英语',
    grade: 'grade11',
    gradeName: '高二',
    title: '虚拟语气',
    question: '用虚拟语气填空：If I ___ (be) you, I would study harder.',
    answer: 'were',
    analysis: '这是虚拟语气在与现在事实相反的条件句中的用法。\n\n结构：If + 主语 + 动词过去式（be用were），主语 + would/could/might + 动词原形\n\n因为是与现在事实相反的假设（我不可能是你），所以be动词要用were，不用was。',
    knowledgePoint: '虚拟语气',
    difficulty: 4,
    type: 'fill'
  },
  // 高中物理
  {
    id: 3011,
    subject: 'physics',
    subjectName: '物理',
    grade: 'grade10',
    gradeName: '高一',
    title: '牛顿第二定律',
    question: '一个质量为2kg的物体，受到水平方向10N的力作用，求物体的加速度。（不计摩擦）',
    answer: 'a = 5 m/s²',
    analysis: '根据牛顿第二定律：F = ma\n- F = 10 N（合力）\n- m = 2 kg（质量）\n\na = F/m = 10/2 = 5 m/s²\n\n所以物体的加速度为5 m/s²，方向与力的方向相同。',
    knowledgePoint: '牛顿第二定律',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 3012,
    subject: 'physics',
    subjectName: '物理',
    grade: 'grade11',
    gradeName: '高二',
    title: '电场强度',
    question: '真空中有一个点电荷Q = 2×10⁻⁶C，求距其0.3m处的电场强度。（k = 9×10⁹ N·m²/C²）',
    answer: 'E = 2×10⁵ N/C',
    analysis: '根据点电荷电场强度公式：E = kQ/r²\n- k = 9×10⁹ N·m²/C²\n- Q = 2×10⁻⁶ C\n- r = 0.3 m\n\nE = (9×10⁹ × 2×10⁻⁶) / 0.3²\n  = 18×10³ / 0.09\n  = 2×10⁵ N/C\n\n所以电场强度为2×10⁵ N/C，方向沿径向向外（正电荷）。',
    knowledgePoint: '电场强度',
    difficulty: 4,
    type: 'fill'
  },
  // 高中化学
  {
    id: 3013,
    subject: 'chemistry',
    subjectName: '化学',
    grade: 'grade10',
    gradeName: '高一',
    title: '物质的量',
    question: '求0.5mol H₂O中含有多少个水分子？含有多少mol氢原子？',
    answer: '水分子数：3.01×10²³个，氢原子：1mol',
    analysis: '1. 水分子数计算：\n   N = n × NA = 0.5 × 6.02×10²³ = 3.01×10²³个\n\n2. 氢原子物质的量：\n   每个H₂O分子含2个H原子\n   n(H) = 2 × n(H₂O) = 2 × 0.5 = 1 mol',
    knowledgePoint: '物质的量',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 3014,
    subject: 'chemistry',
    subjectName: '化学',
    grade: 'grade11',
    gradeName: '高二',
    title: '化学平衡',
    question: '对于反应N₂ + 3H₂ ⇌ 2NH₃，下列措施能使平衡向正反应方向移动的是？\nA. 增大压强 B. 升高温度 C. 减小NH₃浓度 D. 使用催化剂',
    answer: 'AC',
    analysis: '根据勒夏特列原理分析：\n\nA. 增大压强 ✓\n   正反应气体分子数减少（4→2），增大压强平衡向气体分子数减少的方向移动\n\nB. 升高温度 ✗\n   合成氨是放热反应，升高温度平衡向吸热方向（逆反应）移动\n\nC. 减小NH₃浓度 ✓\n   减小生成物浓度，平衡向正反应方向移动\n\nD. 使用催化剂 ✗\n   催化剂同等程度改变正逆反应速率，不改变平衡位置',
    knowledgePoint: '化学平衡',
    difficulty: 4,
    type: 'choice'
  },
  // 高中生物
  {
    id: 3015,
    subject: 'biology',
    subjectName: '生物',
    grade: 'grade10',
    gradeName: '高一',
    title: '光合作用',
    question: '光合作用的光反应阶段发生在叶绿体的哪个部位？光反应的产物是什么？',
    answer: '类囊体薄膜；产物是O₂、[H]（NADPH）和ATP',
    analysis: '光合作用的光反应：\n\n1. 场所：叶绿体的类囊体薄膜上\n\n2. 条件：光照、色素、酶\n\n3. 物质变化：\n   - 水的光解：H₂O → [H] + O₂\n   - ATP的合成：ADP + Pi → ATP\n\n4. 能量变化：光能 → ATP中活跃的化学能\n\n5. 产物：O₂、[H]（NADPH）、ATP',
    knowledgePoint: '光合作用',
    difficulty: 3,
    type: 'fill'
  },
  {
    id: 3016,
    subject: 'biology',
    subjectName: '生物',
    grade: 'grade11',
    gradeName: '高二',
    title: '遗传规律',
    question: '基因型为AaBb的个体自交，后代中A_B_的概率是多少？',
    answer: '9/16',
    analysis: '利用自由组合定律分析：\n\nAaBb自交，两对基因独立遗传：\n- Aa × Aa → A_概率为3/4\n- Bb × Bb → B_概率为3/4\n\n所以A_B_的概率 = 3/4 × 3/4 = 9/16\n\n也可以用棋盘法验证：\nA_B_ : A_bb : aaB_ : aabb = 9:3:3:1',
    knowledgePoint: '遗传规律',
    difficulty: 4,
    type: 'fill'
  },
];

// 导出所有题目
export const questions: Question[] = [
  ...elementaryQuestions,
  ...middleSchoolQuestions,
  ...highSchoolQuestions,
];

// 学科配置
export const subjects = [
  { id: 'math', name: '数学', icon: 'calculator' },
  { id: 'chinese', name: '语文', icon: 'book' },
  { id: 'english', name: '英语', icon: 'language' },
  { id: 'physics', name: '物理', icon: 'atom' },
  { id: 'chemistry', name: '化学', icon: 'flask' },
  { id: 'biology', name: '生物', icon: 'leaf' },
];

// 年级配置
export const grades = [
  { id: 'grade1', name: '一年级', stage: 'elementary' },
  { id: 'grade2', name: '二年级', stage: 'elementary' },
  { id: 'grade3', name: '三年级', stage: 'elementary' },
  { id: 'grade4', name: '四年级', stage: 'elementary' },
  { id: 'grade5', name: '五年级', stage: 'elementary' },
  { id: 'grade6', name: '六年级', stage: 'elementary' },
  { id: 'grade7', name: '七年级', stage: 'middle' },
  { id: 'grade8', name: '八年级', stage: 'middle' },
  { id: 'grade9', name: '九年级', stage: 'middle' },
  { id: 'grade10', name: '高一', stage: 'high' },
  { id: 'grade11', name: '高二', stage: 'high' },
  { id: 'grade12', name: '高三', stage: 'high' },
];

// 学段配置
export const stages = [
  { id: 'elementary', name: '小学', grades: ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] },
  { id: 'middle', name: '初中', grades: ['grade7', 'grade8', 'grade9'] },
  { id: 'high', name: '高中', grades: ['grade10', 'grade11', 'grade12'] },
];
