import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

const SUBJECTS = [
  { key: 'all', label: '全部' },
  { key: 'math', label: '数学' },
  { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' },
  { key: 'chemistry', label: '化学' },
  { key: 'chinese', label: '语文' },
];

const REVIEW_STATUS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待复习' },
  { key: 'reviewing', label: '复习中' },
  { key: 'mastered', label: '已掌握' },
];

const reviewStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待复习', color: '#F59E0B', bgColor: '#FEF3C7' },
  reviewing: { label: '复习中', color: '#3B82F6', bgColor: '#DBEAFE' },
  mastered: { label: '已掌握', color: '#10B981', bgColor: '#D1FAE5' },
};

const errorTypeLabels: Record<string, string> = {
  calculation: '计算错误',
  concept: '概念错误',
  careless: '粗心大意',
  method: '方法错误',
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
  reviewStatus: 'pending' | 'reviewing' | 'mastered';
  errorType: string;
  tags: string[];
  imageUrl?: string;
}

interface ReviewStats {
  pending: number;
  reviewing: number;
  mastered: number;
}

const difficultyColors: Record<string, string> = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export default function WrongQuestionsScreen() {
  const router = useSafeRouter();
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeReviewStatus, setActiveReviewStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ pending: 0, reviewing: 0, mastered: 0 });
  const [total, setTotal] = useState(0);
  const [unsolved, setUnsolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeSubject !== 'all') params.append('subject', activeSubject);
      if (activeReviewStatus !== 'all') params.append('reviewStatus', activeReviewStatus);
      if (searchQuery) params.append('search', searchQuery);

      const queryString = params.toString() ? `?${params.toString()}` : '';

      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：GET /api/v1/wrong-questions
       * Query 参数: subject?: string, reviewStatus?: string, search?: string
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions${queryString}`);
      const json = await res.json();
      if (json.code === 0) {
        setQuestions(json.data.questions);
        setReviewStats(json.data.reviewStats);
        setTotal(json.data.total);
        setUnsolved(json.data.unsolved);
      }
    } catch (e) {
      console.error('Failed to fetch wrong questions:', e);
    } finally {
      setLoading(false);
    }
  }, [activeSubject, activeReviewStatus, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleReviewStatusChange = async (questionId: number, status: 'pending' | 'reviewing' | 'mastered') => {
    try {
      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：POST /api/v1/wrong-questions/:id/review
       * Path 参数：id: number
       * Body 参数：reviewStatus: 'pending' | 'reviewing' | 'mastered'
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/${questionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus: status }),
      });
      const json = await res.json();
      if (json.code === 0) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update review status:', e);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert('提示', '请先选择要删除的错题');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedIds.length} 道错题吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              /**
               * 服务端文件：server/src/routes/wrongQuestions.ts
               * 接口：POST /api/v1/wrong-questions/batch/delete
               * Body 参数：ids: number[]
               */
              const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/batch/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
              });
              const json = await res.json();
              if (json.code === 0) {
                Alert.alert('成功', json.message);
                setSelectedIds([]);
                setBatchMode(false);
                fetchData();
              }
            } catch (e) {
              console.error('Failed to batch delete:', e);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderQuestionCard = (item: WrongQuestion) => {
    const statusConfig = reviewStatusConfig[item.reviewStatus] || reviewStatusConfig.pending;
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, batchMode && isSelected && styles.cardSelected]}
        onPress={() => {
          if (batchMode) {
            toggleSelect(item.id);
          } else {
            router.push('/question-detail', { id: item.id });
          }
        }}
        onLongPress={() => {
          if (!batchMode) {
            setBatchMode(true);
            toggleSelect(item.id);
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {batchMode && (
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <FontAwesome6 name="check" size={12} color="#FFFFFF" />}
              </View>
            )}
            <View style={[styles.subjectBadge, { backgroundColor: difficultyColors[item.difficulty] + '20' }]}>
              <Text style={[styles.subjectBadgeText, { color: difficultyColors[item.difficulty] }]}>
                {item.subjectName}
              </Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <FontAwesome6 name="circle-xmark" size={12} color="#EF4444" />
              <Text style={styles.metaText}>错{item.wrongCount}次</Text>
            </View>
            {item.errorType && (
              <View style={styles.metaItem}>
                <FontAwesome6 name="tag" size={12} color="#6C63FF" />
                <Text style={styles.metaText}>{errorTypeLabels[item.errorType] || item.errorType}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <FontAwesome6 name="calendar" size={12} color="#A0AEC0" />
              <Text style={styles.metaText}>{item.createdAt}</Text>
            </View>
          </View>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {!batchMode && (
          <View style={styles.quickActions}>
            {item.reviewStatus !== 'mastered' && (
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => handleReviewStatusChange(item.id, 'mastered')}
              >
                <FontAwesome6 name="circle-check" size={14} color="#10B981" />
                <Text style={[styles.quickActionText, { color: '#10B981' }]}>已掌握</Text>
              </TouchableOpacity>
            )}
            {item.reviewStatus === 'mastered' && (
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => handleReviewStatusChange(item.id, 'pending')}
              >
                <FontAwesome6 name="rotate-left" size={14} color="#F59E0B" />
                <Text style={[styles.quickActionText, { color: '#F59E0B' }]}>重新复习</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>错题本</Text>
        <View style={styles.headerActions}>
          {batchMode ? (
            <>
              <TouchableOpacity onPress={() => { setBatchMode(false); setSelectedIds([]); }} style={styles.headerBtn}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBatchDelete} style={styles.deleteBtn}>
                <FontAwesome6 name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setBatchMode(true)} style={styles.headerBtn}>
                <FontAwesome6 name="list-check" size={18} color="#6C63FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/question-edit')} style={styles.addBtn}>
                <FontAwesome6 name="plus" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>总题数</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{reviewStats.pending}</Text>
          <Text style={styles.statLabel}>待复习</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{reviewStats.reviewing}</Text>
          <Text style={styles.statLabel}>复习中</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{reviewStats.mastered}</Text>
          <Text style={styles.statLabel}>已掌握</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome6 name="magnifying-glass" size={14} color="#A0AEC0" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索错题..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome6 name="xmark" size={14} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subject Filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subjectScroll}
          contentContainerStyle={styles.subjectTabs}
        >
          {SUBJECTS.map(subject => (
            <TouchableOpacity
              key={subject.key}
              style={[styles.subjectTab, activeSubject === subject.key && styles.subjectTabActive]}
              onPress={() => setActiveSubject(subject.key)}
            >
              <Text style={[styles.subjectTabText, activeSubject === subject.key && styles.subjectTabTextActive]}>
                {subject.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Review Status Filter */}
      <View style={styles.statusFilterRow}>
        {REVIEW_STATUS.map(status => (
          <TouchableOpacity
            key={status.key}
            style={[styles.statusChip, activeReviewStatus === status.key && styles.statusChipActive]}
            onPress={() => setActiveReviewStatus(status.key)}
          >
            <Text style={[styles.statusChipText, activeReviewStatus === status.key && styles.statusChipTextActive]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Practice Button */}
      <TouchableOpacity
        style={styles.practiceButton}
        onPress={() => router.push('/practice')}
      >
        <FontAwesome6 name="wand-magic-sparkles" size={16} color="#6C63FF" />
        <Text style={styles.practiceButtonText}>组卷练习</Text>
        <FontAwesome6 name="chevron-right" size={12} color="#A0AEC0" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="inbox" size={48} color="#E2E8F0" />
              <Text style={styles.emptyText}>暂无错题记录</Text>
              <Text style={styles.emptySubText}>拍照搜题后自动收录错题</Text>
            </View>
          ) : (
            questions.map(renderQuestionCard)
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Batch Mode Footer */}
      {batchMode && (
        <View style={styles.batchFooter}>
          <Text style={styles.batchFooterText}>已选择 {selectedIds.length} 项</Text>
          <TouchableOpacity style={styles.batchDeleteBtn} onPress={handleBatchDelete}>
            <FontAwesome6 name="trash" size={14} color="#FFFFFF" />
            <Text style={styles.batchDeleteText}>批量删除</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    padding: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#636E72',
  },
  deleteBtn: {
    padding: 8,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
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
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  subjectScroll: {
    marginTop: 12,
  },
  subjectTabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subjectTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  subjectTabActive: {
    backgroundColor: '#6C63FF',
  },
  subjectTabText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  subjectTabTextActive: {
    color: '#FFFFFF',
  },
  statusFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  statusChipActive: {
    backgroundColor: '#EDE9FE',
  },
  statusChipText: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: '#6C63FF',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  practiceButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#6C63FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0AEC0',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#CBD5E0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#636E72',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    gap: 12,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  batchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  batchFooterText: {
    fontSize: 14,
    color: '#636E72',
  },
  batchDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  batchDeleteText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
