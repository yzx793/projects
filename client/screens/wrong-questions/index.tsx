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

interface SubjectStat {
  subject: string;
  subjectName: string;
  count: number;
}

const difficultyLabels: Record<string, string> = {
  easy: '基础',
  medium: '进阶',
  hard: '挑战',
};

const difficultyColors: Record<string, string> = {
  easy: '#00B894',
  medium: '#6C63FF',
  hard: '#FF6584',
};

export default function WrongQuestionsScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [activeSubject, setActiveSubject] = useState('all');
  const [total, setTotal] = useState(0);
  const [unsolved, setUnsolved] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const subjectParam = activeSubject === 'all' ? '' : `?subject=${activeSubject}`;
      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：GET /api/v1/wrong-questions
       * Query 参数: subject?: string, solved?: string
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions${subjectParam}`);
      const json = await res.json();
      if (json.code === 0) {
        setQuestions(json.data.questions);
        setSubjectStats(json.data.stats);
        setTotal(json.data.total);
        setUnsolved(json.data.unsolved);
      }
    } catch (e) {
      console.error('Failed to fetch wrong questions:', e);
    } finally {
      setLoading(false);
    }
  }, [activeSubject]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

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
          <Text style={styles.pageTitle}>错题本</Text>
          <Text style={styles.pageSubtitle}>查漏补缺，精准提升</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{total}</Text>
                <Text style={styles.summaryLabel}>总错题</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#FF6584' }]}>{unsolved}</Text>
                <Text style={styles.summaryLabel}>待攻克</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#00B894' }]}>{total - unsolved}</Text>
                <Text style={styles.summaryLabel}>已掌握</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject Filter */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
          <TouchableOpacity
            style={[styles.filterTab, activeSubject === 'all' && styles.filterTabActive]}
            onPress={() => setActiveSubject('all')}
          >
            <Text style={[styles.filterTabText, activeSubject === 'all' && styles.filterTabTextActive]}>
              全部
            </Text>
          </TouchableOpacity>
          {subjectStats.map((stat) => (
            <TouchableOpacity
              key={stat.subject}
              style={[
                styles.filterTab,
                activeSubject === stat.subject && { backgroundColor: subjectColors[stat.subject] || '#6C63FF' },
              ]}
              onPress={() => setActiveSubject(stat.subject)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeSubject === stat.subject && styles.filterTabTextActive,
                ]}
              >
                {stat.subjectName} ({stat.count})
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
        {questions.map((q) => (
          <TouchableOpacity
            key={q.id}
            activeOpacity={0.8}
            onPress={() => router.push('/question-detail', { questionId: q.id })}
          >
            <View style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <View style={[styles.subjectDot, { backgroundColor: subjectColors[q.subject] || '#6C63FF' }]} />
                    <Text style={styles.questionSubject}>{q.subjectName}</Text>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: `${difficultyColors[q.difficulty]}18` },
                      ]}
                    >
                      <Text style={[styles.difficultyBadgeText, { color: difficultyColors[q.difficulty] }]}>
                        {difficultyLabels[q.difficulty]}
                      </Text>
                    </View>
                    {q.solved && (
                      <View style={styles.solvedBadge}>
                        <FontAwesome6 name="check" size={10} color="#00B894" />
                        <Text style={styles.solvedBadgeText}>已掌握</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.questionTitle} numberOfLines={1}>{q.title}</Text>
                  <Text style={styles.questionPreview} numberOfLines={2}>{q.question}</Text>
                  <View style={styles.questionFooter}>
                    <View style={styles.questionMetaItem}>
                      <FontAwesome6 name="circle-xmark" size={12} color="#FF6584" />
                      <Text style={styles.questionMetaText}>错{q.wrongCount}次</Text>
                    </View>
                    <View style={styles.questionMetaItem}>
                      <FontAwesome6 name="lightbulb" size={12} color="#FDCB6E" />
                      <Text style={styles.questionMetaText} numberOfLines={1}>{q.knowledgePoint}</Text>
                    </View>
                    <Text style={styles.questionDate}>{q.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6C63FF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 4,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E8E8EB',
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#E8E8EB',
  },
  filterTabActive: {
    backgroundColor: '#6C63FF',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  questionCard: {},
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  questionSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,184,148,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  solvedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00B894',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  questionPreview: {
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
  questionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionMetaText: {
    fontSize: 11,
    color: '#636E72',
  },
  questionDate: {
    fontSize: 11,
    color: '#B2BEC3',
    marginLeft: 'auto',
  },
});
