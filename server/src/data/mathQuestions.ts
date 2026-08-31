// 数学题库 - 全类型全年级覆盖
// 覆盖: 小学1-6年级、初中7-9年级、高中10-12年级
// 题型: 选择题、填空题、计算题、应用题

export interface MathQuestion {
  id: number;
  grade: string;
  gradeName: string;
  semester: 'upper' | 'lower';
  chapter?: string;
  title: string;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
  knowledgePoint: string;
  knowledgeTags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: 'choice' | 'fill' | 'calculation' | 'application';
}

// ============ 小学数学题目 ============
const elementaryMathQuestions: MathQuestion[] = [
  // 一年级
  { id: 20001, grade: 'grade1', gradeName: '一年级', semester: 'upper', chapter: '1-10的认识', title: '10以内加法', question: '小明有3个苹果，妈妈又给了他2个苹果，小明现在一共有几个苹果？', options: ['4个', '5个', '6个', '7个'], answer: 'B', analysis: '这是一道加法题。3 + 2 = 5（个）。', knowledgePoint: '10以内加法', knowledgeTags: ['加法', '10以内', '应用题'], difficulty: 1, type: 'choice' },
  { id: 20002, grade: 'grade1', gradeName: '一年级', semester: 'upper', chapter: '1-10的认识', title: '10以内减法', question: '树上有8只小鸟，飞走了3只，树上还剩几只小鸟？', options: ['4只', '5只', '6只', '11只'], answer: 'B', analysis: '8 - 3 = 5（只）。', knowledgePoint: '10以内减法', knowledgeTags: ['减法', '10以内'], difficulty: 1, type: 'choice' },
  { id: 20003, grade: 'grade1', gradeName: '一年级', semester: 'upper', chapter: '1-10的认识', title: '数的组成', question: '一个两位数，十位上是1，个位上是5，这个数是多少？', options: ['15', '51', '10', '5'], answer: 'A', analysis: '十位1表示1个十，个位5表示5个一，合起来是15。', knowledgePoint: '数的组成', knowledgeTags: ['数的认识', '数位'], difficulty: 1, type: 'choice' },
  { id: 20004, grade: 'grade1', gradeName: '一年级', semester: 'lower', chapter: '20以内退位减法', title: '退位减法', question: '计算：15 - 8 = ?', options: ['5', '6', '7', '8'], answer: 'C', analysis: '15 - 8 = 7。想：8 + 7 = 15。', knowledgePoint: '20以内退位减法', knowledgeTags: ['减法', '退位'], difficulty: 1, type: 'choice' },
  { id: 20005, grade: 'grade1', gradeName: '一年级', semester: 'lower', chapter: '100以内数', title: '数的顺序', question: '在56和58之间的数是几？', options: ['55', '57', '59', '60'], answer: 'B', analysis: '56、57、58按顺序排列，中间是57。', knowledgePoint: '数的顺序', knowledgeTags: ['数的认识', '数的顺序'], difficulty: 1, type: 'choice' },
  // 二年级
  { id: 20010, grade: 'grade2', gradeName: '二年级', semester: 'upper', chapter: '100以内加减法', title: '两位数加法', question: '计算：36 + 47 = ?', options: ['73', '83', '93', '63'], answer: 'B', analysis: '个位6+7=13写3进1，十位3+4+1=8。36+47=83。', knowledgePoint: '两位数加法', knowledgeTags: ['加法', '进位'], difficulty: 2, type: 'choice' },
  { id: 20011, grade: 'grade2', gradeName: '二年级', semester: 'upper', chapter: '100以内加减法', title: '两位数减法', question: '计算：82 - 35 = ?', options: ['47', '57', '37', '67'], answer: 'A', analysis: '个位2不够减5，借位12-5=7，十位7-3=4。82-35=47。', knowledgePoint: '两位数减法', knowledgeTags: ['减法', '退位'], difficulty: 2, type: 'choice' },
  { id: 20012, grade: 'grade2', gradeName: '二年级', semester: 'upper', chapter: '表内乘法', title: '乘法口诀', question: '计算：7 × 8 = ?', options: ['54', '56', '58', '64'], answer: 'B', analysis: '七八五十六，7×8=56。', knowledgePoint: '乘法口诀', knowledgeTags: ['乘法', '口诀'], difficulty: 2, type: 'choice' },
  { id: 20013, grade: 'grade2', gradeName: '二年级', semester: 'upper', chapter: '表内乘法', title: '乘法应用', question: '每盒有6支彩笔，4盒一共有多少支彩笔？', options: ['20支', '22支', '24支', '28支'], answer: 'C', analysis: '6×4=24（支）。', knowledgePoint: '乘法应用', knowledgeTags: ['乘法', '应用题'], difficulty: 2, type: 'choice' },
  { id: 20014, grade: 'grade2', gradeName: '二年级', semester: 'lower', chapter: '表内除法', title: '除法计算', question: '计算：24 ÷ 6 = ?', options: ['3', '4', '5', '6'], answer: 'B', analysis: '6×4=24，所以24÷6=4。', knowledgePoint: '表内除法', knowledgeTags: ['除法'], difficulty: 2, type: 'choice' },
  { id: 20015, grade: 'grade2', gradeName: '二年级', semester: 'lower', chapter: '表内除法', title: '除法应用', question: '把12个苹果平均分给3个小朋友，每人分几个？', options: ['3个', '4个', '5个', '6个'], answer: 'B', analysis: '12÷3=4（个）。', knowledgePoint: '除法应用', knowledgeTags: ['除法', '平均分'], difficulty: 2, type: 'choice' },
  // 三年级
  { id: 20020, grade: 'grade3', gradeName: '三年级', semester: 'upper', chapter: '万以内加减法', title: '三位数加法', question: '计算：456 + 278 = ?', options: ['624', '724', '734', '634'], answer: 'C', analysis: '456+278=734。', knowledgePoint: '三位数加法', knowledgeTags: ['加法', '三位数'], difficulty: 2, type: 'choice' },
  { id: 20021, grade: 'grade3', gradeName: '三年级', semester: 'upper', chapter: '万以内加减法', title: '三位数减法', question: '计算：803 - 256 = ?', options: ['547', '557', '647', '657'], answer: 'A', analysis: '803-256=547。', knowledgePoint: '三位数减法', knowledgeTags: ['减法', '三位数'], difficulty: 2, type: 'choice' },
  { id: 20022, grade: 'grade3', gradeName: '三年级', semester: 'upper', chapter: '多位数乘一位数', title: '两位数乘一位数', question: '计算：23 × 4 = ?', options: ['82', '92', '86', '96'], answer: 'B', analysis: '23×4=92。', knowledgePoint: '两位数乘一位数', knowledgeTags: ['乘法'], difficulty: 2, type: 'choice' },
  { id: 20023, grade: 'grade3', gradeName: '三年级', semester: 'upper', chapter: '分数初步', title: '分数认识', question: '把一个蛋糕平均分成4份，每份是这个蛋糕的几分之几？', options: ['1/2', '1/3', '1/4', '1/5'], answer: 'C', analysis: '平均分成4份，每份是1/4。', knowledgePoint: '分数认识', knowledgeTags: ['分数', '平均分'], difficulty: 2, type: 'choice' },
  { id: 20024, grade: 'grade3', gradeName: '三年级', semester: 'lower', chapter: '两位数乘两位数', title: '两位数乘法', question: '计算：23 × 15 = ?', options: ['335', '345', '355', '365'], answer: 'B', analysis: '23×15=345。', knowledgePoint: '两位数乘两位数', knowledgeTags: ['乘法', '两位数'], difficulty: 2, type: 'choice' },
  { id: 20025, grade: 'grade3', gradeName: '三年级', semester: 'lower', chapter: '面积', title: '长方形面积', question: '一个长方形，长8厘米，宽5厘米，面积是多少平方厘米？', options: ['13', '26', '40', '80'], answer: 'C', analysis: '面积=长×宽=8×5=40（平方厘米）。', knowledgePoint: '长方形面积', knowledgeTags: ['面积', '长方形'], difficulty: 2, type: 'choice' },
  // 四年级
  { id: 20030, grade: 'grade4', gradeName: '四年级', semester: 'upper', chapter: '大数认识', title: '大数读写', question: '三千零五万零六十写作什么？', options: ['30050060', '3050060', '3005060', '30050006'], answer: 'A', analysis: '三千零五万是3005万，零六十是60，写作30050060。', knowledgePoint: '大数读写', knowledgeTags: ['大数', '读写'], difficulty: 3, type: 'choice' },
  { id: 20031, grade: 'grade4', gradeName: '四年级', semester: 'upper', chapter: '三位数乘两位数', title: '大数乘法', question: '计算：125 × 24 = ?', options: ['2500', '3000', '3500', '2000'], answer: 'B', analysis: '125×8=1000，24=8×3，所以125×24=3000。', knowledgePoint: '三位数乘两位数', knowledgeTags: ['乘法', '巧算'], difficulty: 3, type: 'choice' },
  { id: 20032, grade: 'grade4', gradeName: '四年级', semester: 'upper', chapter: '运算律', title: '乘法分配律', question: '用简便方法计算：25 × (40 + 4) = ?', options: ['1000', '1100', '1200', '1040'], answer: 'B', analysis: '25×40+25×4=1000+100=1100。', knowledgePoint: '乘法分配律', knowledgeTags: ['运算律', '简便计算'], difficulty: 3, type: 'choice' },
  { id: 20033, grade: 'grade4', gradeName: '四年级', semester: 'lower', chapter: '小数意义', title: '小数认识', question: '0.5里面有多少个0.1？', options: ['5个', '10个', '50个', '100个'], answer: 'A', analysis: '0.5÷0.1=5。', knowledgePoint: '小数意义', knowledgeTags: ['小数'], difficulty: 3, type: 'choice' },
  { id: 20034, grade: 'grade4', gradeName: '四年级', semester: 'lower', chapter: '三角形', title: '三角形内角和', question: '三角形的内角和是多少度？', options: ['90度', '180度', '270度', '360度'], answer: 'B', analysis: '三角形内角和=180度。', knowledgePoint: '三角形内角和', knowledgeTags: ['三角形', '内角和'], difficulty: 3, type: 'choice' },
  // 五年级
  { id: 20040, grade: 'grade5', gradeName: '五年级', semester: 'upper', chapter: '小数乘法', title: '小数乘法', question: '计算：2.5 × 0.4 = ?', options: ['0.1', '1', '10', '0.01'], answer: 'B', analysis: '2.5×0.4=1。', knowledgePoint: '小数乘法', knowledgeTags: ['小数', '乘法'], difficulty: 3, type: 'choice' },
  { id: 20041, grade: 'grade5', gradeName: '五年级', semester: 'upper', chapter: '简易方程', title: '解方程', question: '解方程：3x + 5 = 20，x = ?', options: ['3', '5', '7', '15'], answer: 'B', analysis: '3x=15，x=5。', knowledgePoint: '解方程', knowledgeTags: ['方程'], difficulty: 3, type: 'choice' },
  { id: 20042, grade: 'grade5', gradeName: '五年级', semester: 'upper', chapter: '多边形面积', title: '平行四边形面积', question: '平行四边形底12厘米，高8厘米，面积是？', options: ['20', '40', '96', '192'], answer: 'C', analysis: '面积=底×高=12×8=96（平方厘米）。', knowledgePoint: '平行四边形面积', knowledgeTags: ['面积', '平行四边形'], difficulty: 3, type: 'choice' },
  { id: 20043, grade: 'grade5', gradeName: '五年级', semester: 'upper', chapter: '因数与倍数', title: '质数与合数', question: '下面哪个数是质数？', options: ['9', '15', '21', '29'], answer: 'D', analysis: '29只能被1和29整除，是质数。', knowledgePoint: '质数与合数', knowledgeTags: ['因数', '倍数', '质数'], difficulty: 3, type: 'choice' },
  { id: 20044, grade: 'grade5', gradeName: '五年级', semester: 'lower', chapter: '分数加减', title: '异分母分数加法', question: '计算：1/2 + 1/3 = ?', options: ['2/5', '5/6', '1/5', '2/6'], answer: 'B', analysis: '通分：3/6+2/6=5/6。', knowledgePoint: '异分母分数加法', knowledgeTags: ['分数', '加法', '通分'], difficulty: 3, type: 'choice' },
  { id: 20045, grade: 'grade5', gradeName: '五年级', semester: 'lower', chapter: '长方体和正方体', title: '长方体体积', question: '长方体长5cm，宽4cm，高3cm，体积是？', options: ['12', '60', '20', '120'], answer: 'B', analysis: '体积=5×4×3=60（立方厘米）。', knowledgePoint: '长方体体积', knowledgeTags: ['体积', '长方体'], difficulty: 3, type: 'choice' },
  // 六年级
  { id: 20050, grade: 'grade6', gradeName: '六年级', semester: 'upper', chapter: '分数乘法', title: '百分数应用', question: '一件衣服原价200元，打八折出售，现价是？', options: ['120元', '160元', '180元', '240元'], answer: 'B', analysis: '200×80%=160（元）。', knowledgePoint: '百分数应用', knowledgeTags: ['百分数', '折扣'], difficulty: 3, type: 'choice' },
  { id: 20051, grade: 'grade6', gradeName: '六年级', semester: 'upper', chapter: '圆', title: '圆的面积', question: '圆的半径3cm，面积是？（π取3.14）', options: ['9.42', '18.84', '28.26', '31.4'], answer: 'C', analysis: 'πr²=3.14×9=28.26（平方厘米）。', knowledgePoint: '圆的面积', knowledgeTags: ['圆', '面积'], difficulty: 3, type: 'choice' },
  { id: 20052, grade: 'grade6', gradeName: '六年级', semester: 'upper', chapter: '圆', title: '圆的周长', question: '圆的直径10cm，周长是？（π取3.14）', options: ['15.7', '31.4', '62.8', '78.5'], answer: 'B', analysis: 'πd=3.14×10=31.4（厘米）。', knowledgePoint: '圆的周长', knowledgeTags: ['圆', '周长'], difficulty: 3, type: 'choice' },
  { id: 20053, grade: 'grade6', gradeName: '六年级', semester: 'lower', chapter: '比例', title: '比例尺应用', question: '比例尺1:100000，图上5cm代表实际多少千米？', options: ['5千米', '50千米', '500千米', '5000千米'], answer: 'A', analysis: '5×100000cm=5km。', knowledgePoint: '比例尺', knowledgeTags: ['比例', '比例尺'], difficulty: 3, type: 'choice' },
  { id: 20054, grade: 'grade6', gradeName: '六年级', semester: 'lower', chapter: '圆柱与圆锥', title: '圆柱体积', question: '圆柱底面半径2cm，高5cm，体积是？（π取3.14）', options: ['31.4', '62.8', '125.6', '251.2'], answer: 'B', analysis: 'πr²h=3.14×4×5=62.8（立方厘米）。', knowledgePoint: '圆柱体积', knowledgeTags: ['圆柱', '体积'], difficulty: 3, type: 'choice' },
];

// ============ 初中数学题目 ============
const middleSchoolMathQuestions: MathQuestion[] = [
  // 七年级
  { id: 30001, grade: 'grade7', gradeName: '七年级', semester: 'upper', chapter: '有理数', title: '有理数加法', question: '计算：(-3) + (+5) = ?', options: ['-8', '-2', '2', '8'], answer: 'C', analysis: '异号相加，取绝对值大的符号，5-3=2。', knowledgePoint: '有理数加法', knowledgeTags: ['有理数', '加法'], difficulty: 2, type: 'choice' },
  { id: 30002, grade: 'grade7', gradeName: '七年级', semester: 'upper', chapter: '有理数', title: '有理数乘法', question: '计算：(-2) × (-3) × 4 = ?', options: ['-24', '-12', '12', '24'], answer: 'D', analysis: '负负得正，2×3×4=24。', knowledgePoint: '有理数乘法', knowledgeTags: ['有理数', '乘法'], difficulty: 2, type: 'choice' },
  { id: 30003, grade: 'grade7', gradeName: '七年级', semester: 'upper', chapter: '有理数', title: '绝对值', question: '|-5| + |3| = ?', options: ['-8', '-2', '2', '8'], answer: 'D', analysis: '|-5|=5，|3|=3，5+3=8。', knowledgePoint: '绝对值', knowledgeTags: ['绝对值'], difficulty: 2, type: 'choice' },
  { id: 30004, grade: 'grade7', gradeName: '七年级', semester: 'upper', chapter: '整式加减', title: '合并同类项', question: '化简：3x² + 2x - 5x² + 4x = ?', options: ['-2x² + 6x', '8x² + 6x', '-2x² - 2x', '2x² + 6x'], answer: 'A', analysis: '3x²-5x²=-2x²，2x+4x=6x。', knowledgePoint: '合并同类项', knowledgeTags: ['整式', '同类项'], difficulty: 2, type: 'choice' },
  { id: 30005, grade: 'grade7', gradeName: '七年级', semester: 'upper', chapter: '一元一次方程', title: '解方程', question: '解方程：2x - 5 = 3x + 1，x = ?', options: ['-6', '-4', '4', '6'], answer: 'A', analysis: '移项：-x=6，x=-6。', knowledgePoint: '一元一次方程', knowledgeTags: ['方程'], difficulty: 2, type: 'choice' },
  { id: 30006, grade: 'grade7', gradeName: '七年级', semester: 'lower', chapter: '相交线与平行线', title: '平行线性质', question: '直线a∥b，∠1=70°，则同位角∠2=？', options: ['70°', '110°', '120°', '不能确定'], answer: 'A', analysis: '两直线平行，同位角相等。', knowledgePoint: '平行线性质', knowledgeTags: ['平行线', '同位角'], difficulty: 2, type: 'choice' },
  { id: 30007, grade: 'grade7', gradeName: '七年级', semester: 'lower', chapter: '实数', title: '平方根', question: '64的算术平方根是？', options: ['4', '8', '-8', '±8'], answer: 'B', analysis: '8²=64，算术平方根是8。', knowledgePoint: '算术平方根', knowledgeTags: ['实数', '平方根'], difficulty: 2, type: 'choice' },
  { id: 30008, grade: 'grade7', gradeName: '七年级', semester: 'lower', chapter: '二元一次方程组', title: '解方程组', question: 'x+y=5，x-y=1，则x=？y=？', options: ['x=3,y=2', 'x=2,y=3', 'x=4,y=1', 'x=1,y=4'], answer: 'A', analysis: '两式相加2x=6，x=3，y=2。', knowledgePoint: '二元一次方程组', knowledgeTags: ['方程组'], difficulty: 2, type: 'choice' },
  { id: 30009, grade: 'grade7', gradeName: '七年级', semester: 'lower', chapter: '不等式', title: '解不等式', question: '2x - 3 > 5，则x的范围是？', options: ['x > 1', 'x > 4', 'x < 4', 'x > 8'], answer: 'B', analysis: '2x>8，x>4。', knowledgePoint: '一元一次不等式', knowledgeTags: ['不等式'], difficulty: 2, type: 'choice' },
  // 八年级
  { id: 30020, grade: 'grade8', gradeName: '八年级', semester: 'upper', chapter: '三角形', title: '三边关系', question: '下列能组成三角形的是？', options: ['1,2,3', '2,3,4', '2,2,5', '1,1,3'], answer: 'B', analysis: '两边之和大于第三边，2+3>4。', knowledgePoint: '三角形三边关系', knowledgeTags: ['三角形'], difficulty: 2, type: 'choice' },
  { id: 30021, grade: 'grade8', gradeName: '八年级', semester: 'upper', chapter: '全等三角形', title: '全等判定', question: '不能判定全等的是？', options: ['SSS', 'SAS', 'ASA', 'AAA'], answer: 'D', analysis: 'AAA只能判定相似。', knowledgePoint: '全等三角形', knowledgeTags: ['全等', '判定'], difficulty: 2, type: 'choice' },
  { id: 30022, grade: 'grade8', gradeName: '八年级', semester: 'upper', chapter: '因式分解', title: '平方差公式', question: 'x² - 9 = ?', options: ['(x-3)²', '(x+3)²', '(x+3)(x-3)', 'x(x-9)'], answer: 'C', analysis: 'a²-b²=(a+b)(a-b)。', knowledgePoint: '平方差公式', knowledgeTags: ['因式分解'], difficulty: 2, type: 'choice' },
  { id: 30023, grade: 'grade8', gradeName: '八年级', semester: 'lower', chapter: '勾股定理', title: '勾股定理', question: '直角三角形两直角边3和4，斜边=？', options: ['5', '6', '7', '√7'], answer: 'A', analysis: '3²+4²=25=5²。', knowledgePoint: '勾股定理', knowledgeTags: ['勾股定理'], difficulty: 2, type: 'choice' },
  { id: 30024, grade: 'grade8', gradeName: '八年级', semester: 'lower', chapter: '一次函数', title: '一次函数图像', question: 'y=2x-1经过哪几个象限？', options: ['一二三', '一三四', '一二四', '二三四'], answer: 'B', analysis: 'k>0过一三，b<0交y轴负半轴，过一三四。', knowledgePoint: '一次函数图像', knowledgeTags: ['一次函数', '图像'], difficulty: 3, type: 'choice' },
  // 九年级
  { id: 30030, grade: 'grade9', gradeName: '九年级', semester: 'upper', chapter: '一元二次方程', title: '解方程', question: 'x²-5x+6=0的两个根是？', options: ['x=2,3', 'x=-2,-3', 'x=1,6', 'x=-1,-6'], answer: 'A', analysis: '(x-2)(x-3)=0。', knowledgePoint: '一元二次方程', knowledgeTags: ['一元二次方程'], difficulty: 3, type: 'choice' },
  { id: 30031, grade: 'grade9', gradeName: '九年级', semester: 'upper', chapter: '一元二次方程', title: '判别式', question: 'x²+2x+k=0有两个不等实根，k范围？', options: ['k<1', 'k≤1', 'k>1', 'k≥1'], answer: 'A', analysis: 'Δ=4-4k>0，k<1。', knowledgePoint: '判别式', knowledgeTags: ['判别式'], difficulty: 3, type: 'choice' },
  { id: 30032, grade: 'grade9', gradeName: '九年级', semester: 'upper', chapter: '二次函数', title: '顶点坐标', question: 'y=(x-1)²+2的顶点是？', options: ['(1,2)', '(-1,2)', '(1,-2)', '(-1,-2)'], answer: 'A', analysis: '顶点式y=a(x-h)²+k，顶点(h,k)=(1,2)。', knowledgePoint: '二次函数顶点', knowledgeTags: ['二次函数', '顶点'], difficulty: 3, type: 'choice' },
  { id: 30033, grade: 'grade9', gradeName: '九年级', semester: 'upper', chapter: '圆', title: '圆周角', question: '直径所对的圆周角是？', options: ['30°', '45°', '60°', '90°'], answer: 'D', analysis: '直径所对圆周角是直角。', knowledgePoint: '圆周角定理', knowledgeTags: ['圆', '圆周角'], difficulty: 3, type: 'choice' },
  { id: 30034, grade: 'grade9', gradeName: '九年级', semester: 'lower', chapter: '相似', title: '面积比', question: '相似比2:3，面积比是？', options: ['2:3', '3:2', '4:9', '9:4'], answer: 'C', analysis: '面积比=相似比的平方=4:9。', knowledgePoint: '相似三角形面积比', knowledgeTags: ['相似', '面积比'], difficulty: 3, type: 'choice' },
  { id: 30035, grade: 'grade9', gradeName: '九年级', semester: 'lower', chapter: '三角函数', title: 'sin30°', question: 'sin30° = ?', options: ['1/2', '√2/2', '√3/2', '1'], answer: 'A', analysis: '特殊角三角函数值。', knowledgePoint: '特殊角三角函数', knowledgeTags: ['三角函数'], difficulty: 3, type: 'choice' },
];

// ============ 高中数学题目 ============
const highSchoolMathQuestions: MathQuestion[] = [
  // 高一
  { id: 40001, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '集合', title: '集合交集', question: 'A={1,2,3,4}，B={2,4,6,8}，A∩B=？', options: ['{2,4}', '{1,2,3,4,6,8}', '{6,8}', '{1,3}'], answer: 'A', analysis: '交集是共同元素{2,4}。', knowledgePoint: '集合交集', knowledgeTags: ['集合', '交集'], difficulty: 2, type: 'choice' },
  { id: 40002, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '集合', title: '集合补集', question: 'U={1,2,3,4,5}，A={1,3,5}，∁ᵤA=？', options: ['{2,4}', '{1,3,5}', '{1,2,3,4,5}', '∅'], answer: 'A', analysis: '补集是U中不属于A的元素{2,4}。', knowledgePoint: '集合补集', knowledgeTags: ['集合', '补集'], difficulty: 2, type: 'choice' },
  { id: 40003, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '函数', title: '定义域', question: 'f(x)=√(x-1)的定义域是？', options: ['x≥1', 'x>1', 'x≥0', 'x>0'], answer: 'A', analysis: '根号下≥0，x-1≥0，x≥1。', knowledgePoint: '函数定义域', knowledgeTags: ['函数', '定义域'], difficulty: 2, type: 'choice' },
  { id: 40004, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '函数', title: '单调性', question: 'f(x)=x²在哪个区间是减函数？', options: ['(-∞,0)', '(0,+∞)', '(-∞,+∞)', '(1,+∞)'], answer: 'A', analysis: '开口向上，对称轴x=0，(-∞,0)递减。', knowledgePoint: '函数单调性', knowledgeTags: ['函数', '单调性'], difficulty: 2, type: 'choice' },
  { id: 40005, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '指数对数', title: '指数运算', question: '2³ × 2⁴ = ?', options: ['2⁷', '2¹²', '4⁷', '4¹²'], answer: 'A', analysis: '同底数幂相乘，指数相加。', knowledgePoint: '指数运算', knowledgeTags: ['指数'], difficulty: 2, type: 'choice' },
  { id: 40006, grade: 'grade10', gradeName: '高一', semester: 'upper', chapter: '指数对数', title: '对数运算', question: 'lg100 = ?', options: ['1', '2', '10', '100'], answer: 'B', analysis: '10²=100，lg100=2。', knowledgePoint: '对数运算', knowledgeTags: ['对数'], difficulty: 2, type: 'choice' },
  { id: 40007, grade: 'grade10', gradeName: '高一', semester: 'lower', chapter: '三角函数', title: '三角函数定义', question: '单位圆中角α终边交点P(x,y)，sinα=？', options: ['x', 'y', 'x/y', 'y/x'], answer: 'B', analysis: 'sinα=纵坐标y。', knowledgePoint: '三角函数定义', knowledgeTags: ['三角函数', '单位圆'], difficulty: 2, type: 'choice' },
  { id: 40008, grade: 'grade10', gradeName: '高一', semester: 'lower', chapter: '三角函数', title: '诱导公式', question: 'sin(π-α) = ?', options: ['sinα', '-sinα', 'cosα', '-cosα'], answer: 'A', analysis: 'sin(π-α)=sinα。', knowledgePoint: '诱导公式', knowledgeTags: ['三角函数', '诱导公式'], difficulty: 3, type: 'choice' },
  // 高二
  { id: 40020, grade: 'grade11', gradeName: '高二', semester: 'upper', chapter: '数列', title: '等差数列', question: '等差数列{aₙ}中，a₁=2，d=3，则a₅=？', options: ['11', '14', '17', '8'], answer: 'B', analysis: 'a₅=a₁+4d=2+12=14。', knowledgePoint: '等差数列通项', knowledgeTags: ['数列', '等差'], difficulty: 3, type: 'choice' },
  { id: 40021, grade: 'grade11', gradeName: '高二', semester: 'upper', chapter: '数列', title: '等比数列', question: '等比数列{aₙ}中，a₁=1，q=2，则S₄=？', options: ['8', '15', '16', '31'], answer: 'B', analysis: 'S₄=1×(2⁴-1)/(2-1)=15。', knowledgePoint: '等比数列求和', knowledgeTags: ['数列', '等比'], difficulty: 3, type: 'choice' },
  { id: 40022, grade: 'grade11', gradeName: '高二', semester: 'upper', chapter: '不等式', title: '均值不等式', question: 'a>0,b>0，a+b=4，则ab最大值是？', options: ['2', '4', '8', '16'], answer: 'B', analysis: 'ab≤(a+b)²/4=4。', knowledgePoint: '均值不等式', knowledgeTags: ['不等式', '最值'], difficulty: 3, type: 'choice' },
  { id: 40023, grade: 'grade11', gradeName: '高二', semester: 'lower', chapter: '导数', title: '导数计算', question: 'f(x)=x³的导数f\'(x)=？', options: ['x²', '2x²', '3x²', '3x'], answer: 'C', analysis: '(xⁿ)\'=nxⁿ⁻¹，(x³)\'=3x²。', knowledgePoint: '导数计算', knowledgeTags: ['导数'], difficulty: 3, type: 'choice' },
  { id: 40024, grade: 'grade11', gradeName: '高二', semester: 'lower', chapter: '导数', title: '导数应用', question: 'f(x)=x²-2x的极小值点是？', options: ['x=0', 'x=1', 'x=2', 'x=-1'], answer: 'B', analysis: 'f\'(x)=2x-2=0，x=1。', knowledgePoint: '导数求极值', knowledgeTags: ['导数', '极值'], difficulty: 3, type: 'choice' },
  // 高三
  { id: 40030, grade: 'grade12', gradeName: '高三', semester: 'upper', chapter: '立体几何', title: '空间向量', question: '向量a=(1,2,3)，b=(2,-1,0)，a·b=？', options: ['0', '1', '2', '3'], answer: 'A', analysis: 'a·b=1×2+2×(-1)+3×0=0。', knowledgePoint: '空间向量点积', knowledgeTags: ['向量', '点积'], difficulty: 3, type: 'choice' },
  { id: 40031, grade: 'grade12', gradeName: '高三', semester: 'upper', chapter: '解析几何', title: '椭圆', question: 'x²/4+y²/9=1的焦点在哪个轴上？', options: ['x轴', 'y轴', '不确定', '没有焦点'], answer: 'B', analysis: '分母大的对应轴，9>4，焦点在y轴。', knowledgePoint: '椭圆性质', knowledgeTags: ['解析几何', '椭圆'], difficulty: 3, type: 'choice' },
  { id: 40032, grade: 'grade12', gradeName: '高三', semester: 'upper', chapter: '概率统计', title: '排列组合', question: 'C(5,2)=？', options: ['5', '10', '20', '25'], answer: 'B', analysis: 'C(5,2)=5!/(2!3!)=10。', knowledgePoint: '组合数', knowledgeTags: ['排列组合'], difficulty: 3, type: 'choice' },
  { id: 40033, grade: 'grade12', gradeName: '高三', semester: 'lower', chapter: '综合复习', title: '函数综合', question: 'f(x)=lnx+2x-6的零点所在区间是？', options: ['(1,2)', '(2,3)', '(3,4)', '(0,1)'], answer: 'B', analysis: 'f(2)=ln2-2<0，f(3)=ln3>0，零点在(2,3)。', knowledgePoint: '零点存在定理', knowledgeTags: ['函数', '零点'], difficulty: 4, type: 'choice' },
];

// 合并所有数学题目
export const allMathQuestions: MathQuestion[] = [
  ...elementaryMathQuestions,
  ...middleSchoolMathQuestions,
  ...highSchoolMathQuestions,
];

// 导出按年级分类
export const mathQuestionsByGrade = {
  elementary: elementaryMathQuestions,
  middleSchool: middleSchoolMathQuestions,
  highSchool: highSchoolMathQuestions,
};

// 导出年级列表
export const mathGrades = [
  { id: 'grade1', name: '一年级', stage: 'elementary' },
  { id: 'grade2', name: '二年级', stage: 'elementary' },
  { id: 'grade3', name: '三年级', stage: 'elementary' },
  { id: 'grade4', name: '四年级', stage: 'elementary' },
  { id: 'grade5', name: '五年级', stage: 'elementary' },
  { id: 'grade6', name: '六年级', stage: 'elementary' },
  { id: 'grade7', name: '七年级', stage: 'middleSchool' },
  { id: 'grade8', name: '八年级', stage: 'middleSchool' },
  { id: 'grade9', name: '九年级', stage: 'middleSchool' },
  { id: 'grade10', name: '高一', stage: 'highSchool' },
  { id: 'grade11', name: '高二', stage: 'highSchool' },
  { id: 'grade12', name: '高三', stage: 'highSchool' },
];

// 导出知识点列表
export const mathKnowledgePoints = [
  // 小学
  '10以内加法', '10以内减法', '20以内退位减法', '数的组成', '数的顺序',
  '两位数加法', '两位数减法', '乘法口诀', '表内除法',
  '三位数加法', '三位数减法', '分数认识', '长方形面积',
  '大数读写', '乘法分配律', '小数意义', '三角形内角和',
  '小数乘法', '解方程', '平行四边形面积', '质数与合数',
  '百分数应用', '圆的面积', '圆的周长', '圆柱体积',
  // 初中
  '有理数加法', '有理数乘法', '绝对值', '合并同类项', '一元一次方程',
  '平行线性质', '算术平方根', '二元一次方程组', '一元一次不等式',
  '三角形三边关系', '全等三角形', '平方差公式', '勾股定理', '一次函数图像',
  '一元二次方程', '判别式', '二次函数顶点', '圆周角定理', '相似三角形面积比', '特殊角三角函数',
  // 高中
  '集合交集', '集合补集', '函数定义域', '函数单调性', '指数运算', '对数运算',
  '三角函数定义', '诱导公式',
  '等差数列通项', '等比数列求和', '均值不等式', '导数计算', '导数求极值',
  '空间向量点积', '椭圆性质', '组合数', '零点存在定理',
];
