import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const { width } = Dimensions.get('window');

const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalCourses: number;
}

interface Course {
  id: number;
  title: string;
  subject: string;
  subjectName: string;
  teacher: string;
  thumbnail: string;
  duration: number;
  lessons: number;
  completedLessons: number;
  difficulty: string;
  description: string;
}

const difficultyLabels: Record<string, string> = {
  easy: '基础',
  medium: '进阶',
  hard: '挑战',
};

const difficultyColors: Record<string, string> = {
  easy: '#00B894',
  medium: '#6C63FF',
  hard: '#FF6584',
};

export default function CoursesScreen() {
  const router = useSafeRouter();
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSubject, setActiveSubject] = useState('chinese');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const subjectsRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/subjects`);
      const subjectsJson = await subjectsRes.json();
      if (subjectsJson.code === 0) {
        setSubjects(subjectsJson.data);
      }

      const subjectParam = activeSubject === 'all' ? '' : `?subject=${activeSubject}`;
      const coursesRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses${subjectParam}`);
      const coursesJson = await coursesRes.json();
      if (coursesJson.code === 0) {
        setCourses(coursesJson.data);
      }
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    } finally {
      setLoading(false);
    }
  }, [activeSubject]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleSubjectChange = (subjectId: string) => {
    setActiveSubject(subjectId);
    setSearchText('');
  };

  if (loading && courses.length === 0) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>课程中心</Text>
          <Text style={styles.pageSubtitle}>选择学科，开始学习之旅</Text>
        </View>

        {/* Subject Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectTabsContainer}
          >
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjectTab,
                  activeSubject === s.id && { backgroundColor: s.color },
                ]}
                onPress={() => handleSubjectChange(s.id)}
              >
                <FontAwesome6
                  name={s.icon as any}
                  size={16}
                  color={activeSubject === s.id ? '#FFF' : s.color}
                />
                <Text
                  style={[
                    styles.subjectTabText,
                    activeSubject === s.id && styles.subjectTabTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar for Chinese/English */}
        {(activeSubject === 'chinese' || activeSubject === 'english') && (
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <FontAwesome6 name="search" size={16} color="#B2BEC3" />
              <TextInput
                style={styles.searchInput}
                placeholder={activeSubject === 'chinese' ? '输入古诗词标题...' : '输入单词...'}
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#B2BEC3"
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={() => {
                  if (searchText.trim()) {
                    router.push('/search-result', { keyword: searchText, subject: activeSubject });
                  }
                }}
              >
                <Text style={styles.searchBtnText}>搜索</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Math Upload Button */}
        {activeSubject === 'math' && (
          <TouchableOpacity 
            style={styles.uploadBtn}
            onPress={() => router.push('/course-upload')}
          >
            <FontAwesome6 name="upload" size={20} color="#FFF" />
            <Text style={styles.uploadBtnText}>上传课程</Text>
          </TouchableOpacity>
        )}

        {/* Search Guide for Chinese/English */}
        {(activeSubject === 'chinese' || activeSubject === 'english') && (
          <View style={styles.searchGuideContainer}>
            <View style={[styles.searchGuideIcon, { backgroundColor: `${subjectColors[activeSubject]}15` }]}>
              <FontAwesome6 name="search" size={32} color={subjectColors[activeSubject]} />
            </View>
            <Text style={styles.searchGuideTitle}>
              {activeSubject === 'chinese' ? '古诗词学习' : '英语单词学习'}
            </Text>
            <Text style={styles.searchGuideDesc}>
              {activeSubject === 'chinese' 
                ? '在上方搜索框输入古诗词标题，即可查看原文、译文和赏析' 
                : '在上方搜索框输入单词，即可查看释义、例句和词形变化'}
            </Text>
            <TouchableOpacity
              style={[styles.aiChatBtn, { backgroundColor: subjectColors[activeSubject] }]}
              onPress={() => router.push('/ai-chat', { mode: activeSubject === 'chinese' ? 'chinese' : 'english' })}
            >
              <FontAwesome6 name="message-circle" size={20} color="#FFF" />
              <Text style={styles.aiChatBtnText}>
                {activeSubject === 'chinese' ? 'AI诗词对话' : 'AI英语对话'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Course List - only for Math, Physics, Chemistry and All */}
        {(activeSubject !== 'chinese' && activeSubject !== 'english') && (
          <View style={styles.courseListContainer}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                activeOpacity={0.8}
                onPress={() => router.push('/course-detail', { courseId: course.id })}
              >
                <View style={styles.shadowDark}>
                  <View style={styles.shadowLight}>
                    <View style={styles.courseCard}>
                      <Image
                        source={{ uri: course.thumbnail }}
                        style={styles.courseThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.courseInfo}>
                        <View style={styles.courseTopRow}>
                          <View
                            style={[
                              styles.difficultyTag,
                              { backgroundColor: `${difficultyColors[course.difficulty]}18` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.difficultyTagText,
                                { color: difficultyColors[course.difficulty] },
                              ]}
                            >
                              {difficultyLabels[course.difficulty]}
                            </Text>
                          </View>
                          <View style={[styles.subjectBadge, { backgroundColor: `${subjectColors[course.subject]}18` }]}>
                            <Text style={[styles.subjectBadgeText, { color: subjectColors[course.subject] }]}>
                              {course.subjectName}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                        <Text style={styles.courseTeacher}>{course.teacher}</Text>
                        <View style={styles.courseBottomRow}>
                          <View style={styles.courseMetaItem}>
                            <FontAwesome6 name="circle-play" size={12} color="#636E72" />
                            <Text style={styles.courseMetaText}>{course.lessons} 课时</Text>
                          </View>
                          <View style={styles.courseMetaItem}>
                            <FontAwesome6 name="clock" size={12} color="#636E72" />
                            <Text style={styles.courseMetaText}>{course.duration} 分钟</Text>
                          </View>
                          <View style={styles.courseMetaItem}>
                            <FontAwesome6 name="circle-check" size={12} color="#00B894" />
                            <Text style={styles.courseMetaText}>{course.completedLessons}/{course.lessons}</Text>
                          </View>
                        </View>
                        <View style={styles.courseProgressBg}>
                          <View
                            style={[
                              styles.courseProgressFill,
                              {
                                width: `${(course.completedLessons / course.lessons) * 100}%` as any,
                                backgroundColor: subjectColors[course.subject],
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {courses.length === 0 && (
              <View style={styles.emptyCourseList}>
                <FontAwesome6 name="book-open" size={48} color="#B2BEC3" />
                <Text style={styles.emptyCourseText}>暂无课程</Text>
                <Text style={styles.emptyCourseSubtext}>{activeSubject === 'math' ? '请先上传课程' : '敬请期待'}</Text>
              </View>
            )}
          </View>
        )}
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
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  subjectTabsScroll: {
    marginBottom: 8,
  },
  subjectTabsContainer: {
    paddingHorizontal: 24,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
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
  courseListContainer: {
    paddingHorizontal: 24,
  },
  shadowDark: {
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    borderRadius: 24,
    marginBottom: 16,
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
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  courseCard: {
    flexDirection: 'row',
  },
  courseThumbnail: {
    width: 120,
    height: 140,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  courseInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  courseTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  difficultyTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  subjectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  courseTeacher: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  courseBottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseMetaText: {
    fontSize: 10,
    color: '#636E72',
  },
  courseProgressBg: {
    height: 3,
    backgroundColor: '#E8E8EB',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: 3,
    borderRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3436',
  },
  searchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 9999,
  },
  searchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  // Search Guide Styles
  searchGuideContainer: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchGuideIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchGuideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  searchGuideDesc: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 22,
  },
  aiChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  aiChatBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  // Empty State Styles
  emptyCourseList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyCourseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  emptyCourseSubtext: {
    fontSize: 13,
    color: '#B2BEC3',
  },
});