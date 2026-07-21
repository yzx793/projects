import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
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
  const { recentSearches, dailyStats } = useSearch();
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [currentView, setCurrentView] = useState<'search' | 'bank'>('search');

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  // 获取今天的搜索记录（只显示最近5条）
  const todaySearches = recentSearches.filter(item => item.date === dateStr);
  const displaySearches = todaySearches.slice(0, 5);

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FFF8F0">
      <View style={[styles.container, { paddingTop: insets.top }]}>

        <View style={styles.topHeader}>
  <TouchableOpacity
    onPress={() => router.back()}
    style={styles.backButton}
    activeOpacity={0.7}
  >
    <FontAwesome6 name="arrow-left" size={20} color="#2D3436" />
  </TouchableOpacity>
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
          {currentView === 'search' ? (
            <>
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
                <Text style={styles.historyCount}>（今日{todaySearches.length}次）</Text>
              </View>
              {todaySearches.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setCurrentView('bank');
                  setActiveTab('bank');
                }}>
                  <Text style={styles.historyViewAll}>查看全部 →</Text>
                </TouchableOpacity>
              )}
            </View>

            {todaySearches.length === 0 ? (
              <View style={styles.emptyHistory}>
                <FontAwesome6 name="magnifying-glass" size={32} color="#DFE6E9" />
                <Text style={styles.emptyHistoryText}>还没有搜过题目哦</Text>
                <Text style={styles.emptyHistorySubtext}>点击上方「拍题搜题」开始吧</Text>
              </View>
            ) : (
              displaySearches.map((item) => (
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
            </>
          ) : (
            <QuestionBankContent recentSearches={recentSearches} dailyStats={dailyStats} />
          )}
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
if (tab.key === 'home') {
  setCurrentView('search');
  setActiveTab('home');
} else if (tab.key === 'search') {
  router.push('/camera');
} else if (tab.key === 'bank') {
  setCurrentView('bank');
} else if (tab.key === 'profile') {
  router.push('/profile');
}

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
  backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#F0F0F3',
  alignItems: 'center',
  justifyContent: 'center',
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
  historyCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#636E72',
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

function QuestionBankContent({ recentSearches, dailyStats }: { recentSearches: any[], dailyStats: any }) {
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorite' | 'wrong'>('all');
  const [searchText, setSearchText] = useState('');

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  const filteredBySubject = useMemo(() => {
    if (activeSubject === 'all') return recentSearches;
    return recentSearches.filter(item => item.subject === activeSubject);
  }, [recentSearches, activeSubject]);

  const filteredByFilter = useMemo(() => {
    if (activeFilter === 'all') return filteredBySubject;
    if (activeFilter === 'favorite') return filteredBySubject.filter(item => item.isFavorite);
    if (activeFilter === 'wrong') return filteredBySubject.filter(item => item.isWrong);
    return filteredBySubject;
  }, [filteredBySubject, activeFilter]);

  const finalFiltered = useMemo(() => {
    if (!searchText.trim()) return filteredByFilter;
    return filteredByFilter.filter(item =>
      item.content.toLowerCase().includes(searchText.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [filteredByFilter, searchText]);

  const todaySearches = finalFiltered.filter((item: any) => item.date === dateStr);
  const historySearches = finalFiltered.filter((item: any) => item.date !== dateStr);

  const favoriteCount = recentSearches.filter((item: any) => item.isFavorite).length;
  const wrongCount = recentSearches.filter((item: any) => item.isWrong).length;

  return (
    <>
      <View style={bankStyles.header}>
        <Text style={bankStyles.title}>我的题库</Text>
        <Text style={bankStyles.subtitle}>
          今日搜题: {dailyStats.searchCount}次 | 剩余: {dailyStats.remainingSearches}次
        </Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={bankStyles.subjectScroll}>
          {subjectFilterOptions.map(subject => (
            <TouchableOpacity
              key={subject.id}
              onPress={() => setActiveSubject(subject.id)}
              style={[
                bankStyles.subjectChip,
                activeSubject === subject.id && bankStyles.subjectChipActive,
              ]}
            >
              <Text style={[
                bankStyles.subjectChipText,
              activeSubject === subject.id && bankStyles.subjectChipTextActive,
            ]}>
              {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      <View style={bankStyles.filterRow}>
        <View style={{ flexDirection: 'row' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={bankStyles.filterContainer}>
            <TouchableOpacity
              onPress={() => setActiveFilter('all')}
              style={[bankStyles.filterChip, activeFilter === 'all' && bankStyles.filterChipActive]}
            >
              <FontAwesome6 name="layer-group" size={12} color={activeFilter === 'all' ? '#FFF' : '#636E72'} />
              <Text style={[bankStyles.filterChipText, activeFilter === 'all' && bankStyles.filterChipTextActive]}>
                全部 ({finalFiltered.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveFilter('favorite')}
              style={[bankStyles.filterChip, activeFilter === 'favorite' && bankStyles.filterChipActive]}
            >
              <FontAwesome6 name="star" size={12} color={activeFilter === 'favorite' ? '#FFF' : '#FFA502'} />
              <Text style={[bankStyles.filterChipText, activeFilter === 'favorite' && bankStyles.filterChipTextActive]}>
                收藏 ({favoriteCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveFilter('wrong')}
              style={[bankStyles.filterChip, activeFilter === 'wrong' && bankStyles.filterChipActive]}
            >
              <FontAwesome6 name="xmark" size={12} color={activeFilter === 'wrong' ? '#FFF' : '#FF4757'} />
              <Text style={[bankStyles.filterChipText, activeFilter === 'wrong' && bankStyles.filterChipTextActive]}>
                错题 ({wrongCount})
              </Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
        <TouchableOpacity style={bankStyles.exportBtn}>
          <FontAwesome6 name="download" size={14} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <View style={bankStyles.searchBar}>
        <FontAwesome6 name="magnifying-glass" size={16} color="#B2BEC3" />
        <TextInput
          style={bankStyles.searchInput}
          placeholder="搜索题目..."
          placeholderTextColor="#B2BEC3"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {finalFiltered.length === 0 ? (
        <View style={bankStyles.emptyState}>
          <FontAwesome6 name="folder-open" size={60} color="#DFE6E9" />
          <Text style={bankStyles.emptyTitle}>暂无题目</Text>
          <Text style={bankStyles.emptySubtitle}>快去拍照搜题吧！</Text>
        </View>
      ) : (
        <View>
          {todaySearches.length > 0 && (
            <View>
              <Text style={bankStyles.sectionTitle}>今日搜题（{todaySearches.length}）</Text>
              {todaySearches.map((item: any) => (
                <View key={item.id} style={bankStyles.questionCard}>
                  <View style={bankStyles.questionHeader}>
                    <View style={[bankStyles.questionBadge, { backgroundColor: item.subjectColor + '20' }]}>
                      <Text style={[bankStyles.questionSubject, { color: item.subjectColor }]}>{item.subject}</Text>
                    </View>
                    <Text style={bankStyles.questionDate}>{item.date}</Text>
                  </View>
                  <Text style={bankStyles.questionContent}>{item.content}</Text>
                  <Text style={bankStyles.questionAnswer}>答案：{item.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {historySearches.length > 0 && (
            <View>
              <Text style={bankStyles.sectionTitle}>历史搜题</Text>
              {historySearches.map((item: any) => (
                <View key={item.id} style={bankStyles.questionCard}>
                  <View style={bankStyles.questionHeader}>
                    <View style={[bankStyles.questionBadge, { backgroundColor: item.subjectColor + '20' }]}>
                      <Text style={[bankStyles.questionSubject, { color: item.subjectColor }]}>{item.subject}</Text>
                    </View>
                    <Text style={bankStyles.questionDate}>{item.date}</Text>
                  </View>
                  <Text style={bankStyles.questionContent}>{item.content}</Text>
                  <Text style={bankStyles.questionAnswer}>答案：{item.answer}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );
}

const subjectFilterOptions = [
  { id: 'all', name: '全部' },
  { id: '数学', name: '数学' },
  { id: '语文', name: '语文' },
  { id: '英语', name: '英语' },
  { id: '物理', name: '物理' },
  { id: '化学', name: '化学' },
];

const bankStyles = StyleSheet.create({
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  subjectScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F0F0F3',
    marginRight: 10,
  },
  subjectChipActive: {
    backgroundColor: '#6C63FF',
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
    marginRight: 10,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#FF6584',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636E72',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636E72',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B2BEC3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  questionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F3',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionDate: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  questionContent: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3436',
    lineHeight: 22,
    marginBottom: 8,
  },
  questionAnswer: {
    fontSize: 13,
    color: '#00B894',
    lineHeight: 20,
  },
});