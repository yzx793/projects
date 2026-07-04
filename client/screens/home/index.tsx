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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      /**
       * 服务端文件：server/src/routes/tasks.ts
       * 接口：GET /api/v1/tasks
       * Query 参数: date?: string (可选)
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/tasks`);
      const json = await res.json();
      if (json.code === 0) {
        setTasks(json.data.tasks);
        setSummary(json.data.summary);
      }
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
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
      /**
       * 服务端文件：server/src/routes/tasks.ts
       * 接口：POST /api/v1/tasks/:id/complete
       * Path 参数: id: number
       */
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
              {/* Progress Bar */}
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

        {/* Quick Stats - 4 compact items in one row */}
        <View style={styles.shadowDark}>
          <View style={[styles.shadowLight, styles.compactStatsRow]}>
            <View style={styles.compactStatItem}>
              <FontAwesome6 name="bullseye" size={16} color="#6C63FF" />
              <Text style={styles.compactStatValue}>85%</Text>
              <Text style={styles.compactStatLabel}>正确率</Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <FontAwesome6 name="fire" size={16} color="#FF6584" />
              <Text style={styles.compactStatValue}>15天</Text>
              <Text style={styles.compactStatLabel}>连续</Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <FontAwesome6 name="ranking-star" size={16} color="#00B894" />
              <Text style={styles.compactStatValue}>第3</Text>
              <Text style={styles.compactStatLabel}>排名</Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <FontAwesome6 name="circle-check" size={16} color="#FDCB6E" />
              <Text style={styles.compactStatValue}>42题</Text>
              <Text style={styles.compactStatLabel}>答对</Text>
            </View>
          </View>
        </View>

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
                    name={task.type === 'video' ? 'play-circle' : 'pencil-alt'}
                    size={22}
                    color={subjectColors[task.subject] || '#6C63FF'}
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.taskMeta}>
                    {task.subjectName} · {task.duration}分钟
                  </Text>
                  {/* Mini progress bar */}
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
                    !task.completed && {
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onPress={() => !task.completed && handleCompleteTask(task.id)}
                  disabled={task.completed}
                >
                  {task.completed ? (
                    <FontAwesome6 name="circle-check" size={28} color="#00B894" />
                  ) : (
                    <View style={styles.completeBtnCircle}>
                      <FontAwesome6 name="circle-xmark" size={28} color="#B2BEC3" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷入口</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/camera')}
          >
            <LinearGradient
              colors={['#FF6584', '#FF8FA3']}
              style={styles.quickActionGradient}
            >
              <FontAwesome6 name="camera" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>拍照搜题</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/favorites')}
          >
            <LinearGradient
              colors={['#FDCB6E', '#F9A825']}
              style={styles.quickActionGradient}
            >
              <FontAwesome6 name="star" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>我的收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/courses')}
          >
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              style={styles.quickActionGradient}
            >
              <FontAwesome6 name="book-open" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>全部课程</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/wrong-questions')}
          >
            <LinearGradient
              colors={['#00B894', '#55EFC4']}
              style={styles.quickActionGradient}
            >
              <FontAwesome6 name="circle-xmark" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>错题本</Text>
          </TouchableOpacity>
        </View>
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
    // Android
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
    // Android
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
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 24,
    marginBottom: 4,
  },
  compactStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  compactStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3436',
    marginTop: 4,
  },
  compactStatLabel: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 2,
    fontWeight: '500',
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
  completeBtnCircle: {},
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 8,
  },
});
