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
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface CategoryStat {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  count: number;
  route: string;
  subject?: string;
  stage?: string;
}

export default function QuestionBankScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, bySubject: [] as any[], byStage: [] as any[] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/questions`);
        const json = await res.json();
        if (json.code === 0) {
          setStats(json.data.stats);
        }
      } catch (e) {
        console.error('Failed to fetch question stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const categories: CategoryStat[] = [
    {
      icon: 'book',
      iconColor: '#0984E3',
      iconBg: '#0984E315',
      title: '词书（英语）',
      desc: '管理单词词库和难度分级',
      count: stats.bySubject?.find((s: any) => s.subject === 'english')?.count || 0,
      route: '/(teacher)/vocab-books',
    },
    {
      icon: 'scroll',
      iconColor: '#E17055',
      iconBg: '#E1705515',
      title: '古诗词（语文）',
      desc: '管理古诗词内容和赏析',
      count: stats.bySubject?.find((s: any) => s.subject === 'chinese')?.count || 0,
      route: '/(teacher)/poetry',
    },
    {
      icon: 'calculator',
      iconColor: '#00B894',
      iconBg: '#00B89415',
      title: '数学题',
      desc: '数学各类题型',
      count: stats.bySubject?.find((s: any) => s.subject === 'math')?.count || 0,
      route: '/(teacher)/math-questions',
    },
    {
      icon: 'flask',
      iconColor: '#6C5CE7',
      iconBg: '#6C5CE715',
      title: '物理/化学',
      desc: '理化生各类题目',
      count: (stats.bySubject?.find((s: any) => s.subject === 'physics')?.count || 0) +
            (stats.bySubject?.find((s: any) => s.subject === 'chemistry')?.count || 0) +
            (stats.bySubject?.find((s: any) => s.subject === 'biology')?.count || 0),
      route: '/(teacher)/science-questions',
    },
  ];

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
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>题目总数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{categories.filter(c => c.count > 0).length}</Text>
            <Text style={styles.statLabel}>活跃分类</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.byStage?.length || 0}</Text>
            <Text style={styles.statLabel}>学段</Text>
          </View>
        </View>

        {/* Category List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>题库分类</Text>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: item.iconBg }]}>
                <FontAwesome6 name={item.icon as any} size={20} color={item.iconColor} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categoryDesc}>{item.desc}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryCount}>{item.count}题</Text>
                <FontAwesome6 name="chevron-right" size={14} color="#B2BEC3" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>快捷操作</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <FontAwesome6 name="plus" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.quickActionText}>添加题目</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <FontAwesome6 name="upload" size={20} color="#00B894" />
              </View>
              <Text style={styles.quickActionText}>批量导入</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <FontAwesome6 name="file-export" size={20} color="#E17055" />
              </View>
              <Text style={styles.quickActionText}>导出题库</Text>
            </TouchableOpacity>
          </View>
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#B2BEC3',
    marginTop: 2,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
  },
});