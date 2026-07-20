import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
  biology: '#00B894',
};

const subjectNames: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
};

const gradeNames: Record<string, string> = {
  grade1: '一年级',
  grade2: '二年级',
  grade3: '三年级',
  grade4: '四年级',
  grade5: '五年级',
  grade6: '六年级',
  grade7: '七年级',
  grade8: '八年级',
  grade9: '九年级',
  grade10: '高一',
  grade11: '高二',
  grade12: '高三',
};

const stageNames: Record<string, string> = {
  elementary: '小学',
  middle: '初中',
  high: '高中',
};

const typeLabels: Record<string, string> = {
  choice: '选择题',
  fill: '填空题',
  short_answer: '简答题',
  essay: '作文题',
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const difficultyColors: Record<string, string> = {
  easy: '#00B894',
  medium: '#FDCB6E',
  hard: '#FF6584',
};

interface Question {
  id: number;
  subject: string;
  subjectName: string;
  grade: string;
  gradeName: string;
  stage: string;
  type: string;
  difficulty: string;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  analysis: string;
  knowledgePoint: string;
  tags: string[];
}

interface GradeCount {
  grade: string;
  gradeName: string;
  count: number;
}

export default function QuestionsScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeGrade, setActiveGrade] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gradeCounts, setGradeCounts] = useState<GradeCount[]>([]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/questions?limit=50`;
      if (activeSubject !== 'all') {
        url += `&subject=${activeSubject}`;
      }
      if (activeGrade !== 'all') {
        url += `&grade=${activeGrade}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 0) {
        setQuestions(json.data.questions || []);
        // Use stats for display
        if (json.data.stats) {
          const counts = (json.data.stats.bySubject || []).map((s: any) => ({
            grade: s.subject,
            gradeName: s.subjectName,
            count: s.count,
          }));
          setGradeCounts(counts);
        } else {
          setGradeCounts([]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch questions:', e);
    } finally {
      setLoading(false);
    }
  }, [activeSubject, activeGrade]);

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [fetchQuestions])
  );

  const handleQuestionPress = (question: Question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  const handleAddToWrongQuestions = async (question: Question) => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: question.subject,
          subjectName: question.subjectName,
          title: question.title,
          question: question.question,
          correctAnswer: question.correctAnswer,
          knowledgePoint: question.knowledgePoint,
          tags: question.tags,
          errorType: 'concept',
          source: '题库',
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        Alert.alert('成功', '已添加到错题本');
        setModalVisible(false);
      } else {
        Alert.alert('失败', json.message || '添加失败');
      }
    } catch (e) {
      console.error('Failed to add to wrong questions:', e);
      Alert.alert('错误', '网络错误');
    }
  };

  const subjects = [
    { id: 'all', name: '全部', icon: 'list' },
    { id: 'math', name: '数学', icon: 'calculator' },
    { id: 'chinese', name: '语文', icon: 'book' },
    { id: 'english', name: '英语', icon: 'language' },
    { id: 'physics', name: '物理', icon: 'atom' },
    { id: 'chemistry', name: '化学', icon: 'flask' },
  ];

  const grades = [
    { id: 'all', name: '全部年级' },
    { id: 'grade1', name: '一年级' },
    { id: 'grade2', name: '二年级' },
    { id: 'grade3', name: '三年级' },
    { id: 'grade4', name: '四年级' },
    { id: 'grade5', name: '五年级' },
    { id: 'grade6', name: '六年级' },
    { id: 'grade7', name: '七年级' },
    { id: 'grade8', name: '八年级' },
    { id: 'grade9', name: '九年级' },
    { id: 'grade10', name: '高一' },
    { id: 'grade11', name: '高二' },
    { id: 'grade12', name: '高三' },
  ];

  if (loading && questions.length === 0) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>学科题库</Text>
          <Text style={styles.pageSubtitle}>小学一年级到高中全科题目</Text>
        </View>

        {/* Subject Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectTabsContainer}
          >
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjectTab,
                  activeSubject === s.id && { backgroundColor: s.id === 'all' ? '#6C63FF' : subjectColors[s.id] },
                ]}
                onPress={() => setActiveSubject(s.id)}
              >
                <FontAwesome6
                  name={s.icon as any}
                  size={16}
                  color={activeSubject === s.id ? '#FFF' : (s.id === 'all' ? '#6C63FF' : subjectColors[s.id])}
                />
                <Text
                  style={[
                    styles.subjectTabText,
                    activeSubject === s.id && styles.subjectTabTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grade Filter */}
        <View style={styles.gradeFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gradeTabsContainer}
          >
            {grades.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.gradeTab,
                  activeGrade === g.id && styles.gradeTabActive,
                ]}
                onPress={() => setActiveGrade(g.id)}
              >
                <Text
                  style={[
                    styles.gradeTabText,
                    activeGrade === g.id && styles.gradeTabTextActive,
                  ]}
                >
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{questions.length}</Text>
            <Text style={styles.statLabel}>当前题目</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gradeCounts.length}</Text>
            <Text style={styles.statLabel}>学科分布</Text>
          </View>
        </View>

        {/* Question List */}
        <View style={styles.questionListContainer}>
          {questions.map((question) => (
            <TouchableOpacity
              key={question.id}
              activeOpacity={0.8}
              onPress={() => handleQuestionPress(question)}
            >
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <View style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <View style={[styles.subjectBadge, { backgroundColor: `${subjectColors[question.subject]}18` }]}>
                        <Text style={[styles.subjectBadgeText, { color: subjectColors[question.subject] }]}>
                          {question.subjectName}
                        </Text>
                      </View>
                      <View style={[styles.gradeBadge, { backgroundColor: '#6C63FF18' }]}>
                        <Text style={[styles.gradeBadgeText, { color: '#6C63FF' }]}>
                          {question.gradeName}
                        </Text>
                      </View>
                      <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[question.difficulty]}18` }]}>
                        <Text style={[styles.difficultyBadgeText, { color: difficultyColors[question.difficulty] }]}>
                          {difficultyLabels[question.difficulty]}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.questionTitle} numberOfLines={2}>{question.title}</Text>
                    <Text style={styles.questionContent} numberOfLines={2}>{question.question}</Text>
                    <View style={styles.questionFooter}>
                      <View style={styles.typeTag}>
                        <FontAwesome6 name="file-lines" size={10} color="#636E72" />
                        <Text style={styles.typeTagText}>{typeLabels[question.type]}</Text>
                      </View>
                      <View style={styles.knowledgeTag}>
                        <FontAwesome6 name="lightbulb" size={10} color="#6C63FF" />
                        <Text style={styles.knowledgeTagText}>{question.knowledgePoint}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {questions.length === 0 && (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="inbox" size={48} color="#B2BEC3" />
              <Text style={styles.emptyText}>暂无题目</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Question Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>题目详情</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <FontAwesome6 name="xmark" size={20} color="#636E72" />
                  </TouchableOpacity>
                </View>

                {selectedQuestion && (
                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    {/* Question Info */}
                    <View style={styles.modalInfoRow}>
                      <View style={[styles.subjectBadge, { backgroundColor: `${subjectColors[selectedQuestion.subject]}18` }]}>
                        <Text style={[styles.subjectBadgeText, { color: subjectColors[selectedQuestion.subject] }]}>
                          {selectedQuestion.subjectName}
                        </Text>
                      </View>
                      <Text style={styles.modalGradeText}>{selectedQuestion.gradeName}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[selectedQuestion.difficulty]}18` }]}>
                        <Text style={[styles.difficultyBadgeText, { color: difficultyColors[selectedQuestion.difficulty] }]}>
                          {difficultyLabels[selectedQuestion.difficulty]}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.modalQuestionTitle}>{selectedQuestion.title}</Text>

                    {/* Question Content */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>题目内容</Text>
                      <Text style={styles.modalQuestionContent}>{selectedQuestion.question}</Text>
                    </View>

                    {/* Options */}
                    {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>选项</Text>
                        {selectedQuestion.options.map((option, index) => (
                          <View key={index} style={styles.optionItem}>
                            <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}.</Text>
                            <Text style={styles.optionText}>{option}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Answer */}
                    <View style={[styles.modalSection, { backgroundColor: '#00B89410', borderRadius: 12, padding: 12 }]}>
                      <Text style={[styles.modalSectionTitle, { color: '#00B894' }]}>正确答案</Text>
                      <Text style={styles.modalAnswerText}>{selectedQuestion.correctAnswer}</Text>
                    </View>

                    {/* Analysis */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>解析</Text>
                      <Text style={styles.modalAnalysisText}>{selectedQuestion.analysis}</Text>
                    </View>

                    {/* Knowledge Point */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>知识点</Text>
                      <View style={styles.knowledgePointTag}>
                        <FontAwesome6 name="lightbulb" size={12} color="#6C63FF" />
                        <Text style={styles.knowledgePointText}>{selectedQuestion.knowledgePoint}</Text>
                      </View>
                    </View>
                  </ScrollView>
                )}

                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>关闭</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={() => selectedQuestion && handleAddToWrongQuestions(selectedQuestion)}
                  >
                    <FontAwesome6 name="plus" size={14} color="#FFF" />
                    <Text style={styles.modalSaveBtnText}>加入错题本</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  subjectTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  subjectTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  subjectTabTextActive: {
    color: '#FFF',
  },
  gradeFilterContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  gradeTabsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  gradeTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  gradeTabActive: {
    backgroundColor: '#6C63FF',
  },
  gradeTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636E72',
  },
  gradeTabTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  questionListContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  shadowDark: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 2,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  questionContent: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 10,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeTagText: {
    fontSize: 11,
    color: '#636E72',
  },
  knowledgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  knowledgeTagText: {
    fontSize: 11,
    color: '#6C63FF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#B2BEC3',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalGradeText: {
    fontSize: 12,
    color: '#636E72',
  },
  modalQuestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 6,
  },
  modalQuestionContent: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  optionText: {
    fontSize: 13,
    color: '#2D3436',
    flex: 1,
  },
  modalAnswerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B894',
  },
  modalAnalysisText: {
    fontSize: 13,
    color: '#2D3436',
    lineHeight: 19,
  },
  knowledgePointTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C63FF10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  knowledgePointText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636E72',
  },
  modalSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
