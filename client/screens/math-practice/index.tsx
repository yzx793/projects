import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';


interface MathQuestion {
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

interface GradeInfo {
  id: string;
  name: string;
  stage: 'elementary' | 'middleSchool' | 'highSchool';
}

const stageNames = {
  elementary: '小学',
  middleSchool: '初中',
  highSchool: '高中',
};

const stageColors = {
  elementary: '#10B981',
  middleSchool: '#3B82F6',
  highSchool: '#8B5CF6',
};

const difficultyLabels = ['', '简单', '较易', '中等', '较难', '困难'];
const difficultyColors = ['', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'];

export default function MathPracticeScreen() {
  const [grades, setGrades] = useState<GradeInfo[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('elementary');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<MathQuestion | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [stats, setStats] = useState({ total: 0, byGrade: {} as Record<string, number> });

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/math/grades`);
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (error) {
      console.error('获取年级列表失败:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/math/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/math/questions?limit=20`;
      if (selectedGrade) {
        url += `&grade=${selectedGrade}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('获取题目失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade]);

  useFocusEffect(
    useCallback(() => {
      fetchGrades();
      fetchStats();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [fetchQuestions])
  );

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrade(gradeId === selectedGrade ? '' : gradeId);
  };

  const handleQuestionPress = (question: MathQuestion) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const handleCheckAnswer = (option: string) => {
    setUserAnswer(option);
    setShowAnswer(true);
  };

  const filteredGrades = grades.filter(g => g.stage === selectedStage);

  const renderDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome6
        key={i}
        name="star"
        size={10}
        color={i < difficulty ? '#F59E0B' : '#E5E7EB'}
      />
    ));
  };

  return (
    <Screen className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">数学题库</Text>
        <Text className="text-white/80 text-sm mt-1">
          全年级全类型数学练习 · 共{stats.total}道题
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row px-4 -mt-4 gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-2xl font-bold text-blue-600">{stats.total}</Text>
          <Text className="text-xs text-gray-500 mt-1">总题数</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-2xl font-bold text-green-600">
            {stats.byGrade['grade7'] || 0}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">初中题</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-2xl font-bold text-purple-600">
            {stats.byGrade['grade10'] || 0}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">高中题</Text>
        </View>
      </View>

      {/* Stage Tabs */}
      <View className="flex-row px-4 mt-4 gap-2">
        {(['elementary', 'middleSchool', 'highSchool'] as const).map((stage) => (
          <TouchableOpacity
            key={stage}
            onPress={() => {
              setSelectedStage(stage);
              setSelectedGrade('');
            }}
            className={`flex-1 py-3 rounded-xl items-center ${
              selectedStage === stage ? 'bg-blue-500' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              className={`font-medium ${
                selectedStage === stage ? 'text-white' : 'text-gray-600'
              }`}
            >
              {stageNames[stage]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grade Filter */}
      <View className="px-4 mt-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <TouchableOpacity
            onPress={() => setSelectedGrade('')}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedGrade === '' ? 'bg-blue-500' : 'bg-white'
            }`}
          >
            <Text className={selectedGrade === '' ? 'text-white' : 'text-gray-600'}>
              全部
            </Text>
          </TouchableOpacity>
          {filteredGrades.map((grade) => (
            <TouchableOpacity
              key={grade.id}
              onPress={() => handleSelectGrade(grade.id)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedGrade === grade.id ? 'bg-blue-500' : 'bg-white'
              }`}
            >
              <Text className={selectedGrade === grade.id ? 'text-white' : 'text-gray-600'}>
                {grade.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Questions List */}
      <View className="flex-1 px-4 mt-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-4">加载题目中...</Text>
          </View>
        ) : (
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleQuestionPress(item)}
                className="bg-white rounded-xl p-4 mb-3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-medium text-gray-900" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                      {item.knowledgePoint}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {renderDifficultyStars(item.difficulty)}
                  </View>
                </View>
                <View className="flex-row mt-3 gap-2">
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: stageColors[item.grade.startsWith('grade1') || item.grade.startsWith('grade2') || item.grade.startsWith('grade3') || item.grade.startsWith('grade4') || item.grade.startsWith('grade5') || item.grade.startsWith('grade6') ? 'elementary' : item.grade.startsWith('grade7') || item.grade.startsWith('grade8') || item.grade.startsWith('grade9') ? 'middleSchool' : 'highSchool'] + '20' }}
                  >
                    <Text className="text-xs" style={{ color: stageColors[item.grade.startsWith('grade1') || item.grade.startsWith('grade2') || item.grade.startsWith('grade3') || item.grade.startsWith('grade4') || item.grade.startsWith('grade5') || item.grade.startsWith('grade6') ? 'elementary' : item.grade.startsWith('grade7') || item.grade.startsWith('grade8') || item.grade.startsWith('grade9') ? 'middleSchool' : 'highSchool'] }}>
                      {item.gradeName}
                    </Text>
                  </View>
                  <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-xs text-gray-600">
                      {item.semester === 'upper' ? '上学期' : '下学期'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <FontAwesome6 name="inbox" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-4">暂无题目</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Question Detail Modal */}
      <Modal
        visible={!!selectedQuestion}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedQuestion(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">题目详情</Text>
              <TouchableOpacity onPress={() => setSelectedQuestion(null)}>
                <FontAwesome6 name="xmark" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {selectedQuestion && (
              <ScrollView className="p-4">
                {/* Question Info */}
                <View className="flex-row gap-2 mb-4">
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 text-sm">{selectedQuestion.gradeName}</Text>
                  </View>
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 text-sm">{selectedQuestion.knowledgePoint}</Text>
                  </View>
                  <View className="flex-row items-center">
                    {renderDifficultyStars(selectedQuestion.difficulty)}
                  </View>
                </View>

                {/* Question Content */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-base text-gray-900 leading-6">
                    {selectedQuestion.question}
                  </Text>
                </View>

                {/* Options */}
                {selectedQuestion.options && (
                  <View className="gap-3 mb-4">
                    {selectedQuestion.options.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index);
                      const isSelected = userAnswer === optionLabel;
                      const isCorrect = optionLabel === selectedQuestion.answer;
                      const showResult = showAnswer && isSelected;

                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => !showAnswer && handleCheckAnswer(optionLabel)}
                          disabled={showAnswer}
                          className={`p-4 rounded-xl border-2 ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : showAnswer && isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row items-center">
                            <View
                              className={`w-8 h-8 rounded-full justify-center items-center mr-3 ${
                                showResult
                                  ? isCorrect
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                  : showAnswer && isCorrect
                                  ? 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            >
                              <Text
                                className={`font-bold ${
                                  (showResult && isCorrect) || (showAnswer && isCorrect)
                                    ? 'text-white'
                                    : 'text-gray-600'
                                }`}
                              >
                                {optionLabel}
                              </Text>
                            </View>
                            <Text className="flex-1 text-base text-gray-800">{option}</Text>
                            {showAnswer && isCorrect && (
                              <FontAwesome6 name="check" size={16} color="#10B981" />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Answer Button */}
                {!showAnswer && selectedQuestion.options && (
                  <TouchableOpacity
                    onPress={() => setShowAnswer(true)}
                    className="bg-blue-500 py-3 rounded-xl"
                  >
                    <Text className="text-white text-center font-medium">查看答案</Text>
                  </TouchableOpacity>
                )}

                {/* Analysis */}
                {showAnswer && (
                  <View className="bg-blue-50 rounded-xl p-4 mt-4">
                    <View className="flex-row items-center mb-2">
                      <FontAwesome6 name="lightbulb" size={16} color="#3B82F6" />
                      <Text className="text-blue-700 font-medium ml-2">解析</Text>
                    </View>
                    <Text className="text-gray-700 leading-6">
                      {selectedQuestion.analysis}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
