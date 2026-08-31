import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeSearchParams, useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

interface WrongQuestion {
  id: number;
  subject: string;
  subjectName: string;
  title: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  analysis: string;
  knowledgePoint: string;
  difficulty: string;
  createdAt: string;
  solved: boolean;
  wrongCount: number;
}

export default function QuestionDetailScreen() {
  const { questionId } = useSafeSearchParams<{ questionId: number }>();
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState<WrongQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchQuestion = async () => {
        try {
          /**
           * 服务端文件：server/src/routes/wrongQuestions.ts
           * 接口：GET /api/v1/wrong-questions/:id
           * Path 参数: id: number
           */
          const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/${questionId}`);
          const json = await res.json();
          if (json.code === 0) setQuestion(json.data);
        } catch (e) {
          console.error('Failed to fetch question:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }, [questionId])
  );

  const handleMarkSolved = useCallback(async () => {
    if (!question || question.solved) return;
    try {
      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：POST /api/v1/wrong-questions/:id/solve
       * Path 参数: id: number
       */
      const res = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/${question.id}/solve`,
        { method: 'POST' }
      );
      const json = await res.json();
      if (json.code === 0) {
        setQuestion(prev => prev ? { ...prev, solved: true } : null);
      }
    } catch (e) {
      console.error('Failed to mark solved:', e);
    }
  }, [question]);

  if (loading) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  if (!question) return null;

  const color = subjectColors[question.subject] || '#6C63FF';

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.subjectBadge, { backgroundColor: `${color}18` }]}>
              <Text style={[styles.subjectBadgeText, { color }]}>{question.subjectName}</Text>
            </View>
            {question.solved && (
              <View style={styles.solvedBadge}>
                <FontAwesome6 name="circle-check" size={14} color="#00B894" />
                <Text style={styles.solvedBadgeText}>已掌握</Text>
              </View>
            )}
          </View>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <FontAwesome6 name="lightbulb" size={12} color="#FDCB6E" />
              <Text style={styles.metaText}>{question.knowledgePoint}</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome6 name="circle-xmark" size={12} color="#FF6584" />
              <Text style={styles.metaText}>错{question.wrongCount}次</Text>
            </View>
            <Text style={styles.dateText}>{question.createdAt}</Text>
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={[styles.cardLabel, { backgroundColor: `${color}15` }]}>
              <FontAwesome6 name="circle-question" size={14} color={color} />
              <Text style={[styles.cardLabelText, { color }]}>题目</Text>
            </View>
            <Text style={styles.questionContent}>{question.question}</Text>
          </View>
        </View>

        {/* User Answer */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={[styles.cardLabel, { backgroundColor: 'rgba(255,101,132,0.10)' }]}>
              <FontAwesome6 name="user" size={14} color="#FF6584" />
              <Text style={[styles.cardLabelText, { color: '#FF6584' }]}>你的答案</Text>
            </View>
            <Text style={styles.answerText}>{question.userAnswer}</Text>
          </View>
        </View>

        {/* Correct Answer */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={[styles.cardLabel, { backgroundColor: 'rgba(0,184,148,0.10)' }]}>
              <FontAwesome6 name="circle-check" size={14} color="#00B894" />
              <Text style={[styles.cardLabelText, { color: '#00B894' }]}>正确答案</Text>
            </View>
            <Text style={[styles.answerText, { color: '#00B894' }]}>{question.correctAnswer}</Text>
          </View>
        </View>

        {/* Analysis */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowAnswer(!showAnswer)}
        >
          <View style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.analysisHeader}>
                <View style={[styles.cardLabel, { backgroundColor: 'rgba(108,99,255,0.10)' }]}>
                  <FontAwesome6 name="book-open" size={14} color="#6C63FF" />
                  <Text style={[styles.cardLabelText, { color: '#6C63FF' }]}>解析</Text>
                </View>
                <FontAwesome6
                  name={showAnswer ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#6C63FF"
                />
              </View>
              {showAnswer && (
                <Text style={styles.analysisText}>{question.analysis}</Text>
              )}
              {!showAnswer && (
                <Text style={styles.tapHint}>点击查看解析</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Button */}
        {!question.solved && (
          <View style={styles.actionContainer}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleMarkSolved}>
              <LinearGradient
                colors={['#00B894', '#55EFC4']}
                style={styles.solveBtn}
              >
                <FontAwesome6 name="check" size={18} color="#FFF" />
                <Text style={styles.solveBtnText}>已掌握，标记解决</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,184,148,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  solvedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B894',
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#636E72',
  },
  dateText: {
    fontSize: 12,
    color: '#B2BEC3',
    marginLeft: 'auto',
  },
  shadowDark: {
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    borderRadius: 24,
    marginBottom: 16,
    marginHorizontal: 24,
    elevation: 6,
    backgroundColor: '#F0F0F3',
  },
  shadowLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 12,
  },
  cardLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionContent: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 24,
  },
  answerText: {
    fontSize: 15,
    color: '#FF6584',
    fontWeight: '600',
    lineHeight: 22,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
    marginTop: 4,
  },
  tapHint: {
    fontSize: 13,
    color: '#B2BEC3',
    marginTop: 4,
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  solveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 9999,
    paddingVertical: 16,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  solveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
