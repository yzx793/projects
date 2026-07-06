// d:\Download\project_20260706_203050\projects\client\screens\search-result\index.tsx
import React, { useState, useCallback } from 'react';
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
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  translation: string[];
  explanation: string;
  tags: string[];
}

interface EnglishWord {
  id: number;
  word: string;
  phonetic: string;
  translation: string;
  partOfSpeech: string;
  example: string;
  conjugation?: {
    verb?: {
      present: string;
      past: string;
      pastParticiple: string;
      ing: string;
    };
    adjective?: {
      comparative: string;
      superlative: string;
    };
  };
  explanation: string;
}

export default function SearchResultScreen() {
  const router = useSafeRouter();
  const { keyword, subject } = useSafeSearchParams<{ keyword: string; subject: string }>();
  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchResults = useCallback(async () => {
    if (!keyword || !subject) return;

    try {
      let url = '';
      if (subject === 'chinese') {
        url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/poem?keyword=${encodeURIComponent(keyword)}`;
      } else if (subject === 'english') {
        url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/word?keyword=${encodeURIComponent(keyword)}`;
      }

      if (url) {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code === 0) {
          if (subject === 'chinese') {
            setPoems(json.data);
          } else {
            setWords(json.data);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, subject]);

  useFocusEffect(
    useCallback(() => {
      fetchResults();
    }, [fetchResults])
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>正在搜索...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome6 name="arrow-left" size={20} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>搜索结果</Text>
          <View style={styles.placeholderBtn} />
        </View>

        {/* Results Summary */}
        <View style={styles.summaryCard}>
          <FontAwesome6 name="magnifying-glass" size={20} color="#6C63FF" />
          <Text style={styles.summaryText}>
            找到 {subject === 'chinese' ? poems.length : words.length} 个相关结果
          </Text>
        </View>

        {/* Chinese Poem Results */}
        {subject === 'chinese' && poems.map((poem) => {
          const isExpanded = expandedId === poem.id;
          return (
            <View key={poem.id} style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : poem.id)}
                  >
                    <View style={styles.chineseBadge}>
                      <Text style={styles.chineseBadgeText}>诗词</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{poem.title}</Text>
                      <Text style={styles.cardAuthor}>{poem.dynasty} · {poem.author}</Text>
                    </View>
                    <FontAwesome6
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#B2BEC3"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.poemContent}>
                        {poem.content.map((line, idx) => (
                          <Text key={idx} style={styles.poemLine}>{line}</Text>
                        ))}
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>译文</Text>
                        <View style={styles.translationContent}>
                          {poem.translation.map((line, idx) => (
                            <Text key={idx} style={styles.translationLine}>{line}</Text>
                          ))}
                        </View>
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>赏析</Text>
                        <Text style={styles.explanationText}>{poem.explanation}</Text>
                      </View>
                      <View style={styles.tagsRow}>
                        {poem.tags.map((tag, idx) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* English Word Results */}
        {subject === 'english' && words.map((word) => {
          const isExpanded = expandedId === word.id;
          return (
            <View key={word.id} style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : word.id)}
                  >
                    <View style={styles.englishBadge}>
                      <Text style={styles.englishBadgeText}>单词</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.wordTitle}>{word.word}</Text>
                      <Text style={styles.wordPhonetic}>{word.phonetic} · {word.partOfSpeech}</Text>
                    </View>
                    <FontAwesome6
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#B2BEC3"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>释义</Text>
                        <Text style={styles.translationText}>{word.translation}</Text>
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>例句</Text>
                        <Text style={styles.exampleText}>"{word.example}"</Text>
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>讲解</Text>
                        <Text style={styles.explanationText}>{word.explanation}</Text>
                      </View>
                      {word.conjugation && (
                        <View style={styles.section}>
                          <Text style={styles.sectionLabel}>词形变化</Text>
                          <View style={styles.conjugationRow}>
                            {word.conjugation.verb && (
                              <View style={styles.conjugationGroup}>
                                <Text style={styles.conjugationLabel}>动词</Text>
                                <Text style={styles.conjugationText}>
                                  现在时: {word.conjugation.verb.present}
                                </Text>
                                <Text style={styles.conjugationText}>
                                  过去时: {word.conjugation.verb.past}
                                </Text>
                                <Text style={styles.conjugationText}>
                                  过去分词: {word.conjugation.verb.pastParticiple}
                                </Text>
                                <Text style={styles.conjugationText}>
                                  进行时: {word.conjugation.verb.ing}
                                </Text>
                              </View>
                            )}
                            {word.conjugation.adjective && (
                              <View style={styles.conjugationGroup}>
                                <Text style={styles.conjugationLabel}>形容词</Text>
                                <Text style={styles.conjugationText}>
                                  比较级: {word.conjugation.adjective.comparative}
                                </Text>
                                <Text style={styles.conjugationText}>
                                  最高级: {word.conjugation.adjective.superlative}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {(!poems.length && subject === 'chinese') || (!words.length && subject === 'english') ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="search" size={48} color="#B2BEC3" />
            <Text style={styles.emptyText}>未找到相关{subject === 'chinese' ? '诗词' : '单词'}</Text>
            <Text style={styles.emptySubtext}>请尝试其他关键词</Text>
          </View>
        ) : null}
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
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#636E72',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 16,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C63FF',
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
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chineseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(225,112,85,0.1)',
  },
  chineseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E17055',
  },
  englishBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,184,148,0.1)',
  },
  englishBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B894',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  cardAuthor: {
    fontSize: 13,
    color: '#636E72',
  },
  wordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  wordPhonetic: {
    fontSize: 13,
    color: '#636E72',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    gap: 16,
  },
  poemContent: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(225,112,85,0.05)',
    borderRadius: 12,
  },
  poemLine: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 32,
    fontFamily: 'serif',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  translationContent: {
    gap: 8,
  },
  translationLine: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  translationText: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
  },
  exampleText: {
    fontSize: 14,
    color: '#636E72',
    fontStyle: 'italic',
  },
  explanationText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
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
  conjugationRow: {
    gap: 16,
  },
  conjugationGroup: {
    gap: 4,
  },
  conjugationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
  },
  conjugationText: {
    fontSize: 13,
    color: '#636E72',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#B2BEC3',
  },
});