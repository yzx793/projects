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
import { useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const subjectColors: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

const difficultyLabels: Record<string, string> = {
  easy: '基础',
  medium: '进阶',
  hard: '挑战',
};

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

export default function CourseDetailScreen() {
  const { courseId } = useSafeSearchParams<{ courseId: number }>();
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchCourse = async () => {
        try {
          /**
           * 服务端文件：server/src/routes/courses.ts
           * 接口：GET /api/v1/courses/:id
           * Path 参数: id: number
           */
          const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/courses/${courseId}`);
          const json = await res.json();
          if (json.code === 0) setCourse(json.data);
        } catch (e) {
          console.error('Failed to fetch course:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }, [courseId])
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

  if (!course) return null;

  const progress = Math.round((course.completedLessons / course.lessons) * 100);
  const color = subjectColors[course.subject] || '#6C63FF';

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroOverlay}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + 12 }]}>
            <View style={[styles.subjectTag, { backgroundColor: `${color}CC` }]}>
              <Text style={styles.subjectTagText}>{course.subjectName}</Text>
            </View>
            <Text style={styles.heroTitle}>{course.title}</Text>
            <Text style={styles.heroTeacher}>{course.teacher}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <FontAwesome6 name="circle-play" size={18} color={color} />
            <Text style={styles.infoValue}>{course.lessons}</Text>
            <Text style={styles.infoLabel}>总课时</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <FontAwesome6 name="clock" size={18} color={color} />
            <Text style={styles.infoValue}>{course.duration}</Text>
            <Text style={styles.infoLabel}>分钟</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <FontAwesome6 name="signal" size={18} color={color} />
            <Text style={styles.infoValue}>{difficultyLabels[course.difficulty]}</Text>
            <Text style={styles.infoLabel}>难度</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <FontAwesome6 name="circle-check" size={18} color="#00B894" />
            <Text style={styles.infoValue}>{progress}%</Text>
            <Text style={styles.infoLabel}>进度</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.shadowDark}>
          <View style={styles.shadowLight}>
            <Text style={styles.sectionTitle}>课程简介</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>
        </View>

        {/* Lesson List (Mock) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>课程目录</Text>
          <Text style={styles.sectionSubtext}>{course.completedLessons}/{course.lessons} 已完成</Text>
        </View>
        {Array.from({ length: course.lessons }, (_, i) => {
          const isCompleted = i < course.completedLessons;
          const isCurrent = i === course.completedLessons;
          return (
            <TouchableOpacity key={i} style={styles.shadowDark} activeOpacity={0.8}>
              <View style={styles.shadowLight}>
                <View style={styles.lessonItem}>
                  <View style={[
                    styles.lessonNumber,
                    isCompleted && { backgroundColor: '#00B894' },
                    isCurrent && { backgroundColor: color },
                  ]}>
                    <Text style={[
                      styles.lessonNumberText,
                      (isCompleted || isCurrent) && { color: '#FFF' },
                    ]}>
                      {isCompleted ? (
                        <FontAwesome6 name="check" size={12} color="#FFF" />
                      ) : (
                        i + 1
                      )}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[
                      styles.lessonTitle,
                      isCompleted && { color: '#B2BEC3' },
                    ]}>
                      第{i + 1}课：{course.title}（{i + 1}）
                    </Text>
                    <Text style={styles.lessonDuration}>
                      {Math.round(course.duration / course.lessons)} 分钟
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={[styles.continueBtn, { backgroundColor: color }]}>
                      <Text style={styles.continueBtnText}>继续</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Start Button */}
        <View style={styles.startBtnContainer}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={[color, `${color}CC`]}
              style={styles.startBtn}
            >
              <FontAwesome6 name="play" size={18} color="#FFF" />
              <Text style={styles.startBtnText}>
                {course.completedLessons > 0 ? '继续学习' : '开始学习'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  heroContainer: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
  },
  subjectTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  heroTeacher: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginTop: -20,
    marginBottom: 16,
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3436',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8E8EB',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#636E72',
  },
  lessonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  lessonDuration: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  continueBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  continueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  startBtnContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 9999,
    paddingVertical: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
