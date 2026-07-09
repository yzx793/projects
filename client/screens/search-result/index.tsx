// d:\Download\project_20260706_203050\projects\client\screens\search-result\index.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface StoryScene {
  emoji: string;
  narration: string;
  bgColor: string;
}

interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  translation: string[];
  explanation: string;
  tags: string[];
  storyScenes?: StoryScene[];
}

interface EnglishWord {
  id: number;
  word: string;
  phonetic: string;
  translation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation?: string;
  storyScenes?: StoryScene[];
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

function FriendlyLoading() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createDotAnim = (dot: Animated.Value, delay: number) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]);
      Animated.loop(
        Animated.sequence([
          createDotAnim(dot1, 0),
          createDotAnim(dot2, 0),
          createDotAnim(dot3, 0),
          Animated.delay(300),
        ])
      ).start();
    };

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    animateDots();
    rotateLoop.start();

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={friendlyStyles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <FontAwesome6 name="magnifying-glass" size={48} color="#6C63FF" />
      </Animated.View>
      <View style={friendlyStyles.textRow}>
        <Text style={friendlyStyles.text}>正在搜索</Text>
        <Animated.View style={{ transform: [{ translateY: dot1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
          <Text style={friendlyStyles.dot}>.</Text>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: dot2.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
          <Text style={friendlyStyles.dot}>.</Text>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: dot3.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
          <Text style={friendlyStyles.dot}>.</Text>
        </Animated.View>
      </View>
      <Text style={friendlyStyles.subtext}>AI正在为你查找并生成动漫讲解</Text>
    </View>
  );
}

function StoryPlayer({ scenes, type }: { scenes: StoryScene[]; type: 'poem' | 'word' }) {
  const [currentScene, setCurrentScene] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emojiScale = useRef(new Animated.Value(0.5)).current;
  const narrationOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPaused = useRef(false);

  const playScene = useCallback((index: number) => {
    fadeAnim.setValue(0);
    emojiScale.setValue(0.3);
    narrationOpacity.setValue(0);
    progressAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(emojiScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(narrationOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: 3500, useNativeDriver: false }),
    ]).start();

    timerRef.current = setTimeout(() => {
      if (!isPaused.current && index < scenes.length - 1) {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setCurrentScene(index + 1);
        });
      }
    }, 3800);
  }, [scenes, fadeAnim, emojiScale, narrationOpacity, progressAnim]);

  useEffect(() => {
    playScene(currentScene);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!scenes || scenes.length === 0) return null;

  const scene = scenes[currentScene] || scenes[0];
  const accentColor = type === 'poem' ? '#E17055' : '#00B894';

  return (
    <View style={[storyStyles.container, { backgroundColor: scene.bgColor || '#1a1a2e' }]}>
      <View style={storyStyles.headerRow}>
        <FontAwesome6 name={type === 'poem' ? 'book-open-reader' : 'wand-magic-sparkles'} size={14} color={accentColor} />
        <Text style={[storyStyles.headerLabel, { color: accentColor }]}>
          {type === 'poem' ? '动漫讲解' : '动漫讲解'}
        </Text>
        <Text style={storyStyles.sceneCounter}>{currentScene + 1}/{scenes.length}</Text>
      </View>

      <Animated.View style={[storyStyles.sceneContent, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ scale: emojiScale }] }}>
          <Text style={storyStyles.emoji}>{scene.emoji}</Text>
        </Animated.View>
        <Animated.View style={{ opacity: narrationOpacity }}>
          <Text style={storyStyles.narration}>{scene.narration}</Text>
        </Animated.View>
      </Animated.View>

      <View style={storyStyles.progressBarBg}>
        <Animated.View style={[storyStyles.progressBarFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>

      <View style={storyStyles.dotsRow}>
        {scenes.map((_, idx) => (
          <View
            key={idx}
            style={[storyStyles.dot, idx === currentScene && { backgroundColor: accentColor, width: 16, borderRadius: 4 }]}
          />
        ))}
      </View>

      <View style={storyStyles.controlsRow}>
        <TouchableOpacity
          onPress={() => {
            isPaused.current = !isPaused.current;
          }}
          style={storyStyles.controlBtn}
        >
          <FontAwesome6 name={isPaused.current ? 'play' : 'pause'} size={14} color="#FFF" />
        </TouchableOpacity>
        {currentScene < scenes.length - 1 && (
          <TouchableOpacity
            onPress={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setCurrentScene(prev => prev + 1);
            }}
            style={storyStyles.controlBtn}
          >
            <FontAwesome6 name="forward-step" size={14} color="#FFF" />
          </TouchableOpacity>
        )}
        {currentScene > 0 && (
          <TouchableOpacity
            onPress={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setCurrentScene(prev => prev - 1);
            }}
            style={storyStyles.controlBtn}
          >
            <FontAwesome6 name="backward-step" size={14} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const friendlyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  dot: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C63FF',
  },
  subtext: {
    fontSize: 14,
    color: '#636E72',
  },
});

const storyStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    minHeight: 260,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  sceneCounter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 'auto',
  },
  sceneContent: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  emoji: {
    fontSize: 64,
  },
  narration: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
      <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
        <FriendlyLoading />
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
                      {poem.storyScenes && poem.storyScenes.length > 0 && (
                        <StoryPlayer scenes={poem.storyScenes} type="poem" />
                      )}
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
                      {word.storyScenes && word.storyScenes.length > 0 && (
                        <StoryPlayer scenes={word.storyScenes} type="word" />
                      )}
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>释义</Text>
                        <Text style={styles.translationText}>{word.translation}</Text>
                      </View>
                      <View style={styles.section}>
                        <Text style={styles.sectionLabel}>例句</Text>
                        <Text style={styles.exampleText}>"{word.example}"</Text>
                        {word.exampleTranslation && (
                          <Text style={styles.exampleTranslationText}>{word.exampleTranslation}</Text>
                        )}
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
  exampleTranslationText: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
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