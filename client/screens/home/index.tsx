import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearch } from '@/contexts/SearchContext';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const { width } = Dimensions.get('window');

// Subject color mapping
const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    title: '古诗词鉴赏 - 唐诗三百首',
    subject: 'chinese',
    subjectName: '语文 · 七年级',
    type: 'video',
    duration: 20,
    completed: false,
    progress: 0,
  },
  {
    id: 2,
    title: '计算打卡 - 有理数运算',
    subject: 'math',
    subjectName: '数学 · 七年级',
    type: 'exercise',
    duration: 15,
    completed: false,
    progress: 0,
  },
  {
    id: 3,
    title: '单词背诵 - 初中核心词汇',
    subject: 'english',
    subjectName: '英语 · 七年级',
    type: 'exercise',
    duration: 25,
    completed: false,
    progress: 0,
  },
];

interface Task {
  id: number;
  title: string;
  subject: string;
  subjectName: string;
  type: string;
  duration: number;
  completed: boolean;
  progress: number;
}

interface TaskSummary {
  total: number;
  completed: number;
  totalDuration: number;
  completedDuration: number;
  progress: number;
}

export default function HomeScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { dailyStats, recentSearches } = useSearch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      try {
        const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks`);
        const json = await res.json();
        if (json.code === 0) {
          setTasks(json.data.tasks);
          setSummary(json.data.summary);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch tasks:', e);
      }
      // Fallback to mock data
      setTasks(mockTasks);
      setSummary({ total: 3, completed: 0, totalDuration: 60, completedDuration: 0, progress: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const handleCompleteTask = useCallback(async (taskId: number) => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks/${taskId}/complete`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.code === 0) {
        fetchTasks();
      }
    } catch (e) {
      console.error('Failed to complete task:', e);
    }
  }, [fetchTasks]);

  if (loading) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  const greeting = getGreeting();

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>同学</Text>
          </View>
          <TouchableOpacity
            style={styles.diagnoseBtn}
            onPress={() => router.push('/course-detail', { courseId: 1 })}
          >
            <FontAwesome6 name="brain" size={20} color="#6C63FF" />
            <Text style={styles.diagnoseBtnText}>智能诊断</Text>
          </TouchableOpacity>
        </View>

        {/* Today Progress Card */}
        {summary && (
          <View style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.progressCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>今日学习</Text>
                  <Text style={styles.progressSubtext}>
                    已完成 {summary.completed}/{summary.total} 项任务
                  </Text>
                  <Text style={styles.progressSubtext}>
                    已学习 {summary.completedDuration}/{summary.totalDuration} 分钟
                  </Text>
                </View>
                <View style={styles.progressRing}>
                  <Text style={styles.progressPercent}>{summary.progress}%</Text>
                  <Text style={styles.progressLabel}>完成度</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${summary.progress}%` as any },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日任务</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        {tasks.map((task) => (
          <View key={task.id} style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.taskCard}>
                <View style={[styles.taskIconContainer, {
                  backgroundColor: `${subjectColors[task.subject] || '#6C63FF'}20`,
                }]}>
                  <FontAwesome6
                    name={task.type === 'video' ? 'play-circle' : task.type === 'exercise' ? 'pencil' : 'pencil-alt'}
                    size={22}
                    color={subjectColors[task.subject] || '#6C63FF'}
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.taskMeta}>
                    {task.subjectName} · {task.duration}分钟
                  </Text>
                  <View style={styles.miniProgressBg}>
                    <View
                      style={[
                        styles.miniProgressFill,
                        {
                          width: `${task.progress}%` as any,
                          backgroundColor: subjectColors[task.subject] || '#6C63FF',
                        },
                      ]}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    task.completed && styles.completeBtnDone,
                    !task.completed && styles.goBtn,
                  ]}
                  onPress={() => !task.completed && handleCompleteTask(task.id)}
                  disabled={task.completed}
                >
                  {task.completed ? (
                    <FontAwesome6 name="circle-check" size={28} color="#00B894" />
                  ) : (
                    <View style={styles.goBtnContent}>
                      <Text style={styles.goBtnText}>去完成</Text>
                      <FontAwesome6 name="chevron-right" size={12} color="#6C63FF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Quick Actions - Camera */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>拍照搜题</Text>
        </View>
        <TouchableOpacity
          style={styles.cameraCard}
          onPress={() => router.push('/question-search')}
        >
          <View style={styles.cameraCardLeft}>
            <LinearGradient
              colors={['#FF6584', '#FF8FA3']}
              style={styles.cameraIconBg}
            >
              <FontAwesome6 name="camera" size={28} color="#FFF" />
            </LinearGradient>
          </View>
          <View style={styles.cameraCardRight}>
            <Text style={styles.cameraCardTitle}>拍照识别题目</Text>
            <Text style={styles.cameraCardDesc}>
              自动识别并搜索答案
            </Text>
          </View>
          <FontAwesome6 name="arrow-right" size={18} color="#B2BEC3" />
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginTop: 2,
  },
  diagnoseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.10)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  diagnoseBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
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
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSubtext: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  progressRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(108,99,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C63FF',
  },
  progressLabel: {
    fontSize: 10,
    color: '#636E72',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E8E8EB',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    width: (width - 48 - 32) / 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 14,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  taskMeta: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: '#E8E8EB',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  completeBtn: {
    marginLeft: 8,
  },
  completeBtnDone: {},
  goBtn: {
    backgroundColor: '#6C63FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },

  cameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  cameraCardLeft: {
    marginRight: 16,
  },
  cameraIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6584',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cameraCardRight: {
    flex: 1,
  },
  cameraCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  cameraCardDesc: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 2,
  },
  searchCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6584',
  },
  recentScrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 240,
  },
  recentChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentChipSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
  },
  recentChipContent: {
    fontSize: 12,
    color: '#2D3436',
    flex: 1,
  },
});