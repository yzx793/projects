import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearch } from '@/contexts/SearchContext';

const { width } = Dimensions.get('window');

type BottomTab = 'home' | 'search' | 'bank' | 'profile';

export default function QuestionSearchScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { dailyStats, recentSearches } = useSearch();
  const [activeTab, setActiveTab] = useState<BottomTab>('home');

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FFF8F0">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topHeader}>
          <Text style={styles.topTitle}>学习小达人</Text>
          <View style={styles.avatarPlaceholder}>
            <FontAwesome6 name="user" size={20} color="#D4C5A9" />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dualCardsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/camera')}
            >
              <LinearGradient
                colors={['#FF7EB3', '#FF6584']}
                style={styles.dualCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.dualCardIconBgPink}>
                  <FontAwesome6 name="camera" size={28} color="#FF6584" />
                </View>
                <Text style={styles.dualCardTitle}>拍题搜题</Text>
                <Text style={styles.dualCardSubtitle}>AI拍照识别</Text>
                <View style={styles.dualCardBtnPink}>
                  <Text style={styles.dualCardBtnText}>开始搜题 →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/camera', { mode: 'calc' })}
            >
              <LinearGradient
                colors={['#74B9FF', '#0984E3']}
                style={styles.dualCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.dualCardIconBgBlue}>
                  <FontAwesome6 name="table-cells" size={28} color="#0984E3" />
                </View>
                <Text style={styles.dualCardTitle}>口算批改</Text>
                <Text style={styles.dualCardSubtitle}>拍照自动评分</Text>
                <View style={styles.dualCardBtnBlue}>
                  <Text style={styles.dualCardBtnText}>开始批改 →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderLeft}>
                <View style={styles.summaryIconBlocks}>
                  <View style={[styles.iconBlock, { backgroundColor: '#FF6584' }]} />
                  <View style={[styles.iconBlock, { backgroundColor: '#6C63FF' }]} />
                  <View style={[styles.iconBlock, { backgroundColor: '#00B894' }]} />
                </View>
                <Text style={styles.summaryTitle}>今日小结</Text>
              </View>
              <Text style={styles.summaryDate}>{dateStr}</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, dailyStats.searchCount > 0 && styles.summaryStatValueActive]}>
                  {dailyStats.searchCount}
                </Text>
                <Text style={styles.summaryStatLabel}>搜题</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, dailyStats.favoriteCount > 0 && styles.summaryStatValueActive]}>
                  {dailyStats.favoriteCount}
                </Text>
                <Text style={styles.summaryStatLabel}>收藏</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, dailyStats.wrongCount > 0 && styles.summaryStatValueActive]}>
                  {dailyStats.wrongCount}
                </Text>
                <Text style={styles.summaryStatLabel}>错题</Text>
              </View>
            </View>
            <Text style={styles.summaryFooter}>
              今日剩余搜题次数：{dailyStats.remainingSearches}次
            </Text>
          </View>

          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyHeaderLeft}>
                <FontAwesome6 name="clock" size={14} color="#636E72" />
                <Text style={styles.historyTitle}>最近搜过</Text>
              </View>
              {recentSearches.length > 0 && (
                <TouchableOpacity>
                  <Text style={styles.historyViewAll}>查看全部 →</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentSearches.length === 0 ? (
              <View style={styles.emptyHistory}>
                <FontAwesome6 name="magnifying-glass" size={32} color="#DFE6E9" />
                <Text style={styles.emptyHistoryText}>还没有搜过题目哦</Text>
                <Text style={styles.emptyHistorySubtext}>点击上方"拍题搜题"开始吧</Text>
              </View>
            ) : (
              recentSearches.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <View style={[styles.historySubjectTag, { backgroundColor: item.subjectColor }]}>
                      <Text style={styles.historySubjectText}>{item.subject}</Text>
                    </View>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyContent} numberOfLines={2}>{item.content}</Text>
                  <View style={styles.historyAnswerRow}>
                    <Text style={styles.historyAnswerLabel}>答案: </Text>
                    <Text style={styles.historyAnswerText} numberOfLines={1}>{item.answer}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
          {([
            { key: 'home' as BottomTab, label: '首页', icon: 'house', activeColor: '#FF6584' },
            { key: 'search' as BottomTab, label: '搜题', icon: 'camera', activeColor: '#FF6584' },
            { key: 'bank' as BottomTab, label: '题库', icon: 'book-open-reader', activeColor: '#FF6584' },
            { key: 'profile' as BottomTab, label: '我的', icon: 'user', activeColor: '#FF6584' },
          ]).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomNavItem}
              onPress={() => {
                setActiveTab(tab.key);
                if (tab.key === 'search') router.push('/camera');
                if (tab.key === 'bank') router.push('/courses');
                if (tab.key === 'profile') router.push('/profile');
              }}
            >
              <FontAwesome6
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? tab.activeColor : '#B2BEC3'}
                solid={activeTab === tab.key}
              />
              <Text style={[
                styles.bottomNavLabel,
                { color: activeTab === tab.key ? tab.activeColor : '#B2BEC3' },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5ECD7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dualCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  dualCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  dualCardIconBgPink: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dualCardIconBgBlue: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dualCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dualCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  dualCardBtnPink: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dualCardBtnBlue: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dualCardBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIconBlocks: {
    flexDirection: 'row',
    gap: 3,
  },
  iconBlock: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  summaryDate: {
    fontSize: 13,
    color: '#B2BEC3',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  summaryStatValueActive: {
    color: '#6C63FF',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  summaryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F0F0F0',
  },
  summaryFooter: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'center',
  },

  historyCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  historyViewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#B2BEC3',
    fontWeight: '500',
  },
  emptyHistorySubtext: {
    fontSize: 12,
    color: '#DFE6E9',
  },
  historyItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySubjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historySubjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  historyContent: {
    fontSize: 13,
    color: '#2D3436',
    lineHeight: 20,
  },
  historyAnswerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyAnswerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B894',
  },
  historyAnswerText: {
    fontSize: 13,
    color: '#2D3436',
    lineHeight: 20,
    flex: 1,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});