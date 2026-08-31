// 英语词书数据库 - 全版本全年级全类型

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  meaning: string;
  example?: string;
  exampleCn?: string;
}

export interface VocabBook {
  id: string;
  name: string;
  edition: string;
  stage: string;
  grade: string;
  semester: string;
  type: string;
  wordCount: number;
  words: VocabWord[];
}

// 人教版小学英语词汇
const pepElementaryWords: Record<string, VocabWord[]> = {
  'grade3-upper': [
    { id: 'pep3u001', word: 'hello', phonetic: '/həˈloʊ/', pos: 'int.', meaning: '你好', example: 'Hello, how are you?', exampleCn: '你好，你好吗？' },
    { id: 'pep3u002', word: 'goodbye', phonetic: '/ɡʊdˈbaɪ/', pos: 'int.', meaning: '再见', example: 'Goodbye, see you tomorrow!', exampleCn: '再见，明天见！' },
    { id: 'pep3u003', word: 'book', phonetic: '/bʊk/', pos: 'n.', meaning: '书', example: 'I have a book.', exampleCn: '我有一本书。' },
    { id: 'pep3u004', word: 'pencil', phonetic: '/ˈpensl/', pos: 'n.', meaning: '铅笔', example: 'This is my pencil.', exampleCn: '这是我的铅笔。' },
    { id: 'pep3u005', word: 'ruler', phonetic: '/ˈruːlər/', pos: 'n.', meaning: '尺子', example: 'Can I use your ruler?', exampleCn: '我能用你的尺子吗？' },
    { id: 'pep3u006', word: 'eraser', phonetic: '/ɪˈreɪsər/', pos: 'n.', meaning: '橡皮', example: 'I need an eraser.', exampleCn: '我需要一块橡皮。' },
    { id: 'pep3u007', word: 'bag', phonetic: '/bæɡ/', pos: 'n.', meaning: '包', example: 'My bag is blue.', exampleCn: '我的包是蓝色的。' },
    { id: 'pep3u008', word: 'school', phonetic: '/skuːl/', pos: 'n.', meaning: '学校', example: 'I go to school every day.', exampleCn: '我每天去上学。' },
    { id: 'pep3u009', word: 'teacher', phonetic: '/ˈtiːtʃər/', pos: 'n.', meaning: '老师', example: 'She is my teacher.', exampleCn: '她是我的老师。' },
    { id: 'pep3u010', word: 'friend', phonetic: '/frend/', pos: 'n.', meaning: '朋友', example: 'He is my best friend.', exampleCn: '他是我最好的朋友。' },
    { id: 'pep3u011', word: 'red', phonetic: '/red/', pos: 'adj.', meaning: '红色的', example: 'The apple is red.', exampleCn: '苹果是红色的。' },
    { id: 'pep3u012', word: 'blue', phonetic: '/bluː/', pos: 'adj.', meaning: '蓝色的', example: 'The sky is blue.', exampleCn: '天空是蓝色的。' },
    { id: 'pep3u013', word: 'green', phonetic: '/ɡriːn/', pos: 'adj.', meaning: '绿色的', example: 'The grass is green.', exampleCn: '草是绿色的。' },
    { id: 'pep3u014', word: 'yellow', phonetic: '/ˈjeloʊ/', pos: 'adj.', meaning: '黄色的', example: 'The banana is yellow.', exampleCn: '香蕉是黄色的。' },
    { id: 'pep3u015', word: 'orange', phonetic: '/ˈɔːrɪndʒ/', pos: 'adj.', meaning: '橙色的', example: 'I like orange juice.', exampleCn: '我喜欢橙汁。' },
    { id: 'pep3u016', word: 'cat', phonetic: '/kæt/', pos: 'n.', meaning: '猫', example: 'The cat is cute.', exampleCn: '这只猫很可爱。' },
    { id: 'pep3u017', word: 'dog', phonetic: '/dɔːɡ/', pos: 'n.', meaning: '狗', example: 'I have a dog.', exampleCn: '我有一只狗。' },
    { id: 'pep3u018', word: 'bird', phonetic: '/bɜːrd/', pos: 'n.', meaning: '鸟', example: 'The bird can fly.', exampleCn: '鸟会飞。' },
    { id: 'pep3u019', word: 'fish', phonetic: '/fɪʃ/', pos: 'n.', meaning: '鱼', example: 'The fish is in the water.', exampleCn: '鱼在水里。' },
    { id: 'pep3u020', word: 'apple', phonetic: '/ˈæpl/', pos: 'n.', meaning: '苹果', example: 'I eat an apple every day.', exampleCn: '我每天吃一个苹果。' },
  ],
  'grade3-lower': [
    { id: 'pep3l001', word: 'boy', phonetic: '/bɔɪ/', pos: 'n.', meaning: '男孩' },
    { id: 'pep3l002', word: 'girl', phonetic: '/ɡɜːrl/', pos: 'n.', meaning: '女孩' },
    { id: 'pep3l003', word: 'man', phonetic: '/mæn/', pos: 'n.', meaning: '男人' },
    { id: 'pep3l004', word: 'woman', phonetic: '/ˈwʊmən/', pos: 'n.', meaning: '女人' },
    { id: 'pep3l005', word: 'father', phonetic: '/ˈfɑːðər/', pos: 'n.', meaning: '父亲' },
    { id: 'pep3l006', word: 'mother', phonetic: '/ˈmʌðər/', pos: 'n.', meaning: '母亲' },
    { id: 'pep3l007', word: 'brother', phonetic: '/ˈbrʌðər/', pos: 'n.', meaning: '兄弟' },
    { id: 'pep3l008', word: 'sister', phonetic: '/ˈsɪstər/', pos: 'n.', meaning: '姐妹' },
    { id: 'pep3l009', word: 'water', phonetic: '/ˈwɔːtər/', pos: 'n.', meaning: '水' },
    { id: 'pep3l010', word: 'milk', phonetic: '/mɪlk/', pos: 'n.', meaning: '牛奶' },
    { id: 'pep3l011', word: 'bread', phonetic: '/bred/', pos: 'n.', meaning: '面包' },
    { id: 'pep3l012', word: 'rice', phonetic: '/raɪs/', pos: 'n.', meaning: '米饭' },
    { id: 'pep3l013', word: 'egg', phonetic: '/eɡ/', pos: 'n.', meaning: '鸡蛋' },
    { id: 'pep3l014', word: 'cake', phonetic: '/keɪk/', pos: 'n.', meaning: '蛋糕' },
    { id: 'pep3l015', word: 'happy', phonetic: '/ˈhæpi/', pos: 'adj.', meaning: '快乐的' },
  ],
  'grade4-upper': [
    { id: 'pep4u001', word: 'classroom', phonetic: '/ˈklæsruːm/', pos: 'n.', meaning: '教室' },
    { id: 'pep4u002', word: 'window', phonetic: '/ˈwɪndoʊ/', pos: 'n.', meaning: '窗户' },
    { id: 'pep4u003', word: 'door', phonetic: '/dɔːr/', pos: 'n.', meaning: '门' },
    { id: 'pep4u004', word: 'desk', phonetic: '/desk/', pos: 'n.', meaning: '课桌' },
    { id: 'pep4u005', word: 'chair', phonetic: '/tʃer/', pos: 'n.', meaning: '椅子' },
    { id: 'pep4u006', word: 'computer', phonetic: '/kəmˈpjuːtər/', pos: 'n.', meaning: '电脑' },
    { id: 'pep4u007', word: 'phone', phonetic: '/foʊn/', pos: 'n.', meaning: '电话' },
    { id: 'pep4u008', word: 'table', phonetic: '/ˈteɪbl/', pos: 'n.', meaning: '桌子' },
    { id: 'pep4u009', word: 'bed', phonetic: '/bed/', pos: 'n.', meaning: '床' },
    { id: 'pep4u010', word: 'light', phonetic: '/laɪt/', pos: 'n.', meaning: '灯' },
    { id: 'pep4u011', word: 'breakfast', phonetic: '/ˈbrekfəst/', pos: 'n.', meaning: '早餐' },
    { id: 'pep4u012', word: 'lunch', phonetic: '/lʌntʃ/', pos: 'n.', meaning: '午餐' },
    { id: 'pep4u013', word: 'dinner', phonetic: '/ˈdɪnər/', pos: 'n.', meaning: '晚餐' },
    { id: 'pep4u014', word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', pos: 'n.', meaning: '早晨' },
    { id: 'pep4u015', word: 'afternoon', phonetic: '/ˌæftərˈnuːn/', pos: 'n.', meaning: '下午' },
  ],
  'grade4-lower': [
    { id: 'pep4l001', word: 'playground', phonetic: '/ˈpleɪɡraʊnd/', pos: 'n.', meaning: '操场' },
    { id: 'pep4l002', word: 'library', phonetic: '/ˈlaɪbreri/', pos: 'n.', meaning: '图书馆' },
    { id: 'pep4l003', word: 'garden', phonetic: '/ˈɡɑːrdn/', pos: 'n.', meaning: '花园' },
    { id: 'pep4l004', word: 'flower', phonetic: '/ˈflaʊər/', pos: 'n.', meaning: '花' },
    { id: 'pep4l005', word: 'tree', phonetic: '/triː/', pos: 'n.', meaning: '树' },
    { id: 'pep4l006', word: 'spring', phonetic: '/sprɪŋ/', pos: 'n.', meaning: '春天' },
    { id: 'pep4l007', word: 'summer', phonetic: '/ˈsʌmər/', pos: 'n.', meaning: '夏天' },
    { id: 'pep4l008', word: 'autumn', phonetic: '/ˈɔːtəm/', pos: 'n.', meaning: '秋天' },
    { id: 'pep4l009', word: 'winter', phonetic: '/ˈwɪntər/', pos: 'n.', meaning: '冬天' },
    { id: 'pep4l010', word: 'weather', phonetic: '/ˈweðər/', pos: 'n.', meaning: '天气' },
    { id: 'pep4l011', word: 'sunny', phonetic: '/ˈsʌni/', pos: 'adj.', meaning: '晴朗的' },
    { id: 'pep4l012', word: 'rainy', phonetic: '/ˈreɪni/', pos: 'adj.', meaning: '下雨的' },
    { id: 'pep4l013', word: 'cloudy', phonetic: '/ˈklaʊdi/', pos: 'adj.', meaning: '多云的' },
    { id: 'pep4l014', word: 'windy', phonetic: '/ˈwɪndi/', pos: 'adj.', meaning: '有风的' },
    { id: 'pep4l015', word: 'snowy', phonetic: '/ˈsnoʊi/', pos: 'adj.', meaning: '下雪的' },
  ],
  'grade5-upper': [
    { id: 'pep5u001', word: 'kind', phonetic: '/kaɪnd/', pos: 'adj.', meaning: '亲切的' },
    { id: 'pep5u002', word: 'strict', phonetic: '/strɪkt/', pos: 'adj.', meaning: '严格的' },
    { id: 'pep5u003', word: 'clever', phonetic: '/ˈklevər/', pos: 'adj.', meaning: '聪明的' },
    { id: 'pep5u004', word: 'helpful', phonetic: '/ˈhelpfl/', pos: 'adj.', meaning: '有帮助的' },
    { id: 'pep5u005', word: 'polite', phonetic: '/pəˈlaɪt/', pos: 'adj.', meaning: '有礼貌的' },
    { id: 'pep5u006', word: 'Monday', phonetic: '/ˈmʌndeɪ/', pos: 'n.', meaning: '星期一' },
    { id: 'pep5u007', word: 'Tuesday', phonetic: '/ˈtuːzdeɪ/', pos: 'n.', meaning: '星期二' },
    { id: 'pep5u008', word: 'Wednesday', phonetic: '/ˈwenzdeɪ/', pos: 'n.', meaning: '星期三' },
    { id: 'pep5u009', word: 'Thursday', phonetic: '/ˈθɜːrzdeɪ/', pos: 'n.', meaning: '星期四' },
    { id: 'pep5u010', word: 'Friday', phonetic: '/ˈfraɪdeɪ/', pos: 'n.', meaning: '星期五' },
    { id: 'pep5u011', word: 'Saturday', phonetic: '/ˈsætərdeɪ/', pos: 'n.', meaning: '星期六' },
    { id: 'pep5u012', word: 'Sunday', phonetic: '/ˈsʌndeɪ/', pos: 'n.', meaning: '星期日' },
    { id: 'pep5u013', word: 'sandwich', phonetic: '/ˈsænwɪtʃ/', pos: 'n.', meaning: '三明治' },
    { id: 'pep5u014', word: 'salad', phonetic: '/ˈsæləd/', pos: 'n.', meaning: '沙拉' },
    { id: 'pep5u015', word: 'delicious', phonetic: '/dɪˈlɪʃəs/', pos: 'adj.', meaning: '美味的' },
  ],
  'grade5-lower': [
    { id: 'pep5l001', word: 'eat', phonetic: '/iːt/', pos: 'v.', meaning: '吃' },
    { id: 'pep5l002', word: 'drink', phonetic: '/drɪŋk/', pos: 'v.', meaning: '喝' },
    { id: 'pep5l003', word: 'sleep', phonetic: '/sliːp/', pos: 'v.', meaning: '睡觉' },
    { id: 'pep5l004', word: 'walk', phonetic: '/wɔːk/', pos: 'v.', meaning: '走路' },
    { id: 'pep5l005', word: 'run', phonetic: '/rʌn/', pos: 'v.', meaning: '跑' },
    { id: 'pep5l006', word: 'jump', phonetic: '/dʒʌmp/', pos: 'v.', meaning: '跳' },
    { id: 'pep5l007', word: 'swim', phonetic: '/swɪm/', pos: 'v.', meaning: '游泳' },
    { id: 'pep5l008', word: 'read', phonetic: '/riːd/', pos: 'v.', meaning: '读' },
    { id: 'pep5l009', word: 'write', phonetic: '/raɪt/', pos: 'v.', meaning: '写' },
    { id: 'pep5l010', word: 'sing', phonetic: '/sɪŋ/', pos: 'v.', meaning: '唱歌' },
    { id: 'pep5l011', word: 'dance', phonetic: '/dæns/', pos: 'v.', meaning: '跳舞' },
    { id: 'pep5l012', word: 'draw', phonetic: '/drɔː/', pos: 'v.', meaning: '画画' },
    { id: 'pep5l013', word: 'paint', phonetic: '/peɪnt/', pos: 'v.', meaning: '涂色' },
    { id: 'pep5l014', word: 'cook', phonetic: '/kʊk/', pos: 'v.', meaning: '烹饪' },
    { id: 'pep5l015', word: 'clean', phonetic: '/kliːn/', pos: 'v.', meaning: '打扫' },
  ],
  'grade6-upper': [
    { id: 'pep6u001', word: 'science', phonetic: '/ˈsaɪəns/', pos: 'n.', meaning: '科学' },
    { id: 'pep6u002', word: 'museum', phonetic: '/mjuːˈziːəm/', pos: 'n.', meaning: '博物馆' },
    { id: 'pep6u003', word: 'hospital', phonetic: '/ˈhɑːspɪtl/', pos: 'n.', meaning: '医院' },
    { id: 'pep6u004', word: 'cinema', phonetic: '/ˈsɪnəmə/', pos: 'n.', meaning: '电影院' },
    { id: 'pep6u005', word: 'bookstore', phonetic: '/ˈbʊkstɔːr/', pos: 'n.', meaning: '书店' },
    { id: 'pep6u006', word: 'supermarket', phonetic: '/ˈsuːpərmɑːrkɪt/', pos: 'n.', meaning: '超市' },
    { id: 'pep6u007', word: 'left', phonetic: '/left/', pos: 'n.', meaning: '左边' },
    { id: 'pep6u008', word: 'right', phonetic: '/raɪt/', pos: 'n.', meaning: '右边' },
    { id: 'pep6u009', word: 'straight', phonetic: '/streɪt/', pos: 'adv.', meaning: '笔直地' },
    { id: 'pep6u010', word: 'crossing', phonetic: '/ˈkrɔːsɪŋ/', pos: 'n.', meaning: '十字路口' },
    { id: 'pep6u011', word: 'tonight', phonetic: '/təˈnaɪt/', pos: 'adv.', meaning: '今晚' },
    { id: 'pep6u012', word: 'tomorrow', phonetic: '/təˈmɑːroʊ/', pos: 'adv.', meaning: '明天' },
    { id: 'pep6u013', word: 'yesterday', phonetic: '/ˈjestərdeɪ/', pos: 'adv.', meaning: '昨天' },
    { id: 'pep6u014', word: 'trip', phonetic: '/trɪp/', pos: 'n.', meaning: '旅行' },
    { id: 'pep6u015', word: 'travel', phonetic: '/ˈtrævl/', pos: 'v.', meaning: '旅行' },
  ],
  'grade6-lower': [
    { id: 'pep6l001', word: 'younger', phonetic: '/ˈjʌŋɡər/', pos: 'adj.', meaning: '更年轻的' },
    { id: 'pep6l002', word: 'older', phonetic: '/ˈoʊldər/', pos: 'adj.', meaning: '更年长的' },
    { id: 'pep6l003', word: 'taller', phonetic: '/ˈtɔːlər/', pos: 'adj.', meaning: '更高的' },
    { id: 'pep6l004', word: 'shorter', phonetic: '/ˈʃɔːrtər/', pos: 'adj.', meaning: '更矮的' },
    { id: 'pep6l005', word: 'longer', phonetic: '/ˈlɔːŋɡər/', pos: 'adj.', meaning: '更长的' },
    { id: 'pep6l006', word: 'thinner', phonetic: '/ˈθɪnər/', pos: 'adj.', meaning: '更瘦的' },
    { id: 'pep6l007', word: 'heavier', phonetic: '/ˈheviər/', pos: 'adj.', meaning: '更重的' },
    { id: 'pep6l008', word: 'bigger', phonetic: '/ˈbɪɡər/', pos: 'adj.', meaning: '更大的' },
    { id: 'pep6l009', word: 'smaller', phonetic: '/ˈsmɔːlər/', pos: 'adj.', meaning: '更小的' },
    { id: 'pep6l010', word: 'stronger', phonetic: '/ˈstrɔːŋɡər/', pos: 'adj.', meaning: '更强壮的' },
    { id: 'pep6l011', word: 'dinosaur', phonetic: '/ˈdaɪnəsɔːr/', pos: 'n.', meaning: '恐龙' },
    { id: 'pep6l012', word: 'meter', phonetic: '/ˈmiːtər/', pos: 'n.', meaning: '米' },
    { id: 'pep6l013', word: 'kilogram', phonetic: '/ˈkɪləɡræm/', pos: 'n.', meaning: '千克' },
    { id: 'pep6l014', word: 'countryside', phonetic: '/ˈkʌntrisaɪd/', pos: 'n.', meaning: '乡村' },
    { id: 'pep6l015', word: 'nothing', phonetic: '/ˈnʌθɪŋ/', pos: 'pron.', meaning: '没有什么' },
  ],
};

// 人教版初中英语词汇
const pepMiddleWords: Record<string, VocabWord[]> = {
  'grade7-upper': [
    { id: 'pep7u001', word: 'good', phonetic: '/ɡʊd/', pos: 'adj.', meaning: '好的' },
    { id: 'pep7u002', word: 'name', phonetic: '/neɪm/', pos: 'n.', meaning: '名字' },
    { id: 'pep7u003', word: 'nice', phonetic: '/naɪs/', pos: 'adj.', meaning: '令人愉快的' },
    { id: 'pep7u004', word: 'meet', phonetic: '/miːt/', pos: 'v.', meaning: '遇见' },
    { id: 'pep7u005', word: 'friend', phonetic: '/frend/', pos: 'n.', meaning: '朋友' },
    { id: 'pep7u006', word: 'family', phonetic: '/ˈfæmɪli/', pos: 'n.', meaning: '家庭' },
    { id: 'pep7u007', word: 'parent', phonetic: '/ˈperənt/', pos: 'n.', meaning: '父(母)亲' },
    { id: 'pep7u008', word: 'number', phonetic: '/ˈnʌmbər/', pos: 'n.', meaning: '数字' },
    { id: 'pep7u009', word: 'color', phonetic: '/ˈkʌlər/', pos: 'n.', meaning: '颜色' },
    { id: 'pep7u010', word: 'black', phonetic: '/blæk/', pos: 'adj.', meaning: '黑色的' },
    { id: 'pep7u011', word: 'white', phonetic: '/waɪt/', pos: 'adj.', meaning: '白色的' },
    { id: 'pep7u012', word: 'brown', phonetic: '/braʊn/', pos: 'adj.', meaning: '棕色的' },
    { id: 'pep7u013', word: 'purple', phonetic: '/ˈpɜːrpl/', pos: 'adj.', meaning: '紫色的' },
    { id: 'pep7u014', word: 'picture', phonetic: '/ˈpɪktʃər/', pos: 'n.', meaning: '图片' },
    { id: 'pep7u015', word: 'thing', phonetic: '/θɪŋ/', pos: 'n.', meaning: '东西' },
  ],
  'grade7-lower': [
    { id: 'pep7l001', word: 'guitar', phonetic: '/ɡɪˈtɑːr/', pos: 'n.', meaning: '吉他' },
    { id: 'pep7l002', word: 'chess', phonetic: '/tʃes/', pos: 'n.', meaning: '国际象棋' },
    { id: 'pep7l003', word: 'speak', phonetic: '/spiːk/', pos: 'v.', meaning: '说' },
    { id: 'pep7l004', word: 'join', phonetic: '/dʒɔɪn/', pos: 'v.', meaning: '参加' },
    { id: 'pep7l005', word: 'club', phonetic: '/klʌb/', pos: 'n.', meaning: '俱乐部' },
    { id: 'pep7l006', word: 'tell', phonetic: '/tel/', pos: 'v.', meaning: '告诉' },
    { id: 'pep7l007', word: 'story', phonetic: '/ˈstɔːri/', pos: 'n.', meaning: '故事' },
    { id: 'pep7l008', word: 'show', phonetic: '/ʃoʊ/', pos: 'n.', meaning: '演出' },
    { id: 'pep7l009', word: 'drum', phonetic: '/drʌm/', pos: 'n.', meaning: '鼓' },
    { id: 'pep7l010', word: 'piano', phonetic: '/piˈænoʊ/', pos: 'n.', meaning: '钢琴' },
    { id: 'pep7l011', word: 'violin', phonetic: '/ˌvaɪəˈlɪn/', pos: 'n.', meaning: '小提琴' },
    { id: 'pep7l012', word: 'musician', phonetic: '/mjuˈzɪʃn/', pos: 'n.', meaning: '音乐家' },
    { id: 'pep7l013', word: 'weekend', phonetic: '/ˈwiːkend/', pos: 'n.', meaning: '周末' },
    { id: 'pep7l014', word: 'lesson', phonetic: '/ˈlesn/', pos: 'n.', meaning: '课' },
    { id: 'pep7l015', word: 'homework', phonetic: '/ˈhoʊmwɜːrk/', pos: 'n.', meaning: '家庭作业' },
  ],
  'grade8-upper': [
    { id: 'pep8u001', word: 'anyone', phonetic: '/ˈeniwʌn/', pos: 'pron.', meaning: '任何人' },
    { id: 'pep8u002', word: 'wonderful', phonetic: '/ˈwʌndərfl/', pos: 'adj.', meaning: '精彩的' },
    { id: 'pep8u003', word: 'quite', phonetic: '/kwaɪt/', pos: 'adv.', meaning: '相当' },
    { id: 'pep8u004', word: 'most', phonetic: '/moʊst/', pos: 'adv.', meaning: '大多数' },
    { id: 'pep8u005', word: 'something', phonetic: '/ˈsʌmθɪŋ/', pos: 'pron.', meaning: '某事' },
    { id: 'pep8u006', word: 'everyone', phonetic: '/ˈevriwʌn/', pos: 'pron.', meaning: '每个人' },
    { id: 'pep8u007', word: 'bored', phonetic: '/bɔːrd/', pos: 'adj.', meaning: '无聊的' },
    { id: 'pep8u008', word: 'diary', phonetic: '/ˈdaɪəri/', pos: 'n.', meaning: '日记' },
    { id: 'pep8u009', word: 'activity', phonetic: '/ækˈtɪvəti/', pos: 'n.', meaning: '活动' },
    { id: 'pep8u010', word: 'decide', phonetic: '/dɪˈsaɪd/', pos: 'v.', meaning: '决定' },
    { id: 'pep8u011', word: 'try', phonetic: '/traɪ/', pos: 'v.', meaning: '尝试' },
    { id: 'pep8u012', word: 'enjoy', phonetic: '/ɪnˈdʒɔɪ/', pos: 'v.', meaning: '享受' },
    { id: 'pep8u013', word: 'remember', phonetic: '/rɪˈmembər/', pos: 'v.', meaning: '记得' },
    { id: 'pep8u014', word: 'forget', phonetic: '/fərˈɡet/', pos: 'v.', meaning: '忘记' },
    { id: 'pep8u015', word: 'experience', phonetic: '/ɪkˈspɪriəns/', pos: 'n.', meaning: '经历' },
  ],
  'grade8-lower': [
    { id: 'pep8l001', word: 'matter', phonetic: '/ˈmætər/', pos: 'n.', meaning: '问题' },
    { id: 'pep8l002', word: 'sore', phonetic: '/sɔːr/', pos: 'adj.', meaning: '酸痛的' },
    { id: 'pep8l003', word: 'stomach', phonetic: '/ˈstʌmək/', pos: 'n.', meaning: '胃' },
    { id: 'pep8l004', word: 'fever', phonetic: '/ˈfiːvər/', pos: 'n.', meaning: '发烧' },
    { id: 'pep8l005', word: 'rest', phonetic: '/rest/', pos: 'n.', meaning: '休息' },
    { id: 'pep8l006', word: 'cough', phonetic: '/kɔːf/', pos: 'n.', meaning: '咳嗽' },
    { id: 'pep8l007', word: 'toothache', phonetic: '/ˈtuːθeɪk/', pos: 'n.', meaning: '牙痛' },
    { id: 'pep8l008', word: 'headache', phonetic: '/ˈhedeɪk/', pos: 'n.', meaning: '头痛' },
    { id: 'pep8l009', word: 'temperature', phonetic: '/ˈtemprətʃər/', pos: 'n.', meaning: '温度' },
    { id: 'pep8l010', word: 'break', phonetic: '/breɪk/', pos: 'n.', meaning: '休息' },
    { id: 'pep8l011', word: 'hurt', phonetic: '/hɜːrt/', pos: 'v.', meaning: '受伤' },
    { id: 'pep8l012', word: 'passenger', phonetic: '/ˈpæsɪndʒər/', pos: 'n.', meaning: '乘客' },
    { id: 'pep8l013', word: 'trouble', phonetic: '/ˈtrʌbl/', pos: 'n.', meaning: '麻烦' },
    { id: 'pep8l014', word: 'medicine', phonetic: '/ˈmedɪsn/', pos: 'n.', meaning: '药' },
    { id: 'pep8l015', word: 'attention', phonetic: '/əˈtenʃn/', pos: 'n.', meaning: '注意力' },
  ],
  'grade9-upper': [
    { id: 'pep9u001', word: 'textbook', phonetic: '/ˈtekstbʊk/', pos: 'n.', meaning: '教科书' },
    { id: 'pep9u002', word: 'conversation', phonetic: '/ˌkɑːnvərˈseɪʃn/', pos: 'n.', meaning: '交谈' },
    { id: 'pep9u003', word: 'aloud', phonetic: '/əˈlaʊd/', pos: 'adv.', meaning: '大声地' },
    { id: 'pep9u004', word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', pos: 'n.', meaning: '发音' },
    { id: 'pep9u005', word: 'sentence', phonetic: '/ˈsentəns/', pos: 'n.', meaning: '句子' },
    { id: 'pep9u006', word: 'patient', phonetic: '/ˈpeɪʃnt/', pos: 'adj.', meaning: '有耐心的' },
    { id: 'pep9u007', word: 'expression', phonetic: '/ɪkˈspreʃn/', pos: 'n.', meaning: '表达' },
    { id: 'pep9u008', word: 'discover', phonetic: '/dɪˈskʌvər/', pos: 'v.', meaning: '发现' },
    { id: 'pep9u009', word: 'secret', phonetic: '/ˈsiːkrɪt/', pos: 'n.', meaning: '秘密' },
    { id: 'pep9u010', word: 'grammar', phonetic: '/ˈɡræmər/', pos: 'n.', meaning: '语法' },
    { id: 'pep9u011', word: 'pattern', phonetic: '/ˈpætərn/', pos: 'n.', meaning: '模式' },
    { id: 'pep9u012', word: 'increase', phonetic: '/ɪnˈkriːs/', pos: 'v.', meaning: '增加' },
    { id: 'pep9u013', word: 'speed', phonetic: '/spiːd/', pos: 'n.', meaning: '速度' },
    { id: 'pep9u014', word: 'ability', phonetic: '/əˈbɪləti/', pos: 'n.', meaning: '能力' },
    { id: 'pep9u015', word: 'brain', phonetic: '/breɪn/', pos: 'n.', meaning: '大脑' },
  ],
  'grade9-lower': [
    { id: 'pep9l001', word: 'rule', phonetic: '/ruːl/', pos: 'n.', meaning: '规则' },
    { id: 'pep9l002', word: 'hallway', phonetic: '/ˈhɔːlweɪ/', pos: 'n.', meaning: '走廊' },
    { id: 'pep9l003', word: 'listen', phonetic: '/ˈlɪsn/', pos: 'v.', meaning: '听' },
    { id: 'pep9l004', word: 'fight', phonetic: '/faɪt/', pos: 'v.', meaning: '打架' },
    { id: 'pep9l005', word: 'outside', phonetic: '/ˌaʊtˈsaɪd/', pos: 'adv.', meaning: '在外面' },
    { id: 'pep9l006', word: 'wear', phonetic: '/wer/', pos: 'v.', meaning: '穿戴' },
    { id: 'pep9l007', word: 'important', phonetic: '/ɪmˈpɔːrtnt/', pos: 'adj.', meaning: '重要的' },
    { id: 'pep9l008', word: 'bring', phonetic: '/brɪŋ/', pos: 'v.', meaning: '带来' },
    { id: 'pep9l009', word: 'uniform', phonetic: '/ˈjuːnɪfɔːrm/', pos: 'n.', meaning: '制服' },
    { id: 'pep9l010', word: 'quiet', phonetic: '/ˈkwaɪət/', pos: 'adj.', meaning: '安静的' },
    { id: 'pep9l011', word: 'practice', phonetic: '/ˈpræktɪs/', pos: 'n.', meaning: '练习' },
    { id: 'pep9l012', word: 'choose', phonetic: '/tʃuːz/', pos: 'v.', meaning: '选择' },
    { id: 'pep9l013', word: 'experience', phonetic: '/ɪkˈspɪriəns/', pos: 'n.', meaning: '经验' },
    { id: 'pep9l014', word: 'succeed', phonetic: '/səkˈsiːd/', pos: 'v.', meaning: '成功' },
    { id: 'pep9l015', word: 'society', phonetic: '/səˈsaɪəti/', pos: 'n.', meaning: '社会' },
  ],
};

// 人教版高中英语词汇
const pepHighWords: Record<string, VocabWord[]> = {
  'grade10-upper': [
    { id: 'pep10u001', word: 'senior', phonetic: '/ˈsiːniər/', pos: 'adj.', meaning: '高级的' },
    { id: 'pep10u002', word: 'exchange', phonetic: '/ɪksˈtʃeɪndʒ/', pos: 'n.', meaning: '交换' },
    { id: 'pep10u003', word: 'design', phonetic: '/dɪˈzaɪn/', pos: 'n.', meaning: '设计' },
    { id: 'pep10u004', word: 'formal', phonetic: '/ˈfɔːrml/', pos: 'adj.', meaning: '正式的' },
    { id: 'pep10u005', word: 'opportunity', phonetic: '/ˌɑːpərˈtuːnəti/', pos: 'n.', meaning: '机会' },
    { id: 'pep10u006', word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', pos: 'n.', meaning: '挑战' },
    { id: 'pep10u007', word: 'confident', phonetic: '/ˈkɑːnfɪdənt/', pos: 'adj.', meaning: '自信的' },
    { id: 'pep10u008', word: 'curious', phonetic: '/ˈkjʊriəs/', pos: 'adj.', meaning: '好奇的' },
    { id: 'pep10u009', word: 'impress', phonetic: '/ɪmˈpres/', pos: 'v.', meaning: '使印象深刻' },
    { id: 'pep10u010', word: 'strategy', phonetic: '/ˈstrætədʒi/', pos: 'n.', meaning: '策略' },
    { id: 'pep10u011', word: 'partner', phonetic: '/ˈpɑːrtnər/', pos: 'n.', meaning: '搭档' },
    { id: 'pep10u012', word: 'improve', phonetic: '/ɪmˈpruːv/', pos: 'v.', meaning: '提高' },
    { id: 'pep10u013', word: 'pressure', phonetic: '/ˈpreʃər/', pos: 'n.', meaning: '压力' },
    { id: 'pep10u014', word: 'goal', phonetic: '/ɡoʊl/', pos: 'n.', meaning: '目标' },
    { id: 'pep10u015', word: 'community', phonetic: '/kəˈmjuːnəti/', pos: 'n.', meaning: '社区' },
  ],
  'grade10-lower': [
    { id: 'pep10l001', word: 'festival', phonetic: '/ˈfestɪvl/', pos: 'n.', meaning: '节日' },
    { id: 'pep10l002', word: 'tradition', phonetic: '/trəˈdɪʃn/', pos: 'n.', meaning: '传统' },
    { id: 'pep10l003', word: 'custom', phonetic: '/ˈkʌstəm/', pos: 'n.', meaning: '风俗' },
    { id: 'pep10l004', word: 'celebrate', phonetic: '/ˈselɪbreɪt/', pos: 'v.', meaning: '庆祝' },
    { id: 'pep10l005', word: 'respect', phonetic: '/rɪˈspekt/', pos: 'n.', meaning: '尊敬' },
    { id: 'pep10l006', word: 'harvest', phonetic: '/ˈhɑːrvɪst/', pos: 'n.', meaning: '收获' },
    { id: 'pep10l007', word: 'grateful', phonetic: '/ˈɡreɪtfl/', pos: 'adj.', meaning: '感激的' },
    { id: 'pep10l008', word: 'ancestor', phonetic: '/ˈænsestər/', pos: 'n.', meaning: '祖先' },
    { id: 'pep10l009', word: 'faith', phonetic: '/feɪθ/', pos: 'n.', meaning: '信仰' },
    { id: 'pep10l010', word: 'brief', phonetic: '/briːf/', pos: 'adj.', meaning: '简短的' },
    { id: 'pep10l011', word: 'origin', phonetic: '/ˈɔːrɪdʒɪn/', pos: 'n.', meaning: '起源' },
    { id: 'pep10l012', word: 'reflect', phonetic: '/rɪˈflekt/', pos: 'v.', meaning: '反映' },
    { id: 'pep10l013', word: 'belief', phonetic: '/bɪˈliːf/', pos: 'n.', meaning: '信念' },
    { id: 'pep10l014', word: 'occasion', phonetic: '/əˈkeɪʒn/', pos: 'n.', meaning: '场合' },
    { id: 'pep10l015', word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', pos: 'n.', meaning: '环境' },
  ],
  'grade11-upper': [
    { id: 'pep11u001', word: 'attribute', phonetic: '/əˈtrɪbjuːt/', pos: 'v.', meaning: '归因于' },
    { id: 'pep11u002', word: 'determine', phonetic: '/dɪˈtɜːrmɪn/', pos: 'v.', meaning: '决定' },
    { id: 'pep11u003', word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', pos: 'adj.', meaning: '重要的' },
    { id: 'pep11u004', word: 'achieve', phonetic: '/əˈtʃiːv/', pos: 'v.', meaning: '实现' },
    { id: 'pep11u005', word: 'contribute', phonetic: '/kənˈtrɪbjuːt/', pos: 'v.', meaning: '贡献' },
    { id: 'pep11u006', word: 'establish', phonetic: '/ɪˈstæblɪʃ/', pos: 'v.', meaning: '建立' },
    { id: 'pep11u007', word: 'analyze', phonetic: '/ˈænəlaɪz/', pos: 'v.', meaning: '分析' },
    { id: 'pep11u008', word: 'evaluate', phonetic: '/ɪˈvæljueɪt/', pos: 'v.', meaning: '评估' },
    { id: 'pep11u009', word: 'evidence', phonetic: '/ˈevɪdəns/', pos: 'n.', meaning: '证据' },
    { id: 'pep11u010', word: 'research', phonetic: '/rɪˈsɜːrtʃ/', pos: 'n.', meaning: '研究' },
    { id: 'pep11u011', word: 'theory', phonetic: '/ˈθiːəri/', pos: 'n.', meaning: '理论' },
    { id: 'pep11u012', word: 'method', phonetic: '/ˈmeθəd/', pos: 'n.', meaning: '方法' },
    { id: 'pep11u013', word: 'process', phonetic: '/ˈprɑːses/', pos: 'n.', meaning: '过程' },
    { id: 'pep11u014', word: 'conclusion', phonetic: '/kənˈkluːʒn/', pos: 'n.', meaning: '结论' },
    { id: 'pep11u015', word: 'persuade', phonetic: '/pərˈsweɪd/', pos: 'v.', meaning: '说服' },
  ],
  'grade11-lower': [
    { id: 'pep11l001', word: 'phenomenon', phonetic: '/fəˈnɑːmɪnən/', pos: 'n.', meaning: '现象' },
    { id: 'pep11l002', word: 'consequence', phonetic: '/ˈkɑːnsɪkwens/', pos: 'n.', meaning: '后果' },
    { id: 'pep11l003', word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', pos: 'n.', meaning: '环境' },
    { id: 'pep11l004', word: 'sustainable', phonetic: '/səˈsteɪnəbl/', pos: 'adj.', meaning: '可持续的' },
    { id: 'pep11l005', word: 'resource', phonetic: '/ˈriːsɔːrs/', pos: 'n.', meaning: '资源' },
    { id: 'pep11l006', word: 'pollution', phonetic: '/pəˈluːʃn/', pos: 'n.', meaning: '污染' },
    { id: 'pep11l007', word: 'climate', phonetic: '/ˈklaɪmət/', pos: 'n.', meaning: '气候' },
    { id: 'pep11l008', word: 'temperature', phonetic: '/ˈtemprətʃər/', pos: 'n.', meaning: '温度' },
    { id: 'pep11l009', word: 'ecosystem', phonetic: '/ˈiːkoʊsɪstəm/', pos: 'n.', meaning: '生态系统' },
    { id: 'pep11l010', word: 'biodiversity', phonetic: '/ˌbaɪoʊdaɪˈvɜːrsəti/', pos: 'n.', meaning: '生物多样性' },
    { id: 'pep11l011', word: 'conservation', phonetic: '/ˌkɑːnsərˈveɪʃn/', pos: 'n.', meaning: '保护' },
    { id: 'pep11l012', word: 'renewable', phonetic: '/rɪˈnuːəbl/', pos: 'adj.', meaning: '可再生的' },
    { id: 'pep11l013', word: 'recycle', phonetic: '/ˌriːˈsaɪkl/', pos: 'v.', meaning: '回收' },
    { id: 'pep11l014', word: 'carbon', phonetic: '/ˈkɑːrbən/', pos: 'n.', meaning: '碳' },
    { id: 'pep11l015', word: 'emission', phonetic: '/ɪˈmɪʃn/', pos: 'n.', meaning: '排放' },
  ],
  'grade12-upper': [
    { id: 'pep12u001', word: 'abstract', phonetic: '/ˈæbstrækt/', pos: 'adj.', meaning: '抽象的' },
    { id: 'pep12u002', word: 'realistic', phonetic: '/ˌriːəˈlɪstɪk/', pos: 'adj.', meaning: '现实的' },
    { id: 'pep12u003', word: 'sculpture', phonetic: '/ˈskʌlptʃər/', pos: 'n.', meaning: '雕塑' },
    { id: 'pep12u004', word: 'gallery', phonetic: '/ˈɡæləri/', pos: 'n.', meaning: '画廊' },
    { id: 'pep12u005', word: 'exhibition', phonetic: '/ˌeksɪˈbɪʃn/', pos: 'n.', meaning: '展览' },
    { id: 'pep12u006', word: 'architecture', phonetic: '/ˈɑːrkɪtektʃər/', pos: 'n.', meaning: '建筑' },
    { id: 'pep12u007', word: 'contemporary', phonetic: '/kənˈtempəreri/', pos: 'adj.', meaning: '当代的' },
    { id: 'pep12u008', word: 'civilization', phonetic: '/ˌsɪvələˈzeɪʃn/', pos: 'n.', meaning: '文明' },
    { id: 'pep12u009', word: 'distinguished', phonetic: '/dɪˈstɪŋɡwɪʃt/', pos: 'adj.', meaning: '杰出的' },
    { id: 'pep12u010', word: 'influence', phonetic: '/ˈɪnfluəns/', pos: 'n.', meaning: '影响' },
    { id: 'pep12u011', word: 'masterpiece', phonetic: '/ˈmæstərpiːs/', pos: 'n.', meaning: '杰作' },
    { id: 'pep12u012', word: 'inspiration', phonetic: '/ˌɪnspəˈreɪʃn/', pos: 'n.', meaning: '灵感' },
    { id: 'pep12u013', word: 'creativity', phonetic: '/ˌkriːeɪˈtɪvəti/', pos: 'n.', meaning: '创造力' },
    { id: 'pep12u014', word: 'aesthetic', phonetic: '/esˈθetɪk/', pos: 'adj.', meaning: '美学的' },
    { id: 'pep12u015', word: 'heritage', phonetic: '/ˈherɪtɪdʒ/', pos: 'n.', meaning: '遗产' },
  ],
  'grade12-lower': [
    { id: 'pep12l001', word: 'comprehensive', phonetic: '/ˌkɑːmprɪˈhensɪv/', pos: 'adj.', meaning: '综合的' },
    { id: 'pep12l002', word: 'sophisticated', phonetic: '/səˈfɪstɪkeɪtɪd/', pos: 'adj.', meaning: '复杂的' },
    { id: 'pep12l003', word: 'controversial', phonetic: '/ˌkɑːntrəˈvɜːrʃl/', pos: 'adj.', meaning: '有争议的' },
    { id: 'pep12l004', word: 'perspective', phonetic: '/pərˈspektɪv/', pos: 'n.', meaning: '观点' },
    { id: 'pep12l005', word: 'prejudice', phonetic: '/ˈpredʒudɪs/', pos: 'n.', meaning: '偏见' },
    { id: 'pep12l006', word: 'discrimination', phonetic: '/dɪˌskrɪmɪˈneɪʃn/', pos: 'n.', meaning: '歧视' },
    { id: 'pep12l007', word: 'equality', phonetic: '/iˈkwɑːləti/', pos: 'n.', meaning: '平等' },
    { id: 'pep12l008', word: 'justice', phonetic: '/ˈdʒʌstɪs/', pos: 'n.', meaning: '正义' },
    { id: 'pep12l009', word: 'responsibility', phonetic: '/rɪˌspɑːnsəˈbɪləti/', pos: 'n.', meaning: '责任' },
    { id: 'pep12l010', word: 'commitment', phonetic: '/kəˈmɪtmənt/', pos: 'n.', meaning: '承诺' },
    { id: 'pep12l011', word: 'tolerance', phonetic: '/ˈtɑːlərəns/', pos: 'n.', meaning: '宽容' },
    { id: 'pep12l012', word: 'dignity', phonetic: '/ˈdɪɡnəti/', pos: 'n.', meaning: '尊严' },
    { id: 'pep12l013', word: 'harmony', phonetic: '/ˈhɑːrməni/', pos: 'n.', meaning: '和谐' },
    { id: 'pep12l014', word: 'prosperity', phonetic: '/prɑːˈsperəti/', pos: 'n.', meaning: '繁荣' },
    { id: 'pep12l015', word: 'democracy', phonetic: '/dɪˈmɑːkrəsi/', pos: 'n.', meaning: '民主' },
  ],
};

// 构建词书列表
function buildBooks(): VocabBook[] {
  const books: VocabBook[] = [];
  const gradeNames: Record<string, string> = {
    'grade3': '三年级', 'grade4': '四年级', 'grade5': '五年级', 'grade6': '六年级',
    'grade7': '七年级', 'grade8': '八年级', 'grade9': '九年级',
    'grade10': '高一', 'grade11': '高二', 'grade12': '高三',
  };
  const stageMap: Record<string, string> = {
    'grade3': 'elementary', 'grade4': 'elementary', 'grade5': 'elementary', 'grade6': 'elementary',
    'grade7': 'middle', 'grade8': 'middle', 'grade9': 'middle',
    'grade10': 'high', 'grade11': 'high', 'grade12': 'high',
  };

  const allWords = { ...pepElementaryWords, ...pepMiddleWords, ...pepHighWords };

  for (const [key, words] of Object.entries(allWords)) {
    const [grade, semester] = key.split('-');
    const semesterName = semester === 'upper' ? '上册' : '下册';
    const bookId = `pep-${key}`;
    books.push({
      id: bookId,
      name: `人教版${gradeNames[grade]}英语${semesterName}`,
      edition: '人教版',
      stage: stageMap[grade],
      grade,
      semester: semesterName,
      type: '同步课本',
      wordCount: words.length,
      words,
    });
  }

  // 添加考试词书
  books.push({
    id: 'zhongkao-core',
    name: '中考核心词汇',
    edition: '通用',
    stage: 'middle',
    grade: 'grade9',
    semester: '全册',
    type: '中考词汇',
    wordCount: 15,
    words: pepMiddleWords['grade9-upper']!,
  });
  books.push({
    id: 'gaokao-core',
    name: '高考核心词汇',
    edition: '通用',
    stage: 'high',
    grade: 'grade12',
    semester: '全册',
    type: '高考词汇',
    wordCount: 15,
    words: pepHighWords['grade12-upper']!,
  });
  books.push({
    id: 'cet4-core',
    name: '四级核心词汇',
    edition: '通用',
    stage: 'high',
    grade: 'grade12',
    semester: '全册',
    type: '四级词汇',
    wordCount: 15,
    words: pepHighWords['grade11-upper']!,
  });
  books.push({
    id: 'cet6-core',
    name: '六级核心词汇',
    edition: '通用',
    stage: 'high',
    grade: 'grade12',
    semester: '全册',
    type: '六级词汇',
    wordCount: 15,
    words: pepHighWords['grade11-lower']!,
  });

  return books;
}

export const vocabBooks = buildBooks();

// 词书分类信息
export const editions = [
  { id: 'pep', name: '人教版' },
  { id: 'waiyan', name: '外研版' },
  { id: 'beishida', name: '北师大版' },
  { id: 'yilin', name: '牛津译林版' },
  { id: 'hujiao', name: '沪教版' },
  { id: 'jijiao', name: '冀教版' },
];

export const stages = [
  { id: 'elementary', name: '小学', grades: ['grade3', 'grade4', 'grade5', 'grade6'] },
  { id: 'middle', name: '初中', grades: ['grade7', 'grade8', 'grade9'] },
  { id: 'high', name: '高中', grades: ['grade10', 'grade11', 'grade12'] },
];

export const vocabTypes = [
  { id: 'textbook', name: '同步课本' },
  { id: 'zhongkao', name: '中考词汇' },
  { id: 'gaokao', name: '高考词汇' },
  { id: 'cet4', name: '四级词汇' },
  { id: 'cet6', name: '六级词汇' },
];
