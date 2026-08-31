import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

const SUBJECTS = [
  { key: 'all', label: '全部', icon: 'layer-group' as const, color: '#6C63FF' },
  { key: 'math', label: '数学', icon: 'calculator' as const, color: '#4F46E5' },
  { key: 'english', label: '英语', icon: 'language' as const, color: '#059669' },
  { key: 'physics', label: '物理', icon: 'atom' as const, color: '#0891B2' },
  { key: 'chemistry', label: '化学', icon: 'flask' as const, color: '#D97706' },
  { key: 'chinese', label: '语文', icon: 'book' as const, color: '#DC2626' },
];

const COUNT_OPTIONS = [3, 5, 10, 15, 20];

export default function PracticeScreen() {
  const router = useSafeRouter();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCount, setSelectedCount] = useState(5);
  const [includeAnswer, setIncludeAnswer] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    title: string;
    content: string;
    stats: { totalQuestions: number; subjects: string[]; avgWrongCount: string };
  } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      /**
       * 服务端文件：server/src/routes/practice.ts
       * 接口：POST /api/v1/practice/generate
       * Body 参数：subject?: string, count?: number, includeAnswer?: boolean
       */
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          count: selectedCount,
          includeAnswer,
        }),
      });

      const result = await response.json();
      if (result.code === 0) {
        setPracticeResult(result.data);
      } else {
        Alert.alert('错误', result.message || '生成失败');
      }
    } catch (error) {
      console.error('Failed to generate practice:', error);
      Alert.alert('错误', '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!practiceResult) return;

    try {
      await Share.share({
        message: `${practiceResult.title}\n\n${practiceResult.content}`,
        title: practiceResult.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleReset = () => {
    setPracticeResult(null);
  };

  if (practiceResult) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset} style={styles.backButton}>
            <FontAwesome6 name="chevron-left" size={20} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>练习卷</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <FontAwesome6 name="share-nodes" size={18} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{practiceResult.title}</Text>
            <View style={styles.resultStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{practiceResult.stats.totalQuestions}</Text>
                <Text style={styles.statLabel}>题目数</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{practiceResult.stats.subjects.join('/')}</Text>
                <Text style={styles.statLabel}>科目</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{practiceResult.stats.avgWrongCount}</Text>
                <Text style={styles.statLabel}>平均错次</Text>
              </View>
            </View>
          </View>

          <View style={styles.resultBody}>
            <Text style={styles.resultBodyText}>{practiceResult.content}</Text>
          </View>
        </ScrollView>

        <View style={styles.resultFooter}>
          <TouchableOpacity style={styles.footerButton} onPress={handleReset}>
            <FontAwesome6 name="rotate-right" size={16} color="#6C63FF" />
            <Text style={styles.footerButtonText}>重新生成</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonPrimary]} onPress={handleShare}>
            <FontAwesome6 name="share-nodes" size={16} color="#FFFFFF" />
            <Text style={styles.footerButtonTextWhite}>分享练习卷</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>组卷练习</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 科目选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择科目</Text>
          <View style={styles.subjectGrid}>
            {SUBJECTS.map(subject => (
              <TouchableOpacity
                key={subject.key}
                style={[
                  styles.subjectCard,
                  selectedSubject === subject.key && { backgroundColor: subject.color },
                ]}
                onPress={() => setSelectedSubject(subject.key)}
              >
                <FontAwesome6
                  name={subject.icon}
                  size={20}
                  color={selectedSubject === subject.key ? '#FFFFFF' : subject.color}
                />
                <Text
                  style={[
                    styles.subjectLabel,
                    selectedSubject === subject.key && styles.subjectLabelActive,
                  ]}
                >
                  {subject.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 题目数量 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>题目数量</Text>
          <View style={styles.countRow}>
            {COUNT_OPTIONS.map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countChip,
                  selectedCount === count && styles.countChipActive,
                ]}
                onPress={() => setSelectedCount(count)}
              >
                <Text
                  style={[
                    styles.countText,
                    selectedCount === count && styles.countTextActive,
                  ]}
                >
                  {count}题
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 答案选项 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>答案设置</Text>
          <View style={styles.answerOptions}>
            <TouchableOpacity
              style={[styles.answerOption, includeAnswer && styles.answerOptionActive]}
              onPress={() => setIncludeAnswer(true)}
            >
              <FontAwesome6
                name="circle-check"
                size={18}
                color={includeAnswer ? '#6C63FF' : '#A0AEC0'}
              />
              <Text style={[styles.answerOptionText, includeAnswer && styles.answerOptionTextActive]}>
                包含答案和解析
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerOption, !includeAnswer && styles.answerOptionActive]}
              onPress={() => setIncludeAnswer(false)}
            >
              <FontAwesome6
                name="circle"
                size={18}
                color={!includeAnswer ? '#6C63FF' : '#A0AEC0'}
              />
              <Text style={[styles.answerOptionText, !includeAnswer && styles.answerOptionTextActive]}>
                仅题目（练习模式）
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 说明 */}
        <View style={styles.infoSection}>
          <FontAwesome6 name="circle-info" size={16} color="#6C63FF" />
          <Text style={styles.infoText}>
            系统会根据你的错题记录，优先选择错误次数多的题目生成练习卷，帮助你针对性地巩固薄弱环节。
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.generateButton, generating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome6 name="wand-magic-sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>生成练习卷</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3436',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F7FF',
    gap: 6,
  },
  subjectLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  subjectLabelActive: {
    color: '#FFFFFF',
  },
  countRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
  },
  countChipActive: {
    backgroundColor: '#6C63FF',
  },
  countText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  countTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  answerOptions: {
    gap: 10,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8F7FF',
    gap: 10,
  },
  answerOptionActive: {
    backgroundColor: '#EDE9FE',
  },
  answerOptionText: {
    fontSize: 14,
    color: '#636E72',
  },
  answerOptionTextActive: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4C1D95',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Result styles
  resultContent: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  resultHeader: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
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
  resultBody: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultBodyText: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  resultFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    gap: 8,
  },
  footerButtonPrimary: {
    backgroundColor: '#6C63FF',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  footerButtonTextWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
