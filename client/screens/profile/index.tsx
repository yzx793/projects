import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const { width } = Dimensions.get('window');

interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  grade: string;
  school: string;
  streak: number;
  totalStudyHours: number;
  level: number;
  exp: number;
  nextLevelExp: number;
}

interface LearningStats {
  todayStudyMinutes: number;
  todayTargetMinutes: number;
  weeklyStudyHours: number[];
  weeklyDays: string[];
  accuracyRate: number;
  totalQuestions: number;
  correctQuestions: number;
  streakDays: number;
  rankInClass: number;
  totalClassStudents: number;
  subjectStats: Array<{
    subject: string;
    accuracy: number;
    trend: string;
  }>;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleRoleSwitch = (value: boolean) => {
    setIsTeacher(value);
    if (value) {
      router.replace('/(teacher)/vocab-books');
    } else {
      router.replace('/(tabs)');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        try {
          /**
           * 服务端文件：server/src/routes/user.ts
           * 接口：GET /api/v1/user/profile
           */
          const profileRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/user/profile`);
          const profileJson = await profileRes.json();
          if (profileJson.code === 0) setProfile(profileJson.data);

          /**
           * 服务端文件：server/src/routes/user.ts
           * 接口：GET /api/v1/user/stats
           */
          const statsRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/user/stats`);
          const statsJson = await statsRes.json();
          if (statsJson.code === 0) setStats(statsJson.data);

          /**
           * 服务端文件：server/src/routes/user.ts
           * 接口：GET /api/v1/user/badges
           */
          const badgesRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/user/badges`);
          const badgesJson = await badgesRes.json();
          if (badgesJson.code === 0) setBadges(badgesJson.data);
        } catch (e) {
          console.error('Failed to fetch profile data:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }, [])
  );

  if (loading) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  if (!profile || !stats) return null;

  const maxWeeklyHours = Math.max(...stats.weeklyStudyHours);
  const expProgress = Math.round((profile.exp / profile.nextLevelExp) * 100);

  const trendIcons: Record<string, { icon: string; color: string; label: string }> = {
    up: { icon: 'arrow-trend-up', color: '#00B894', label: '↑' },
    down: { icon: 'arrow-trend-down', color: '#FF6584', label: '↓' },
    stable: { icon: 'minus', color: '#636E72', label: '→' },
  };

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileSchool}>
                {profile.school} · {profile.grade}
              </Text>
              <View style={styles.levelBadge}>
                <LinearGradient
                  colors={['#6C63FF', '#896BFF']}
                  style={styles.levelGradient}
                >
                  <Text style={styles.levelText}>Lv.{profile.level}</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
          {/* EXP Progress */}
          <View style={styles.expContainer}>
            <View style={styles.expBarBg}>
              <View style={[styles.expBarFill, { width: `${expProgress}%` as any }]} />
            </View>
            <Text style={styles.expText}>
              {profile.exp}/{profile.nextLevelExp} EXP
            </Text>
          </View>
        </View>

        {/* Role Switcher */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={styles.roleSwitcher}>
              <View style={styles.roleInfo}>
                <FontAwesome6 name="user-graduate" size={20} color="#6C63FF" />
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleTitle}>当前身份</Text>
                  <Text style={styles.roleSubtitle}>
                    {isTeacher ? '教师端' : '学生端'}
                  </Text>
                </View>
              </View>
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, !isTeacher && styles.switchLabelActive]}>学生</Text>
                <Switch
                  value={isTeacher}
                  onValueChange={handleRoleSwitch}
                  trackColor={{ false: '#E8E8EB', true: '#6C63FF' }}
                  thumbColor={isTeacher ? '#FFF' : '#FFF'}
                />
                <Text style={[styles.switchLabel, isTeacher && styles.switchLabelActive]}>教师</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Row - Compact */}
        <View style={styles.shadowDark}>
          <View style={[styles.shadowLight, styles.statsRowContainer]}>
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowValue}>{stats.accuracyRate}%</Text>
              <Text style={styles.statsRowLabel}>正确率</Text>
            </View>
            <View style={styles.statsRowDivider} />
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowValue}>{stats.streakDays}</Text>
              <Text style={styles.statsRowLabel}>连续天数</Text>
            </View>
            <View style={styles.statsRowDivider} />
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowValue}>#{stats.rankInClass}</Text>
              <Text style={styles.statsRowLabel}>班级排名</Text>
            </View>
            <View style={styles.statsRowDivider} />
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowValue}>{stats.correctQuestions}</Text>
              <Text style={styles.statsRowLabel}>答对题数</Text>
            </View>
          </View>
        </View>

        {/* Weekly Study Chart */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>本周学习</Text>
          <Text style={styles.sectionSubtext}>
            共 {stats.weeklyStudyHours.reduce((a, b) => a + b, 0).toFixed(1)} 小时
          </Text>
        </View>
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <View style={styles.chartContainer}>
              {stats.weeklyStudyHours.map((hours, index) => {
                const barHeight = maxWeeklyHours > 0 ? (hours / maxWeeklyHours) * 80 : 0;
                return (
                  <View key={index} style={styles.chartBarItem}>
                    <Text style={styles.chartBarValue}>{hours}h</Text>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max(barHeight, 4),
                          backgroundColor: hours > 3 ? '#6C63FF' : hours > 0 ? '#896BFF' : '#E8E8EB',
                        },
                      ]}
                    />
                    <Text style={styles.chartBarLabel}>{stats.weeklyDays[index]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Subject Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>学科表现</Text>
        </View>
        {stats.subjectStats.map((subject, index) => {
          const trendInfo = trendIcons[subject.trend] || trendIcons.stable;
          return (
            <View key={index} style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.subjectStatRow}>
                  <Text style={styles.subjectStatName}>{subject.subject}</Text>
                  <View style={styles.subjectStatBar}>
                    <View
                      style={[
                        styles.subjectStatBarFill,
                        { width: `${subject.accuracy}%` as any },
                      ]}
                    />
                  </View>
                  <Text style={styles.subjectStatValue}>{subject.accuracy}%</Text>
                  <View style={[styles.trendIndicator, { backgroundColor: trendInfo.color + '20' }]}>
                    <Text style={[styles.trendLabel, { color: trendInfo.color }]}>{trendInfo.label}</Text>
                    <FontAwesome6 name={trendInfo.icon as any} size={12} color={trendInfo.color} />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Badges */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>勋章墙</Text>
          <Text style={styles.sectionSubtext}>
            {badges.filter(b => b.unlocked).length}/{badges.length} 已解锁
          </Text>
        </View>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeItem,
                !badge.unlocked && styles.badgeLocked,
              ]}
            >
              <View
                style={[
                  styles.badgeIconContainer,
                  {
                    backgroundColor: badge.unlocked
                      ? `${badge.color}20`
                      : 'rgba(178,190,195,0.15)',
                  },
                ]}
              >
                <FontAwesome6
                  name={badge.icon as any}
                  size={24}
                  color={badge.unlocked ? badge.color : '#B2BEC3'}
                />
              </View>
              <Text
                style={[
                  styles.badgeName,
                  !badge.unlocked && styles.badgeNameLocked,
                ]}
                numberOfLines={1}
              >
                {badge.name}
              </Text>
              <Text
                style={styles.badgeDesc}
                numberOfLines={1}
              >
                {badge.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="right-from-bracket" size={18} color="#FF6B6B" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
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
  profileHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#6C63FF',
  },
  profileTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  profileSchool: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 2,
  },
  levelBadge: {
    marginTop: 6,
    flexDirection: 'row',
  },
  levelGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
  },
  expText: {
    fontSize: 11,
    color: '#636E72',
    fontWeight: '600',
  },
  statsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  statsRowItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRowDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E8E8EB',
  },
  statsRowValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
  },
  statsRowLabel: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 2,
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
  sectionSubtext: {
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
    marginBottom: 12,
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    fontSize: 10,
    color: '#636E72',
    marginBottom: 4,
    fontWeight: '600',
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 6,
  },
  subjectStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectStatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    width: 40,
  },
  subjectStatBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8E8EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectStatBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
  subjectStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
    width: 40,
    textAlign: 'right',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    marginLeft: 4,
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  badgeItem: {
    width: (width - 48 - 24) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8E8EB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#B2BEC3',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#636E72',
    textAlign: 'center',
    marginTop: 2,
  },
  roleSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleTextContainer: {
    gap: 2,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  roleSubtitle: {
    fontSize: 12,
    color: '#636E72',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#B2BEC3',
    fontWeight: '600',
  },
  switchLabelActive: {
    color: '#6C63FF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FF6B6B10',
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});