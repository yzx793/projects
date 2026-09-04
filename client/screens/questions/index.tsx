import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/context/AuthContext';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// 学段配置
const STAGES = [
  { id: 'elementary', name: '小学', icon: 'child', color: '#FF6B6B' },
  { id: 'middle', name: '初中', icon: 'graduation-cap', color: '#4ECDC4' },
  { id: 'high', name: '高中', icon: 'user-graduate', color: '#45B7D1' },
];

// 年级配置
const GRADES: Record<string, { id: string; name: string }[]> = {
  elementary: [
    { id: 'grade1', name: '一年级' },
    { id: 'grade2', name: '二年级' },
    { id: 'grade3', name: '三年级' },
    { id: 'grade4', name: '四年级' },
    { id: 'grade5', name: '五年级' },
    { id: 'grade6', name: '六年级' },
  ],
  middle: [
    { id: 'grade7', name: '七年级' },
    { id: 'grade8', name: '八年级' },
    { id: 'grade9', name: '九年级' },
  ],
  high: [
    { id: 'grade10', name: '高一' },
    { id: 'grade11', name: '高二' },
    { id: 'grade12', name: '高三' },
  ],
};

// 科目配置
const SUBJECTS = [
  { id: 'math', name: '数学', icon: 'calculator', color: '#6C63FF' },
  { id: 'chinese', name: '语文', icon: 'book', color: '#FF6584' },
  { id: 'english', name: '英语', icon: 'language', color: '#00C9A7' },
  { id: 'physics', name: '物理', icon: 'atom', color: '#845EC2' },
  { id: 'chemistry', name: '化学', icon: 'flask', color: '#FF6F00' },
  { id: 'biology', name: '生物', icon: 'leaf', color: '#00C853' },
];

// 题目类型配置
const QUESTION_TYPES = [
  { id: 'choice', name: '选择题', icon: 'list-ul' },
  { id: 'fill', name: '填空题', icon: 'pencil-alt' },
  { id: 'short-answer', name: '简答题', icon: 'align-left' },
  { id: 'calculation', name: '计算题', icon: 'calculator' },
];

interface Question {
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
  difficulty: number;
  type: string;
}

type ViewMode = 'stage' | 'grade' | 'subject' | 'type' | 'list';

export default function QuestionsScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('stage');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<{ total: number; bySubject: any[]; byStage: any[] }>({ total: 0, bySubject: [], byStage: [] });

  // 学生端自动按年级过滤
  const studentGradeId = user?.role === 'student' && user?.grade ? `grade${user.grade}` : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // 学生端自动使用自己的年级过滤
      const effectiveGrade = studentGradeId || selectedGrade;
      if (effectiveGrade) params.append('grade', effectiveGrade);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedType) params.append('type', selectedType);
      
      const url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/questions?${params.toString()}`;
      const response = await fetch(url);
      const json = await response.json();
      
      if (json.code === 0) {
        setQuestions(json.data.questions || []);
        setStats(json.data.stats || { total: 0, bySubject: [], byStage: [] });
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, selectedSubject, selectedType, studentGradeId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId);
    setViewMode('grade');
  };

  const handleGradeSelect = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setViewMode('subject');
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setViewMode('type');
  };

  const handleTypeSelect = (typeId: string | null) => {
    setSelectedType(typeId);
    setViewMode('list');
  };

  const handleBack = () => {
    if (viewMode === 'list') {
      setViewMode('type');
      setSelectedType(null);
    } else if (viewMode === 'type') {
      setViewMode('subject');
      setSelectedSubject(null);
    } else if (viewMode === 'subject') {
      setViewMode('grade');
      setSelectedGrade(null);
    } else if (viewMode === 'grade') {
      setViewMode('stage');
      setSelectedStage(null);
    }
  };

  const getSubjectCount = (subjectId: string) => {
    const subject = stats.bySubject.find((s: any) => s.subject === subjectId);
    return subject?.count || 0;
  };

  const getTypeCount = (typeId: string) => {
    return questions.filter(q => q.type === typeId).length;
  };

  // 学生端直接进入年级选择，跳过学段选择
  const initialViewMode = studentGradeId ? 'subject' : viewMode;

  const renderHeader = () => (
    <View className="flex-row items-center mb-4">
      {viewMode !== 'stage' && !studentGradeId && (
        <TouchableOpacity onPress={handleBack} className="mr-3 p-2">
          <FontAwesome6 name="arrow-left" size={20} color="#2D3436" />
        </TouchableOpacity>
      )}
      <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
        {studentGradeId && viewMode === 'subject' && '选择科目'}
        {studentGradeId && viewMode === 'type' && `${SUBJECTS.find(s => s.id === selectedSubject)?.name} - 选择题型`}
        {studentGradeId && viewMode === 'list' && `${SUBJECTS.find(s => s.id === selectedSubject)?.name} - ${QUESTION_TYPES.find(t => t.id === selectedType)?.name || '全部题型'}`}
        {!studentGradeId && viewMode === 'stage' && '选择学段'}
        {!studentGradeId && viewMode === 'grade' && `${STAGES.find(s => s.id === selectedStage)?.name} - 选择年级`}
        {!studentGradeId && viewMode === 'subject' && `${GRADES[selectedStage || '']?.find(g => g.id === selectedGrade)?.name} - 选择科目`}
        {!studentGradeId && viewMode === 'type' && `${SUBJECTS.find(s => s.id === selectedSubject)?.name} - 选择题型`}
        {!studentGradeId && viewMode === 'list' && `${SUBJECTS.find(s => s.id === selectedSubject)?.name} - ${QUESTION_TYPES.find(t => t.id === selectedType)?.name || '全部题型'}`}
      </Text>
      <View className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
        <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
          {stats.total}题
        </Text>
      </View>
    </View>
  );

  const renderStageSelection = () => (
    <View className="flex-row flex-wrap gap-3">
      {STAGES.map(stage => (
        <TouchableOpacity
          key={stage.id}
          onPress={() => handleStageSelect(stage.id)}
          className="items-center justify-center rounded-3xl bg-white dark:bg-gray-800 shadow-sm"
          style={{
            width: '47%',
            aspectRatio: 1.2,
            shadowColor: stage.color,
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: stage.color + '20' }}
          >
            <FontAwesome6 name={stage.icon as any} size={28} color={stage.color} />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">{stage.name}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.byStage.find((s: any) => s.stage === stage.id)?.count || 0}题
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGradeSelection = () => {
    const grades = GRADES[selectedStage || ''] || [];
    return (
      <View className="flex-row flex-wrap gap-3">
        {grades.map(grade => (
          <TouchableOpacity
            key={grade.id}
            onPress={() => handleGradeSelect(grade.id)}
            className="items-center justify-center rounded-2xl bg-white dark:bg-gray-800 px-6 py-4 shadow-sm"
            style={{
              width: '47%',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-base font-bold text-gray-900 dark:text-white">{grade.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSubjectSelection = () => (
    <View className="flex-row flex-wrap gap-3">
      {SUBJECTS.map(subject => {
        const count = getSubjectCount(subject.id);
        return (
          <TouchableOpacity
            key={subject.id}
            onPress={() => handleSubjectSelect(subject.id)}
            className="items-center justify-center rounded-2xl bg-white dark:bg-gray-800 px-4 py-4 shadow-sm"
            style={{
              width: '30%',
              shadowColor: subject.color,
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: subject.color + '20' }}
            >
              <FontAwesome6 name={subject.icon as any} size={20} color={subject.color} />
            </View>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">{subject.name}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{count}题</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTypeSelection = () => (
    <View>
      {/* 全部题型 */}
      <TouchableOpacity
        onPress={() => handleTypeSelect(null)}
        className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
      >
        <View className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mr-4">
          <FontAwesome6 name="table-cells" size={20} color="#6C63FF" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 dark:text-white">全部题型</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{questions.length}题</Text>
        </View>
        <FontAwesome6 name="chevron-right" size={16} color="#C4CDD5" />
      </TouchableOpacity>

      {/* 各题型 */}
      {QUESTION_TYPES.map(type => {
        const count = getTypeCount(type.id);
        if (count === 0) return null;
        return (
          <TouchableOpacity
            key={type.id}
            onPress={() => handleTypeSelect(type.id)}
            className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
          >
            <View className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center mr-4">
              <FontAwesome6 name={type.icon as any} size={20} color="#636E72" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900 dark:text-white">{type.name}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">{count}题</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color="#C4CDD5" />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderQuestionList = () => (
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/question-detail?id=${item.id}`)}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
        >
          <View className="flex-row items-center mb-2">
            <View className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md mr-2">
              <Text className="text-xs text-indigo-600 dark:text-indigo-400">
                {QUESTION_TYPES.find(t => t.id === item.type)?.name || item.type}
              </Text>
            </View>
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <FontAwesome6
                  key={star}
                  name="star"
                  size={10}
                  color={star <= item.difficulty ? '#FFD700' : '#E0E0E0'}
                />
              ))}
            </View>
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300" numberOfLines={2}>
            {item.question}
          </Text>
          <View className="flex-row items-center mt-3">
            <FontAwesome6 name="book-open" size={12} color="#B2BEC3" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.knowledgePoint}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View className="items-center justify-center py-12">
          <FontAwesome6 name="inbox" size={48} color="#DFE6E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">暂无题目</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-4">
        {renderHeader()}
        
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {!studentGradeId && viewMode === 'stage' && renderStageSelection()}
            {!studentGradeId && viewMode === 'grade' && renderGradeSelection()}
            {(studentGradeId || viewMode === 'subject') && renderSubjectSelection()}
            {viewMode === 'type' && renderTypeSelection()}
            {viewMode === 'list' && renderQuestionList()}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}