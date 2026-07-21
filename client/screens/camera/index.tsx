import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, StatusBar, ScrollView, Animated, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { createFormDataFile } from '@/utils';
import { useSearch } from '@/contexts/SearchContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const PINK = '#FF6584';
const BLUE = '#0984E3';

const subjectColorMap: Record<string, string> = {
  math: '#6C63FF',
  chinese: '#E17055',
  english: '#00B894',
  physics: '#0984E3',
  chemistry: '#FDCB6E',
};

const subjectNameMap: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
};

type CameraMode = 'search' | 'calc';

interface SearchResultQuestion {
  id: string | number;
  subject: string;
  subjectName?: string;
  title: string;
  answer?: string;
  analysis?: string;
  steps?: string[];
  options?: string[];
}

interface CalcProblem {
  expression: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface CalcResult {
  total: number;
  correct: number;
  wrong: number;
  problems: CalcProblem[];
  score: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CalcAnalyzingView({ imageUri, insets, themeColor }: { imageUri: string; insets: { top: number; bottom: number }; themeColor: string }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    const createDotLoop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(400 - delay),
        ])
      );
    createDotLoop(dot1, 0).start();
    createDotLoop(dot2, 150).start();
    createDotLoop(dot3, 300).start();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const spin = useMemo(() => spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }), [spinAnim]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pulseScale = useMemo(() => pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }), [pulseAnim]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pulseOpacity = useMemo(() => pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }), [pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.analyzingContainer}>
        <View style={[styles.analyzingTopBar, { paddingTop: insets.top + 8 }]}>
          <View style={{ width: 40 }} />
          <Text style={styles.analyzingTopTitle}>AI正在批改</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.analyzingImageArea}>
          <Animated.View style={{ transform: [{ scale: pulseScale }], opacity: pulseOpacity }}>
            <Image source={{ uri: imageUri }} style={styles.analyzingImage} />
          </Animated.View>
        </View>
        <View style={styles.analyzingContent}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome6 name="gear" size={36} color={themeColor} />
          </Animated.View>
          <View style={styles.analyzingTextRow}>
            <Text style={styles.analyzingText}>正在批改口算</Text>
            <Animated.View style={{ transform: [{ translateY: dot1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: dot2.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: dot3.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
          </View>
          <View style={styles.analyzingSteps}>
            <View style={styles.analyzingStep}>
              <FontAwesome6 name="camera" size={14} color={themeColor} />
              <Text style={[styles.analyzingStepTextActive, { color: themeColor }]}>图片上传完成</Text>
            </View>
            <View style={styles.analyzingStepLine} />
            <View style={styles.analyzingStep}>
              <ActivityIndicator size={14} color={themeColor} />
              <Text style={[styles.analyzingStepTextActive, { color: themeColor }]}>AI识别算式中</Text>
            </View>
            <View style={styles.analyzingStepLine} />
            <View style={styles.analyzingStep}>
              <FontAwesome6 name="check-double" size={14} color="#666" />
              <Text style={styles.analyzingStepText}>批改对错</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function AnalyzingView({ imageUri, insets, themeColor }: { imageUri: string; insets: { top: number; bottom: number }; themeColor: string }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const createDotLoop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(400 - delay),
        ])
      );
    createDotLoop(dot1, 0).start();
    createDotLoop(dot2, 150).start();
    createDotLoop(dot3, 300).start();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.analyzingContainer}>
        <View style={[styles.analyzingTopBar, { paddingTop: insets.top + 8 }]}>
          <View style={{ width: 40 }} />
          <Text style={styles.analyzingTopTitle}>AI正在解题</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.analyzingImageArea}>
          <Animated.View style={{ transform: [{ scale: pulseScale }], opacity: pulseOpacity }}>
            <Image source={{ uri: imageUri }} style={styles.analyzingImage} />
          </Animated.View>
          <View style={[styles.analyzingImageBorder, { borderColor: `${themeColor}4D` }]} />
        </View>

        <View style={styles.analyzingContent}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome6 name="gear" size={36} color={themeColor} />
          </Animated.View>

          <View style={styles.analyzingTextRow}>
            <Text style={styles.analyzingText}>正在识别题目</Text>
            {/* eslint-disable-next-line react-hooks/exhaustive-deps */}
            <Animated.View style={{ transform: [{ translateY: dot1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
            {/* eslint-disable-next-line react-hooks/exhaustive-deps */}
            <Animated.View style={{ transform: [{ translateY: dot2.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
            {/* eslint-disable-next-line react-hooks/exhaustive-deps */}
            <Animated.View style={{ transform: [{ translateY: dot3.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Text style={[styles.analyzingDot, { color: themeColor }]}>.</Text>
            </Animated.View>
          </View>

          <View style={styles.analyzingSteps}>
            <View style={styles.analyzingStep}>
              <FontAwesome6 name="camera" size={14} color={themeColor} />
              <Text style={[styles.analyzingStepTextActive, { color: themeColor }]}>图片上传完成</Text>
            </View>
            <View style={styles.analyzingStepLine} />
            <View style={styles.analyzingStep}>
              <ActivityIndicator size={14} color={themeColor} />
              <Text style={[styles.analyzingStepTextActive, { color: themeColor }]}>AI识别题目中</Text>
            </View>
            <View style={styles.analyzingStepLine} />
            <View style={styles.analyzingStep}>
              <FontAwesome6 name="lightbulb" size={14} color="#666" />
              <Text style={styles.analyzingStepText}>生成答案解析</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CameraScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { addSearchRecord } = useSearch();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const initialMode: CameraMode = params.mode === 'calc' ? 'calc' : 'search';
  const [mode, setMode] = useState<CameraMode>(initialMode);
  const themeColor = mode === 'calc' ? BLUE : PINK;
  const [flashOn, setFlashOn] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultQuestion[] | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <FontAwesome6 name="camera" size={48} color="#666" />
          <Text style={styles.permissionText}>{mode === 'calc' ? '需要相机权限才能口算批改' : '需要相机权限才能拍照搜题'}</Text>
          <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: themeColor }]} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>授权相机</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryBtnAlt} onPress={handlePickImage}>
            <FontAwesome6 name="images" size={20} color={themeColor} />
            <Text style={[styles.galleryBtnAltText, { color: themeColor }]}>从相册选择</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  }

  async function handleTakePicture() {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Take picture error:', error);
    }
  }

  async function handleSearch(imageUri: string) {
    setIsProcessing(true);
    setSearchResults(null);

    try {
      const formData = new FormData();
      const file = await createFormDataFile(imageUri, 'search_photo.jpg', 'image/jpeg');
      formData.append('file', file as any);

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/photo`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (json.code === 0 && json.data.questions.length > 0) {
        const questions: SearchResultQuestion[] = json.data.questions;

        for (const q of questions) {
          addSearchRecord({
            subject: subjectNameMap[q.subject] || q.subjectName || '未知',
            subjectColor: subjectColorMap[q.subject] || '#6C63FF',
            content: q.title || '拍照搜题',
            answer: q.analysis || q.answer || '暂无答案',
          });
        }

        setSearchResults(questions);
        setActiveQuestionIdx(0);
      } else {
        alert('未找到相关题目，请尝试拍摄更清晰的图片');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('搜索失败，请稍后重试');
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCalcCheck(imageUri: string) {
    setIsProcessing(true);
    setCalcResult(null);

    try {
      const formData = new FormData();
      const file = await createFormDataFile(imageUri, 'calc_photo.jpg', 'image/jpeg');
      formData.append('file', file as any);

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/calc-check`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (json.code === 0 && json.data.problems && json.data.problems.length > 0) {
        setCalcResult(json.data as CalcResult);
      } else {
        alert('未识别到口算题，请拍摄包含口算题的图片');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('Calc check error:', error);
      alert('批改失败，请稍后重试');
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  }

  if (capturedImage && isProcessing && mode === 'calc') {
    return <CalcAnalyzingView imageUri={capturedImage} insets={insets} themeColor={themeColor} />;
  }

  if (capturedImage && isProcessing) {
    return <AnalyzingView imageUri={capturedImage} insets={insets} themeColor={themeColor} />;
  }

  if (capturedImage && !isProcessing && searchResults && searchResults.length > 0) {
    const question = searchResults[activeQuestionIdx] || searchResults[0];
    const subjectLabel = subjectNameMap[question.subject] || question.subjectName || '未知';
    const subjectColor = subjectColorMap[question.subject] || '#6C63FF';

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.resultContainer}>
          <View style={[styles.resultTopBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.resultBackBtn}
              onPress={() => {
                setCapturedImage(null);
                setSearchResults(null);
              }}
            >
              <FontAwesome6 name="xmark" size={18} color="#2D3436" />
            </TouchableOpacity>
            <Text style={styles.resultTopTitle}>搜题结果</Text>
            <TouchableOpacity
              style={[styles.resultContinueBtn, { backgroundColor: `${themeColor}1A` }]}
              onPress={() => {
                setCapturedImage(null);
                setSearchResults(null);
              }}
            >
              <FontAwesome6 name="camera" size={14} color={themeColor} />
              <Text style={[styles.resultContinueText, { color: themeColor }]}>继续搜题</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultImageCard}>
              <Image source={{ uri: capturedImage }} style={styles.resultImage} />
              <View style={styles.resultImageLabel}>
                <FontAwesome6 name="image" size={11} color="#FFF" />
                <Text style={styles.resultImageLabelText}>原题图片</Text>
              </View>
            </View>

            {searchResults.length > 1 && (
              <View style={styles.resultTabsRow}>
                {searchResults.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.resultTab,
                      idx === activeQuestionIdx && { backgroundColor: themeColor, borderColor: themeColor },
                    ]}
                    onPress={() => setActiveQuestionIdx(idx)}
                  >
                    <Text
                      style={[
                        styles.resultTabText,
                        idx === activeQuestionIdx && styles.resultTabTextActive,
                      ]}
                    >
                      题目{idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.resultQuestionCard}>
              <View style={styles.resultSubjectRow}>
                <View style={[styles.resultSubjectTag, { backgroundColor: subjectColor }]}>
                  <Text style={styles.resultSubjectTagText}>{subjectLabel}</Text>
                </View>
                <Text style={styles.resultQuestionLabel}>题目</Text>
              </View>
              <Text style={styles.resultQuestionText}>{question.title}</Text>
              {question.options && question.options.length > 0 && (
                <View style={styles.resultOptions}>
                  {question.options.map((opt, idx) => (
                    <Text key={idx} style={styles.resultOptionText}>{opt}</Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.resultAnswerCard}>
              <View style={styles.resultAnswerHeader}>
                <FontAwesome6 name="lightbulb" size={16} color={themeColor} />
                <Text style={styles.resultAnswerTitle}>答案</Text>
              </View>
              {question.answer && (
                <View style={[styles.resultAnswerBox, { borderLeftColor: themeColor, backgroundColor: `${themeColor}0F` }]}>
                  <Text style={styles.resultAnswerText}>{question.answer}</Text>
                </View>
              )}

              {question.steps && question.steps.length > 0 && (
                <View style={styles.resultStepsSection}>
                  <View style={styles.resultStepsHeader}>
                    <FontAwesome6 name="list-ol" size={14} color="#6C63FF" />
                    <Text style={styles.resultStepsTitle}>解题步骤</Text>
                  </View>
                  {question.steps.map((step, idx) => (
                    <View key={idx} style={styles.resultStepItem}>
                      <View style={styles.resultStepNum}>
                        <Text style={styles.resultStepNumText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.resultStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {question.analysis && (
                <View style={styles.resultAnalysisSection}>
                  <View style={styles.resultAnalysisHeader}>
                    <FontAwesome6 name="book-open" size={14} color="#00B894" />
                    <Text style={styles.resultAnalysisTitle}>解析</Text>
                  </View>
                  <Text style={styles.resultAnalysisText}>{question.analysis}</Text>
                </View>
              )}

              {!question.answer && !question.analysis && (!question.steps || question.steps.length === 0) && (
                <View style={styles.resultEmptyAnswer}>
                  <FontAwesome6 name="circle-exclamation" size={20} color="#B2BEC3" />
                  <Text style={styles.resultEmptyAnswerText}>暂无详细答案</Text>
                </View>
              )}
            </View>

            <View style={styles.resultActionRow}>
              <TouchableOpacity style={styles.resultActionBtn} activeOpacity={0.8}>
                <FontAwesome6 name="heart" size={16} color="#E17055" />
                <Text style={styles.resultActionBtnText}>收藏</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultActionBtn} activeOpacity={0.8}>
                <FontAwesome6 name="copy" size={16} color="#6C63FF" />
                <Text style={styles.resultActionBtnText}>复制</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultActionBtn} activeOpacity={0.8}>
                <FontAwesome6 name="share-nodes" size={16} color="#00B894" />
                <Text style={styles.resultActionBtnText}>分享</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultActionBtn} activeOpacity={0.8}>
                <FontAwesome6 name="circle-exclamation" size={16} color="#FDCB6E" />
                <Text style={styles.resultActionBtnText}>纠错</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (capturedImage && !isProcessing && calcResult && mode === 'calc') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.calcResultContainer}>
          <View style={[styles.calcResultTopBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.resultBackBtn}
              onPress={() => {
                setCapturedImage(null);
                setCalcResult(null);
              }}
            >
              <FontAwesome6 name="xmark" size={18} color="#2D3436" />
            </TouchableOpacity>
            <Text style={styles.resultTopTitle}>批改结果</Text>
            <TouchableOpacity
              style={[styles.resultContinueBtn, { backgroundColor: `${themeColor}1A` }]}
              onPress={() => {
                setCapturedImage(null);
                setCalcResult(null);
              }}
            >
              <FontAwesome6 name="camera" size={14} color={themeColor} />
              <Text style={[styles.resultContinueText, { color: themeColor }]}>继续批改</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calcScoreCard}>
            <View style={[styles.calcScoreCircle, { borderColor: themeColor }]}>
              <Text style={[styles.calcScoreNum, { color: themeColor }]}>{calcResult.score}</Text>
              <Text style={styles.calcScoreLabel}>分</Text>
            </View>
            <View style={styles.calcScoreDetail}>
              <View style={styles.calcScoreRow}>
                <FontAwesome6 name="list-ol" size={14} color="#6C63FF" />
                <Text style={styles.calcScoreText}>共 {calcResult.total} 题</Text>
              </View>
              <View style={styles.calcScoreRow}>
                <FontAwesome6 name="circle-check" size={14} color="#00B894" />
                <Text style={[styles.calcScoreText, { color: '#00B894' }]}>正确 {calcResult.correct} 题</Text>
              </View>
              <View style={styles.calcScoreRow}>
                <FontAwesome6 name="circle-xmark" size={14} color="#E17055" />
                <Text style={[styles.calcScoreText, { color: '#E17055' }]}>错误 {calcResult.wrong} 题</Text>
              </View>
            </View>
          </View>

          <View style={styles.calcImageCard}>
            <Image source={{ uri: capturedImage }} style={styles.calcResultImage} />
            <View style={styles.resultImageLabel}>
              <FontAwesome6 name="image" size={11} color="#FFF" />
              <Text style={styles.resultImageLabelText}>原图</Text>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.calcProblemList}>
              {calcResult.problems.map((problem, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.calcProblemItem,
                    problem.isCorrect ? styles.calcProblemCorrect : styles.calcProblemWrong,
                  ]}
                >
                  <View style={styles.calcProblemLeft}>
                    <View style={[
                      styles.calcProblemIdx,
                      { backgroundColor: problem.isCorrect ? 'rgba(0,184,148,0.1)' : 'rgba(225,112,85,0.1)' },
                    ]}>
                      <Text style={[
                        styles.calcProblemIdxText,
                        { color: problem.isCorrect ? '#00B894' : '#E17055' },
                      ]}>{idx + 1}</Text>
                    </View>
                  </View>
                  <View style={styles.calcProblemContent}>
                    <Text style={styles.calcProblemExpr}>{problem.expression} = {problem.userAnswer}</Text>
                    {!problem.isCorrect && (
                      <View style={styles.calcProblemCorrection}>
                        <FontAwesome6 name="arrow-right" size={11} color="#00B894" />
                        <Text style={styles.calcProblemCorrectAnswer}>正确答案：{problem.correctAnswer}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.calcProblemMark}>
                    <FontAwesome6
                      name={problem.isCorrect ? 'circle-check' : 'circle-xmark'}
                      size={22}
                      color={problem.isCorrect ? '#00B894' : '#E17055'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (capturedImage && !isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.previewContainer}>
          <View style={[styles.previewTopBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.previewBackBtn} onPress={() => setCapturedImage(null)}>
              <FontAwesome6 name="xmark" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.previewTopTitle}>{mode === 'calc' ? '确认批改图片' : '确认搜题图片'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.previewImageArea}>
            <Image source={{ uri: capturedImage }} style={styles.previewFullImage} />
            <View style={styles.previewImageHint}>
              <FontAwesome6 name="circle-info" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.previewImageHintText}>{mode === 'calc' ? '请确认图片中的口算题清晰完整' : '请确认图片中的题目清晰完整'}</Text>
            </View>
          </View>

          <View style={[styles.previewActions, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => setCapturedImage(null)}
              activeOpacity={0.8}
            >
              <FontAwesome6 name="rotate-left" size={18} color="#FFF" />
              <Text style={styles.retakeBtnText}>重拍/重选</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmUploadBtn, { backgroundColor: themeColor }]}
              onPress={() => mode === 'calc' ? handleCalcCheck(capturedImage) : handleSearch(capturedImage)}
              activeOpacity={0.8}
            >
              <FontAwesome6 name={mode === 'calc' ? 'check-double' : 'magnifying-glass'} size={18} color="#FFF" />
              <Text style={styles.confirmUploadBtnText}>{mode === 'calc' ? '确认批改' : '确认搜题'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 顶部导航 + 胶囊切换 */}
      <View style={[styles.topNav, { paddingTop: insets.top + 8 }]}>
        <View style={styles.capsuleRow}>
          <TouchableOpacity
            style={[styles.capsuleBtn, mode === 'search' && { borderWidth: 1.5, borderColor: PINK }]}
            onPress={() => setMode('search')}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="camera" size={14} color={mode === 'search' ? PINK : '#FFF'} />
            <Text style={[styles.capsuleText, mode === 'search' && { color: PINK }]}>
              拍照搜题
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.capsuleBtn, mode === 'calc' && { borderWidth: 1.5, borderColor: BLUE }]}
            onPress={() => setMode('calc')}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="table-cells" size={14} color={mode === 'calc' ? BLUE : '#FFF'} />
            <Text style={[styles.capsuleText, mode === 'calc' && { color: BLUE }]}>
              口算批改
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 相机取景主体区 */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
        <View style={styles.guideOverlay}>
          <View style={styles.guideFrame}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: themeColor }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: themeColor }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: themeColor }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: themeColor }]} />
          </View>
          <View style={styles.hintRow}>
            <FontAwesome6 name="triangle-exclamation" size={12} color="#999" />
            <Text style={styles.hintText}>{mode === 'calc' ? '把口算题放在框内' : '把题目放在框内'}</Text>
          </View>
        </View>
      </View>

      {/* 拍照操作功能栏 */}
      <View style={styles.controlsSection}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.sideBtn} onPress={handlePickImage}>
            <View style={styles.sideBtnCircle}>
              <FontAwesome6 name="images" size={22} color="#FFF" />
            </View>
            <Text style={styles.sideBtnLabel}>相册</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePicture}>
            <View style={[styles.shutterOuter, { borderColor: themeColor }]}>
              <View style={[styles.shutterInner, { backgroundColor: themeColor }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideBtn} onPress={() => setFlashOn(prev => !prev)}>
            <View style={styles.sideBtnCircle}>
              <FontAwesome6
                name={flashOn ? 'bolt' : 'bolt'}
                size={22} color={flashOn ? '#FDCB6E' : '#FFF'}
                solid={flashOn}
              />
            </View>
            <Text style={styles.sideBtnLabel}>闪光灯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipRow}>
          <FontAwesome6 name="lightbulb" size={11} color="#666" />
          <Text style={styles.tipText}>{mode === 'calc' ? '建议在光线充足的地方拍照，确保口算题清晰完整' : '建议在光线充足的地方拍照，确保题目清晰完整'}</Text>
        </View>
      </View>

      {/* 底部 Tab 导航栏 */}
      <View style={[styles.bottomTabBar, mode === 'calc' && { backgroundColor: '#F0F4FF' }, { paddingBottom: insets.bottom + 6 }]}>
        {[
          { key: 'home', label: '首页', icon: 'house' },
          { key: 'search', label: mode === 'calc' ? '批改' : '搜题', icon: mode === 'calc' ? 'check-double' : 'magnifying-glass' },
          { key: 'bank', label: '题库', icon: 'book-open-reader' },
          { key: 'profile', label: '我的', icon: 'user' },
        ].map((tab) => {
          const isActive = tab.key === 'search';
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomTabItem}
              onPress={() => {
                if (tab.key === 'home') router.push('/');
                if (tab.key === 'bank') router.push('/courses');
                if (tab.key === 'profile') router.push('/profile');
              }}
            >
              <FontAwesome6
                name={tab.icon}
                size={20}
                color={isActive ? themeColor : '#999'}
                solid={isActive}
              />
              <Text style={[styles.bottomTabLabel, { color: isActive ? themeColor : '#999' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 24,
    backgroundColor: PINK,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryBtnAlt: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  galleryBtnAltText: {
    color: PINK,
    fontSize: 15,
    fontWeight: '500',
  },

  topNav: {
    backgroundColor: '#000',
    paddingBottom: 12,
    alignItems: 'center',
  },
  capsuleRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 3,
  },
  capsuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 21,
    gap: 6,
  },
  capsuleBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PINK,
  },
  capsuleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  capsuleTextActive: {
    color: PINK,
  },

  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative' as const,
    backgroundColor: '#1A0A14',
  },
  camera: {
    flex: 1,
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 320,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'dashed',
    borderRadius: 8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: PINK,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  hintText: {
    color: '#999',
    fontSize: 13,
  },

  controlsSection: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 6,
  },
  sideBtnCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnLabel: {
    fontSize: 11,
    color: '#999',
  },
  shutterBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: PINK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PINK,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 11,
    color: '#666',
  },

  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },

  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  previewBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTopTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  previewImageArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewFullImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  previewImageHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  previewImageHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#000',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: PINK,
  },
  confirmUploadBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  analyzingContainer: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  analyzingTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  analyzingTopTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  analyzingImageArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  analyzingImage: {
    width: SCREEN_WIDTH * 0.7,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  analyzingImageBorder: {
    position: 'absolute',
    top: 16,
    width: SCREEN_WIDTH * 0.7 + 8,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,101,132,0.3)',
  },
  analyzingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 40,
  },
  analyzingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  analyzingDot: {
    fontSize: 24,
    fontWeight: '800',
    color: PINK,
  },
  analyzingSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  analyzingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  analyzingStepLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  analyzingStepTextActive: {
    fontSize: 12,
    color: PINK,
    fontWeight: '500',
  },
  analyzingStepText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  resultContainer: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  resultTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EB',
  },
  resultBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTopTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  resultContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,101,132,0.1)',
  },
  resultContinueText: {
    fontSize: 13,
    fontWeight: '600',
    color: PINK,
  },
  resultImageCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'contain',
    backgroundColor: '#F8F8FB',
  },
  resultImageLabel: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  resultImageLabelText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
  },
  resultTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  resultTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8EB',
  },
  resultTabActive: {
    backgroundColor: PINK,
    borderColor: PINK,
  },
  resultTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  resultTabTextActive: {
    color: '#FFF',
  },
  resultQuestionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultSubjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  resultSubjectTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultQuestionLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  resultQuestionText: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 26,
    fontWeight: '500',
  },
  resultOptions: {
    marginTop: 10,
    gap: 6,
    paddingLeft: 8,
  },
  resultOptionText: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 24,
  },
  resultAnswerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultAnswerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  resultAnswerBox: {
    padding: 14,
    backgroundColor: 'rgba(255,101,132,0.06)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: PINK,
  },
  resultAnswerText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
    lineHeight: 24,
  },
  resultStepsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F3',
  },
  resultStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  resultStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  resultStepItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  resultStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultStepNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
  },
  resultStepText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  resultAnalysisSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F3',
  },
  resultAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  resultAnalysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B894',
  },
  resultAnalysisText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  resultEmptyAnswer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  resultEmptyAnswerText: {
    fontSize: 14,
    color: '#B2BEC3',
  },
  resultActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultActionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  resultActionBtnText: {
    fontSize: 11,
    color: '#636E72',
    fontWeight: '500',
  },

  calcResultContainer: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  calcResultTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EB',
  },
  calcScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calcScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: PINK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  calcScoreNum: {
    fontSize: 28,
    fontWeight: '800',
    color: PINK,
  },
  calcScoreLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: -4,
  },
  calcScoreDetail: {
    flex: 1,
    gap: 10,
  },
  calcScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcScoreText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
  },
  calcImageCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calcResultImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'contain',
    backgroundColor: '#F8F8FB',
  },
  calcProblemList: {
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  calcProblemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  calcProblemCorrect: {
    borderLeftWidth: 3,
    borderLeftColor: '#00B894',
  },
  calcProblemWrong: {
    borderLeftWidth: 3,
    borderLeftColor: '#E17055',
  },
  calcProblemLeft: {
    marginRight: 12,
  },
  calcProblemIdx: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcProblemIdxText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcProblemContent: {
    flex: 1,
  },
  calcProblemExpr: {
    fontSize: 17,
    color: '#2D3436',
    fontWeight: '600',
  },
  calcProblemCorrection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  calcProblemCorrectAnswer: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '600',
  },
  calcProblemMark: {
    marginLeft: 12,
  },
});