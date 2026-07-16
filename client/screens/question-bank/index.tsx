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
import { useSearch } from '@/contexts/SearchContext';

const { width } = Dimensions.get('window');

const subjectFilterOptions = [
  { id: 'all', name: '全部' },
  { id: '数学', name: '数学' },
  { id: '语文', name: '语文' },
  { id: '英语', name: '英语' },
  { id: '物理', name: '物理' },
  { id: '化学', name: '化学' },
];

type FilterType = 'all' | 'favorite' | 'wrong';
type BottomTab = 'home' | 'search' | 'bank' | 'profile';

export default function QuestionBankScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { recentSearches, dailyStats } = useSearch();
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<BottomTab>('bank');

  const filteredQuestions = useMemo(() => {
    let filtered = [...recentSearches];

    if (activeSubject !== 'all') {
      filtered = filtered.filter(item => item.subject === activeSubject);
    }

    if (searchText.trim()) {
      filtered = filtered.filter(item =>
        item.content.toLowerCase().includes(searchText.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [recentSearches, activeSubject, searchText]);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const todayQuestions = filteredQuestions.filter(item => item.date === dateStr);

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FFF8F0">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>我的题库</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>今日搜题: {dailyStats.searchCount}次</Text>
            <Text style={styles.statsDivider}>|</Text>
            <Text style={styles.statsText}>剩余: {dailyStats.remainingSearches}次</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.subjectTabsContainer}>
            {subjectFilterOptions.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.subjectTab,
                  activeSubject === subject.id && styles.subjectTabActive,
                ]}
                onPress={() => setActiveSubject(subject.id)}
              >
                <Text
                  style={[
                    styles.subjectTabText,
                    activeSubject === subject.id && styles.subjectTabTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
              onPress={() => setActiveFilter('all')}
            >
              <FontAwesome6 name="layer-group" size={14} color={activeFilter === 'all' ? '#FF6584' : '#636E72'} />
              <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                全部 ({filteredQuestions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'favorite' && styles.filterTabActive]}
              onPress={() => setActiveFilter('favorite')}
            >
              <FontAwesome6 name="star" size={14} color={activeFilter === 'favorite' ? '#FF6584' : '#636E72'} />
              <Text style={[styles.filterTabText, activeFilter === 'favorite' && styles.filterTabTextActive]}>
                收藏 ({dailyStats.favoriteCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'wrong' && styles.filterTabActive]}
              onPress={() => setActiveFilter('wrong')}
            >
              <FontAwesome6 name="xmark" size={14} color={activeFilter === 'wrong' ? '#FF6584' : '#636E72'} />
              <Text style={[styles.filterTabText, activeFilter === 'wrong' && styles.filterTabTextActive]}>
                错题 ({dailyStats.wrongCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportBtn}>
              <FontAwesome6 name="download" size={14} color="#0984E3" />
              <Text style={styles.exportBtnText}>导出</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesome6 name="search" size={16} color="#B2BEC3" />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索题目..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#B2BEC3"
            />
          </View>

          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="folder-open" size={64} color="#DFE6E9" />
              <Text style={styles.emptyTitle}>暂无题目</Text>
              <Text style={styles.emptyDesc}>
                {searchText ? '没有找到匹配的题目' : '快去拍照搜题吧！'}
              </Text>
            </View>
          ) : (
            <>
              {todayQuestions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>今日搜题 ({todayQuestions.length})</Text>
                  {todayQuestions.map((item) => (
                    <QuestionCard key={item.id} item={item} />
                  ))}
                </View>
              )}

              {filteredQuestions.filter(q => q.date !== dateStr).length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>历史搜题</Text>
                  {filteredQuestions
                    .filter(q => q.date !== dateStr)
                    .map((item) => (
                      <QuestionCard key={item.id} item={item} />
                    ))}
                </View>
              )}
            </>
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
                if (tab.key === 'home') router.navigate('/');
                if (tab.key === 'search') router.navigate('/question-search');
                if (tab.key === 'profile') router.navigate('/profile');
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

function QuestionCard({ item }: { item: import('@/contexts/SearchContext').SearchRecord }) {
  return (
    <TouchableOpacity style={styles.questionCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.subjectTag, { backgroundColor: item.subjectColor }]}>
          <Text style={styles.subjectTagText}>{item.subject}</Text>
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <Text style={styles.questionContent} numberOfLines={3}>{item.content}</Text>

      <View style={styles.answerSection}>
        <Text style={styles.answerLabel}>答案：</Text>
        <Text style={styles.answerText} numberOfLines={2}>{item.answer}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome6 name="star" size={14} color="#FDCB6E" />
          <Text style={styles.actionBtnText}>收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome6 name="flag" size={14} color="#FF6B6B" />
          <Text style={styles.actionBtnText}>标记错题</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome6 name="share-nodes" size={14} color="#0984E3" />
          <Text style={styles.actionBtnText}>分享</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#636E72',
  },
  statsDivider: {
    color: '#DFE6E9',
  },
  subjectTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    paddingVertical: 12,
  },
  subjectTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8EB',
  },
  subjectTabActive: {
    backgroundColor: '#6C63FF',
  },
  subjectTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  subjectTabTextActive: {
    color: '#FFF',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
  },
  filterTabActive: {
    backgroundColor: '#FFE5EC',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  filterTabTextActive: {
    color: '#FF6584',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    marginLeft: 'auto',
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0984E3',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#636E72',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#B2BEC3',
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  dateText: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  questionContent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 22,
    marginBottom: 10,
  },
  answerSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B894',
  },
  answerText: {
    flex: 1,
    fontSize: 13,
    color: '#636E72',
    lineHeight: 19,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636E72',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    paddingTop: 8,
    paddingBottom: 0,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});