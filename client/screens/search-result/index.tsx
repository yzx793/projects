import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// Subject color mapping
const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

interface Question {
  id: number;
  title: string;
  subject: string;
  subjectName: string;
  type: string;
  difficulty: number;
  content: string;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  source: string;
  matchScore?: number;
}

export default function SearchResultScreen() {
  const router = useSafeRouter();
  const { questionIds } = useSafeSearchParams<{ questionIds: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

  const fetchQuestions = useCallback(async () => {
    if (!questionIds) return;
    
    try {
      const ids = questionIds.split(',');
      const results: Question[] = [];
      
      for (const id of ids) {
        /**
         * 服务端文件：server/src/routes/search.ts
         * 接口：GET /api/v1/search/question/:id
         * Path 参数: id: number
         */
        const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/question/${id}`);
        const json = await res.json();
        if (json.code === 0) {
          results.push(json.data);
        }
      }
      
      setQuestions(results);
    } catch (error) {
      console.error('Fetch questions error:', error);
    } finally {
      setLoading(false);
    }
  }, [questionIds]);

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [fetchQuestions])
  );

  const handleSaveToWrongQuestions = useCallback(async (question: Question) => {
    try {
      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：POST /api/v1/wrong-questions
       * Body: { title: string, subject: string, subjectName: string, type: string, difficulty: number, content: string, answer: string, analysis: string, knowledgePoints: string[], source: string }
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: question.title,
          subject: question.subject,
          subjectName: question.subjectName,
          type: question.type,
          difficulty: question.difficulty,
          content: question.content,
          answer: question.answer,
          analysis: question.analysis,
          knowledgePoints: question.knowledgePoints,
          source: '拍照搜题',
        }),
      });

      const json = await res.json();
      if (json.code === 0) {
        setSavedIds(prev => new Set(prev).add(question.id));
        Alert.alert('成功', '已保存到错题本');
      }
    } catch (error) {
      console.error('Save to wrong questions error:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  }, []);

  const handleAddToFavorites = useCallback(async (question: Question) => {
    try {
      /**
       * 服务端文件：server/src/routes/favorites.ts
       * 接口：POST /api/v1/favorites
       * Body: { questionId: number, title: string, subject: string, subjectName: string, type: string, difficulty: number, content: string, answer: string, analysis: string, knowledgePoints: string[], source: string }
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          title: question.title,
          subject: question.subject,
          subjectName: question.subjectName,
          type: question.type,
          difficulty: question.difficulty,
          content: question.content,
          answer: question.answer,
          analysis: question.analysis,
          knowledgePoints: question.knowledgePoints,
          source: '拍照搜题',
        }),
      });

      const json = await res.json();
      if (json.code === 0) {
        setFavoritedIds(prev => new Set(prev).add(question.id));
        Alert.alert('成功', '已添加到收藏');
      }
    } catch (error) {
      console.error('Add to favorites error:', error);
      Alert.alert('错误', '收藏失败，请重试');
    }
  }, []);

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>正在加载搜索结果...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome6 name="arrow-left" size={20} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>搜索结果</Text>
          <View style={styles.placeholderBtn} />
        </View>

        {/* Results Summary */}
        <View style={styles.summaryCard}>
          <FontAwesome6 name="magnifying-glass" size={20} color="#6C63FF" />
          <Text style={styles.summaryText}>找到 {questions.length} 道相关题目</Text>
        </View>

        {/* Question List */}
        {questions.map((question) => {
          const isExpanded = expandedId === question.id;
          const isSaved = savedIds.has(question.id);
          const isFavorited = favoritedIds.has(question.id);
          const color = subjectColors[question.subject] || '#6C63FF';

          return (
            <View key={question.id} style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.questionCard}>
                  {/* Question Header */}
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => setExpandedId(isExpanded ? null : question.id)}
                  >
                    <View style={[styles.subjectBadge, { backgroundColor: `${color}20` }]}>
                      <Text style={[styles.subjectBadgeText, { color }]}>{question.subjectName}</Text>
                    </View>
                    <View style={styles.questionTitleRow}>
                      <Text style={styles.questionTitle} numberOfLines={2}>
                        {question.title}
                      </Text>
                      <FontAwesome6
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#B2BEC3"
                      />
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        {'★'.repeat(question.difficulty)}{'☆'.repeat(5 - question.difficulty)}
                      </Text>
                      <Text style={styles.metaText}>
                        {question.type === 'choice' ? '选择题' : '填空题'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionLabel}>题目内容</Text>
                        <Text style={styles.contentText}>{question.content}</Text>
                      </View>

                      <View style={styles.contentSection}>
                        <Text style={styles.sectionLabel}>参考答案</Text>
                        <Text style={styles.answerText}>{question.answer}</Text>
                      </View>

                      <View style={styles.contentSection}>
                        <Text style={styles.sectionLabel}>解析</Text>
                        <Text style={styles.analysisText}>{question.analysis}</Text>
                      </View>

                      <View style={styles.contentSection}>
                        <Text style={styles.sectionLabel}>知识点</Text>
                        <View style={styles.tagsRow}>
                          {question.knowledgePoints.map((kp, idx) => (
                            <View key={idx} style={styles.tag}>
                              <Text style={styles.tagText}>{kp}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, isSaved && styles.actionBtnSaved]}
                          onPress={() => !isSaved && handleSaveToWrongQuestions(question)}
                          disabled={isSaved}
                        >
                          <FontAwesome6
                            name={isSaved ? 'circle-check' : 'circle-xmark'}
                            size={18}
                            color={isSaved ? '#00B894' : '#FF6584'}
                          />
                          <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextSaved]}>
                            {isSaved ? '已保存' : '加入错题本'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, isFavorited && styles.actionBtnFavorited]}
                          onPress={() => !isFavorited && handleAddToFavorites(question)}
                          disabled={isFavorited}
                        >
                          <FontAwesome6
                            name={isFavorited ? 'star' : 'star'}
                            size={18}
                            color={isFavorited ? '#FDCB6E' : '#636E72'}
                          />
                          <Text style={[styles.actionBtnText, isFavorited && styles.actionBtnTextFavorited]}>
                            {isFavorited ? '已收藏' : '收藏'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.continueSearchBtn}
            onPress={() => router.replace('/camera')}
          >
            <FontAwesome6 name="camera" size={18} color="#6C63FF" />
            <Text style={styles.continueSearchText}>继续拍照搜题</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#636E72',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 16,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C63FF',
  },
  shadowDark: {
    shadowColor: '#B2BEC3',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  shadowLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  questionCard: {
    padding: 16,
  },
  questionHeader: {
    gap: 8,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  questionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#636E72',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    gap: 16,
  },
  contentSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  contentText: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  answerText: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '500',
    lineHeight: 22,
  },
  analysisText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#636E72',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
  },
  actionBtnSaved: {
    backgroundColor: 'rgba(0,184,148,0.1)',
  },
  actionBtnFavorited: {
    backgroundColor: 'rgba(253,203,110,0.15)',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
  },
  actionBtnTextSaved: {
    color: '#00B894',
  },
  actionBtnTextFavorited: {
    color: '#B8860B',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  continueSearchBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  continueSearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
});
