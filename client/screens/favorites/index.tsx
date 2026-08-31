import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// Subject color mapping
const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

const subjectTabs = [
  { key: 'all', label: '全部' },
  { key: 'math', label: '数学' },
  { key: 'chinese', label: '语文' },
  { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' },
];

interface Favorite {
  id: number;
  questionId: number;
  title: string;
  subject: string;
  subjectName: string;
  type: string;
  difficulty: number;
  content: string;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  favoritedAt: string;
}

export default function FavoritesScreen() {
  const router = useSafeRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      /**
       * 服务端文件：server/src/routes/favorites.ts
       * 接口：GET /api/v1/favorites
       * Query 参数: subject?: string
       */
      const subjectParam = activeTab !== 'all' ? `?subject=${activeTab}` : '';
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/favorites${subjectParam}`);
      const json = await res.json();
      if (json.code === 0) {
        setFavorites(json.data.favorites);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleRemoveFavorite = useCallback(async (favoriteId: number) => {
    Alert.alert(
      '取消收藏',
      '确定要取消收藏这道题目吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              /**
               * 服务端文件：server/src/routes/favorites.ts
               * 接口：DELETE /api/v1/favorites/:id
               * Path 参数: id: number
               */
              const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/favorites/${favoriteId}`, {
                method: 'DELETE',
              });
              const json = await res.json();
              if (json.code === 0) {
                fetchFavorites();
              }
            } catch (error) {
              console.error('Remove favorite error:', error);
              Alert.alert('错误', '操作失败，请重试');
            }
          },
        },
      ]
    );
  }, [fetchFavorites]);

  const toggleSelect = (questionId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map(f => f.questionId)));
    }
  };

  const handleExport = async (format: 'text' | 'markdown') => {
    if (selectedIds.size === 0) {
      Alert.alert('提示', '请先选择要导出的题目');
      return;
    }

    setIsExporting(true);
    try {
      const idsStr = Array.from(selectedIds).join(',');
      /**
       * 服务端文件：server/src/routes/export.ts
       * 接口：GET /api/v1/export/preview/:ids
       * Path 参数: ids: string (逗号分隔的题目ID)
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/export/preview/${idsStr}`);
      const json = await res.json();
      
      if (json.code === 0) {
        const content = format === 'markdown' ? json.data.markdown : json.data.plainText;
        const extension = format === 'markdown' ? '.md' : '.txt';
        const mimeType = format === 'markdown' ? 'text/markdown' : 'text/plain';
        
        // Save to file and share
        const fileUri = `${(FileSystem as any).cacheDirectory}questions_export${extension}`;
        await (FileSystem as any).writeAsStringAsync(fileUri, content, {
          encoding: (FileSystem as any).EncodingType.UTF8,
        });

        if (Platform.OS === 'web') {
          // For web, use Share API
          await Share.share({
            message: content,
          });
        } else {
          // For mobile, use Sharing
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType,
              dialogTitle: '导出题目',
            });
          } else {
            Alert.alert('提示', '当前设备不支持分享功能');
          }
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('错误', '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      '导出文档',
      '选择导出格式',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '纯文本 (.txt)',
          onPress: () => handleExport('text'),
        },
        {
          text: 'Markdown (.md)',
          onPress: () => handleExport('markdown'),
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的收藏</Text>
          {favorites.length > 0 && (
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds(new Set());
              }}
            >
              <Text style={styles.selectBtnText}>
                {isSelectionMode ? '取消' : '选择'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Subject Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={styles.tabsScroll}
          >
            {subjectTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.tabActive,
                ]}
                onPress={() => {
                  setActiveTab(tab.key);
                  setLoading(true);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selection Mode Actions */}
        {isSelectionMode && favorites.length > 0 && (
          <View style={styles.selectionBar}>
            <TouchableOpacity style={styles.selectAllBtn} onPress={handleSelectAll}>
              <FontAwesome6
                name={selectedIds.size === favorites.length ? 'circle-check' : 'circle'}
                size={20}
                color={selectedIds.size === favorites.length ? '#6C63FF' : '#B2BEC3'}
              />
              <Text style={styles.selectAllText}>全选</Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>
              已选 {selectedIds.size}/{favorites.length}
            </Text>
          </View>
        )}

        {/* Empty State */}
        {favorites.length === 0 && (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="star" size={48} color="#DFE6E9" />
            <Text style={styles.emptyText}>暂无收藏的题目</Text>
            <Text style={styles.emptySubtext}>在搜索结果中点击收藏按钮添加</Text>
          </View>
        )}

        {/* Favorites List */}
        {favorites.map((favorite) => {
          const color = subjectColors[favorite.subject] || '#6C63FF';
          const isSelected = selectedIds.has(favorite.questionId);

          return (
            <View key={favorite.id} style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <TouchableOpacity
                  style={styles.favoriteCard}
                  onPress={() => {
                    if (isSelectionMode) {
                      toggleSelect(favorite.questionId);
                    }
                  }}
                  onLongPress={() => {
                    if (!isSelectionMode) {
                      setIsSelectionMode(true);
                      toggleSelect(favorite.questionId);
                    }
                  }}
                >
                  <View style={styles.favoriteHeader}>
                    {isSelectionMode && (
                      <FontAwesome6
                        name={isSelected ? 'circle-check' : 'circle'}
                        size={22}
                        color={isSelected ? '#6C63FF' : '#B2BEC3'}
                        style={styles.checkbox}
                      />
                    )}
                    <View style={[styles.subjectBadge, { backgroundColor: `${color}20` }]}>
                      <Text style={[styles.subjectBadgeText, { color }]}>{favorite.subjectName}</Text>
                    </View>
                    {!isSelectionMode && (
                      <TouchableOpacity
                        onPress={() => handleRemoveFavorite(favorite.id)}
                        style={styles.removeBtn}
                      >
                        <FontAwesome6 name="trash" size={16} color="#FF6584" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.favoriteTitle} numberOfLines={2}>
                    {favorite.title}
                  </Text>

                  <View style={styles.favoriteMeta}>
                    <Text style={styles.metaText}>
                      {'★'.repeat(favorite.difficulty)}{'☆'.repeat(5 - favorite.difficulty)}
                    </Text>
                    <Text style={styles.metaText}>
                      {favorite.type === 'choice' ? '选择题' : '填空题'}
                    </Text>
                  </View>

                  {/* Preview content */}
                  <Text style={styles.previewText} numberOfLines={2}>
                    {favorite.content}
                  </Text>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {favorite.knowledgePoints.slice(0, 3).map((kp, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{kp}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Export Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <View style={styles.exportBar}>
          <TouchableOpacity
            style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
            onPress={showExportOptions}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <FontAwesome6 name="file-export" size={18} color="#FFF" />
            )}
            <Text style={styles.exportBtnText}>
              {isExporting ? '导出中...' : `导出 ${selectedIds.size} 道题`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  },
  selectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
  },
  selectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8EB',
  },
  tabActive: {
    backgroundColor: '#6C63FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636E72',
  },
  tabTextActive: {
    color: '#FFF',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 12,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
  },
  selectedCount: {
    fontSize: 14,
    color: '#636E72',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B2BEC3',
    marginTop: 8,
  },
  shadowDark: {
    shadowColor: '#B2BEC3',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  shadowLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  favoriteCard: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  checkbox: {
    marginRight: 4,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeBtn: {
    marginLeft: 'auto',
    padding: 8,
  },
  favoriteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 22,
    marginBottom: 8,
  },
  favoriteMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#636E72',
  },
  previewText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#636E72',
  },
  exportBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F0F0F3',
    borderTopWidth: 1,
    borderTopColor: '#E8E8EB',
  },
  exportBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  exportBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
