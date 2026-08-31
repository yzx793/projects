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
    // Mock data for now
    const mockStudents: Student[] = [
      {
        id: 1,
        username: '小明',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xiaoming',
        level: 8,
        exp: 2400,
        accuracy: 85,
        streak: 12,
        rank: 1,
        grade: '五年级',
      },
      {
        id: 2,
        username: '小红',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xiaohong',
        level: 7,
        exp: 2100,
        accuracy: 78,
        streak: 8,
        rank: 2,
        grade: '五年级',
      },
      {
        id: 3,
        username: '小刚',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xiaogang',
        level: 6,
        exp: 1800,
        accuracy: 72,
        streak: 5,
        rank: 3,
        grade: '五年级',
      },
      {
        id: 4,
        username: '小丽',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xiaoli',
        level: 5,
        exp: 1500,
        accuracy: 68,
        streak: 3,
        rank: 4,
        grade: '五年级',
      },
      {
        id: 5,
        username: '小强',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xiaoqiang',
        level: 4,
        exp: 1200,
        accuracy: 65,
        streak: 2,
        rank: 5,
        grade: '五年级',
      },
    ];
    setStudents(mockStudents);
    setLoading(false);
  }, []);

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
            <Text style={styles.statValue}>76%</Text>
            <Text style={styles.statLabel}>平均正确率</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>平均连续天数</Text>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>学生列表</Text>
          {students.map((student) => (
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
          ))}
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