import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeSearchParams, useSafeRouter } from '@/hooks/useSafeRouter';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { createFormDataFile } from '@/utils';
import EventSource from 'react-native-sse';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Word {
  word: string;
  meaning: string;
  difficulty: string;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
  isStreaming?: boolean;
}

interface LearningReport {
  sessionId: string;
  totalWords: number;
  masteredWords: string[];
  wrongWords: string[];
  masteryRate: number;
  conversationRounds: number;
  timestamp: string;
}

export default function VocabChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { grade = 'middle' } = useSafeSearchParams<{ grade?: string }>();
  
  const [words, setWords] = useState<Word[]>([]);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<LearningReport | null>(null);
  const [typingDots, setTypingDots] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const typingAnimation = useMemo(() => new Animated.Value(0), []);
  const typingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // 请求麦克风权限
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasMicPermission(status === 'granted');
    })();
  }, []);
  
  // 打字动画
  useEffect(() => {
    if (!isLoading) {
      typingAnimationRef.current?.stop();
      typingAnimation.setValue(0);
      return;
    }
    
    const animation = Animated.loop(
      Animated.timing(typingAnimation, {
        toValue: 3,
        duration: 1500,
        useNativeDriver: false,
      })
    );
    typingAnimationRef.current = animation;
    animation.start();
    
    const interval = setInterval(() => {
      setTypingDots(prev => (prev + 1) % 4);
    }, 500);
    
    return () => {
      animation.stop();
      clearInterval(interval);
    };
  }, [isLoading, typingAnimation]);
  
  // 获取今日单词
  const fetchWords = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/words?grade=${grade}`);
      const data = await res.json();
      if (data.code === 0) {
        setWords(data.data.words);
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
    }
  }, [grade]);
  
  useFocusEffect(
    useCallback(() => {
      fetchWords();
    }, [fetchWords])
  );
  
  // TTS 文字转语音
  const playTTS = useCallback(async (text: string) => {
    try {
      // 提取英文部分（去掉中文翻译）
      const englishText = text.split('\n')[0].replace(/【.*?】/g, '').trim();
      if (!englishText) return;
      
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: englishText }),
      });
      const data = await res.json();
      
      if (data.code === 0 && data.data.audioUrl) {
        // 停止当前播放
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: data.data.audioUrl },
          { shouldPlay: true, isLooping: false },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              soundRef.current?.unloadAsync();
            }
          }
        );
        soundRef.current = sound;
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, []);
  
  // 开始对话
  const startConversation = useCallback(async () => {
    if (words.length === 0) return;
    
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: words.map(w => w.word) }),
      });
      const data = await res.json();
      
      if (data.code === 0) {
        setSessionId(data.data.sessionId);
        setIsSessionActive(true);
        
        // 添加欢迎消息
        const welcomeMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: `你好！我是你的英语老师。今天我们要学习这些单词：${words.map(w => w.word).join('、')}。让我们开始吧！`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
        
        // 自动播放欢迎消息的语音
        playTTS(welcomeMsg.content);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      Alert.alert('错误', '无法开始对话，请稍后重试');
    }
  }, [words, playTTS]);
  
  // 结算对话
  const handleSettle = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      /**
       * 服务端文件：server/src/routes/vocabChat.ts
       * 接口：POST /api/v1/vocab-chat/settle
       * Body 参数：sessionId: string
       */
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      const result = await response.json();
      if (result.code === 0 && result.data) {
        setReport(result.data);
        setShowReport(true);
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error('Failed to settle conversation:', error);
    }
  }, [sessionId]);
  
  // 发送消息
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !sessionId || isLoading) return;
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      content: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    const aiMsgId = `ai-${Date.now()}`;
    let accumulatedContent = '';
    
    try {
      // 使用 react-native-sse 进行 SSE 流式接收
      const es = new EventSource(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text.trim() }),
        pollingInterval: 0,
      });
      
      es.addEventListener('message', (event) => {
        if (event.data === '[DONE]') {
          // 流结束，播放语音
          if (accumulatedContent) {
            playTTS(accumulatedContent);
          }
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
          setIsLoading(false);
          es.close();
          return;
        }
        
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          if (data.content) {
            accumulatedContent += data.content;
            setMessages(prev => {
              const existing = prev.find(m => m.id === aiMsgId);
              if (existing) {
                return prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedContent } : m);
              } else {
                return [...prev, {
                  id: aiMsgId,
                  content: accumulatedContent,
                  isUser: false,
                  timestamp: new Date(),
                  isStreaming: true,
                }];
              }
            });
          } else if (data.type === 'status') {
            // 更新掌握状态
            setMasteredWords(data.masteredWords || []);
            // 检查对话是否结束
            if (data.conversationEnd) {
              // 延迟显示结算页面，让用户看完AI的总结
              setTimeout(() => {
                handleSettle();
              }, 2000);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
      
      es.addEventListener('error', (event) => {
        console.error('SSE error:', event);
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          content: '抱歉，网络出现问题，请稍后重试。',
          isUser: false,
          timestamp: new Date(),
        }]);
        setIsLoading(false);
        es.close();
      });
      
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        content: '抱歉，网络出现问题，请稍后重试。',
        isUser: false,
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    }
  }, [sessionId, isLoading, playTTS, handleSettle]);
  
  // ASR 语音识别
  const startRecording = useCallback(async () => {
    if (!hasMicPermission) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要权限', '请授予麦克风权限以使用语音输入');
        return;
      }
      setHasMicPermission(true);
    }
    
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('错误', '无法开始录音');
    }
  }, [hasMicPermission]);
  
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      if (uri) {
        // 上传音频进行识别
        const formData = new FormData();
        const formFile = await createFormDataFile(uri, 'recording.m4a', 'audio/m4a');
        formData.append('audio', formFile as any);
        
        const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/asr`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        
        if (data.code === 0 && data.data.text) {
          setInputText(data.data.text);
          // 自动发送识别结果
          setTimeout(() => sendMessage(data.data.text), 500);
        } else {
          Alert.alert('识别失败', '无法识别语音，请重试');
        }
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('错误', '录音处理失败');
    }
  }, [sendMessage]);
  
  // 结束对话
  const endConversation = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab-chat/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      
      if (data.code === 0) {
        setReport(data.data);
        setShowReport(true);
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error('Settle error:', error);
      Alert.alert('错误', '无法结束对话');
    }
  }, [sessionId]);
  
  // 渲染单词进度条
  const renderWordProgress = () => {
    if (!isSessionActive || words.length === 0) return null;
    
    return (
      <View style={[styles.wordProgressContainer, { paddingTop: insets.top + 8 }]}>
        <View style={styles.wordProgressHeader}>
          <Text style={styles.wordProgressTitle}>今日单词</Text>
          <Text style={styles.wordProgressCount}>
            {masteredWords.length}/{words.length}
          </Text>
        </View>
        <View style={styles.wordList}>
          {words.map((w, index) => {
            const isMastered = masteredWords.includes(w.word.toLowerCase());
            return (
              <View
                key={index}
                style={[styles.wordChip, isMastered && styles.wordChipMastered]}
              >
                <Text style={[styles.wordChipText, isMastered && styles.wordChipTextMastered]}>
                  {w.word}
                </Text>
                {isMastered && (
                  <FontAwesome6 name="check" size={10} color="#00B894" style={styles.wordCheck} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  // 渲染消息气泡
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.isUser;
    
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}>
        {/* 头像 */}
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.aiAvatar}>
              <FontAwesome6 name="graduation-cap" size={20} color="#6C63FF" />
            </View>
          </View>
        )}
        
        {/* 气泡 */}
        <View style={[styles.bubbleContainer, isUser ? styles.bubbleContainerUser : styles.bubbleContainerAI]}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {item.content}
            </Text>
            {item.isStreaming && (
              <Text style={styles.streamingIndicator}>...</Text>
            )}
          </View>
          
          {/* TTS 按钮（仅AI消息） */}
          {!isUser && !item.isStreaming && (
            <TouchableOpacity
              style={styles.ttsButton}
              onPress={() => playTTS(item.content)}
            >
              <FontAwesome6 name="volume-high" size={14} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* 用户头像 */}
        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <FontAwesome6 name="user" size={20} color="#FFF" />
            </View>
          </View>
        )}
      </View>
    );
  };
  
  // 渲染打字指示器
  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageRow, styles.messageRowAI]}>
        <View style={styles.avatarContainer}>
          <View style={styles.aiAvatar}>
            <FontAwesome6 name="graduation-cap" size={20} color="#6C63FF" />
          </View>
        </View>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot}>
            <Text style={styles.typingDotText}>{'.'.repeat(typingDots)}</Text>
          </View>
          <Text style={styles.typingText}>AI老师正在输入</Text>
        </View>
      </View>
    );
  };
  
  // 渲染学习报告
  const renderReport = () => {
    if (!showReport || !report) return null;
    
    return (
      <View style={styles.reportOverlay}>
        <View style={styles.reportContainer}>
          <View style={styles.reportHeader}>
            <FontAwesome6 name="trophy" size={40} color="#FDCB6E" />
            <Text style={styles.reportTitle}>学习完成！</Text>
          </View>
          
          <View style={styles.reportStats}>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{report.masteryRate}%</Text>
              <Text style={styles.reportStatLabel}>掌握率</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{report.masteredWords.length}</Text>
              <Text style={styles.reportStatLabel}>已掌握</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{report.conversationRounds}</Text>
              <Text style={styles.reportStatLabel}>对话轮次</Text>
            </View>
          </View>
          
          {report.wrongWords.length > 0 && (
            <View style={styles.reportWrongWords}>
              <Text style={styles.reportWrongTitle}>需要复习的单词：</Text>
              <View style={styles.reportWrongList}>
                {report.wrongWords.map((word, index) => (
                  <View key={index} style={styles.reportWrongChip}>
                    <Text style={styles.reportWrongText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.reportCloseBtn}
            onPress={() => {
              setShowReport(false);
              router.back();
            }}
          >
            <Text style={styles.reportCloseBtnText}>返回首页</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#F0F0F3">
      <View style={styles.container}>
        {/* 顶部导航栏 */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome6 name="chevron-left" size={20} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI单词对话</Text>
          {isSessionActive && (
            <TouchableOpacity onPress={endConversation} style={styles.endBtn}>
              <Text style={styles.endBtnText}>结束</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* 单词进度条 */}
        {renderWordProgress()}
        
        {/* 聊天区域 */}
        {!isSessionActive ? (
          <View style={styles.startContainer}>
            <View style={styles.startIcon}>
              <FontAwesome6 name="comments" size={60} color="#6C63FF" />
            </View>
            <Text style={styles.startTitle}>AI英语对话</Text>
            <Text style={styles.startSubtitle}>
              与AI老师对话，轻松掌握今日单词
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={startConversation}
              disabled={words.length === 0}
            >
              <Text style={styles.startBtnText}>开始对话</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={renderTypingIndicator()}
          />
        )}
        
        {/* 输入区域 */}
        {isSessionActive && (
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.inputWrapper}>
              {/* 麦克风按钮 */}
              <TouchableOpacity
                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <FontAwesome6
                  name={isRecording ? 'microphone' : 'microphone-lines'}
                  size={20}
                  color={isRecording ? '#FF6584' : '#6C63FF'}
                />
              </TouchableOpacity>
              
              {/* 输入框 */}
              <TextInput
                style={styles.input}
                placeholder="输入英文消息..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage(inputText)}
                placeholderTextColor="#B2BEC3"
                editable={!isRecording}
              />
              
              {/* 发送按钮 */}
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading || isRecording}
              >
                <FontAwesome6 name="paper-plane" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* 学习报告弹窗 */}
        {renderReport()}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F0F0F3',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EB',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
  },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6584',
    borderRadius: 16,
  },
  endBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  wordProgressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EB',
  },
  wordProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  wordProgressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C63FF',
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
  },
  wordChipMastered: {
    backgroundColor: '#E8F8F5',
  },
  wordChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#636E72',
  },
  wordChipTextMastered: {
    color: '#00B894',
  },
  wordCheck: {
    marginLeft: 4,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  startIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
  },
  startSubtitle: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  startBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#6C63FF',
    borderRadius: 24,
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
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleContainer: {
    maxWidth: '70%',
  },
  bubbleContainerUser: {
    alignItems: 'flex-end',
  },
  bubbleContainerAI: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
  },
  bubbleUser: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFF',
  },
  bubbleTextAI: {
    color: '#2D3436',
  },
  streamingIndicator: {
    fontSize: 15,
    color: '#6C63FF',
    fontWeight: '700',
  },
  ttsButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDot: {
    marginRight: 6,
  },
  typingDotText: {
    fontSize: 18,
    color: '#6C63FF',
    fontWeight: '700',
  },
  typingText: {
    fontSize: 13,
    color: '#636E72',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  micBtnActive: {
    backgroundColor: '#FFE8EC',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3436',
    paddingVertical: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#B2BEC3',
  },
  reportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reportContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginTop: 12,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6C63FF',
  },
  reportStatLabel: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  reportWrongWords: {
    width: '100%',
    marginBottom: 24,
  },
  reportWrongTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6584',
    marginBottom: 8,
  },
  reportWrongList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportWrongChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFE8EC',
    borderRadius: 12,
  },
  reportWrongText: {
    fontSize: 13,
    color: '#FF6584',
    fontWeight: '500',
  },
  reportCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    alignItems: 'center',
  },
  reportCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
