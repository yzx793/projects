import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface Student {
  id: number;
  username: string;
  avatar: string;
  level: number;
  exp: number;
  accuracy: number;
  streak: number;
  rank: number;
  grade: string;
}

export default function StudentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/user/students`);
        const json = await res.json();
        if (json.code === 0) {
          setStudents(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch students:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const avgAccuracy = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.accuracy, 0) / students.length)
    : 0;
  const avgStreak = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.streak, 0) / students.length)
    : 0;

  if (loading) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
        <View style={styles.loadingContainer}>
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
        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>学生总数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgAccuracy}%</Text>
            <Text style={styles.statLabel}>平均正确率</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgStreak}</Text>
            <Text style={styles.statLabel}>平均连续天数</Text>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>学生列表</Text>
          {students.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="users" size={48} color="#DFE6E9" />
              <Text style={styles.emptyText}>暂无学生数据</Text>
            </View>
          ) : (
            students.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentItem}
                onPress={() => router.push({ pathname: '/(teacher)/student-detail', params: { id: student.id } } as any)}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{student.rank}</Text>
                </View>
                <Image
                  source={{ uri: student.avatar }}
                  style={styles.studentAvatar}
                  contentFit="cover"
                />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.username}</Text>
                  <Text style={styles.studentGrade}>{student.grade} · Lv.{student.level}</Text>
                </View>
                <View style={styles.studentStats}>
                  <View style={styles.statRow}>
                    <FontAwesome6 name="bullseye" size={12} color="#6C63FF" />
                    <Text style={styles.statText}>{student.accuracy}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <FontAwesome6 name="fire" size={12} color="#FF6B6B" />
                    <Text style={styles.statText}>{student.streak}天</Text>
                  </View>
                </View>
                <FontAwesome6 name="chevron-right" size={14} color="#B2BEC3" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#B2BEC3',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8E8EB',
    marginHorizontal: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#B2BEC3',
    marginTop: 12,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  studentGrade: {
    fontSize: 12,
    color: '#B2BEC3',
    marginTop: 2,
  },
  studentStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#636E72',
  },
});