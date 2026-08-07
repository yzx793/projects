import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import EventSource from 'react-native-sse';
import { createFormDataFile } from '@/utils';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isPlaying?: boolean;
}

type ChatMode = 'chinese' | 'english';

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chinese');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sseRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // TTS: Play AI response audio
  const playTTS = useCallback(async (text: string, messageId: string) => {
    try {
      // Test if FileSystem is available
      if (!(FileSystem as any).writeAsStringAsync) {
        return;
      }

      // Mark message as playing
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isPlaying: true } : m
      ));

      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/ai/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'male' }),
      });

      if (!res.ok) throw new Error('TTS failed');

      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const cacheDir = (FileSystem as any).cacheDirectory || '/tmp/';
          const fileUri = `${cacheDir}tts_${Date.now()}.mp3`;
          await (FileSystem as any).writeAsStringAsync(fileUri, base64, {
            encoding: (FileSystem as any).EncodingType.Base64,
          });

          const { sound } = await Audio.Sound.createAsync(
            { uri: fileUri },
            { shouldPlay: true },
            (status) => {
              if (status.isLoaded && status.didJustFinish) {
                setMessages(prev => prev.map(m => 
                  m.id === messageId ? { ...m, isPlaying: false } : m
                ));
              }
            }
          );

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, isPlaying: false } : m
              ));
            }
          });
        } catch (e) {
          // FileSystem not available, skip TTS
          console.log('TTS skipped:', e);
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, isPlaying: false } : m
          ));
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('TTS error:', error);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isPlaying: false } : m
      ));
    }
  }, []);

  // ASR: Start recording
  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('请授予麦克风权限以使用语音输入');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } catch (error) {
      console.error('Start recording error:', error);
    }
  }, [pulseAnim]);

  // ASR: Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) return;

      // Upload audio for ASR
      const fileObj = await createFormDataFile(uri, 'recording.m4a', 'audio/m4a');
      const formData = new FormData();
      formData.append('audio', fileObj as any);
      formData.append('language', chatMode === 'english' ? 'en' : 'zh');

      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/ai/asr`, {
        method: 'POST',
        body: formData as any,
      });

      const data = await res.json();
      if (data.text) {
        setInputText(data.text);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  }, [pulseAnim, chatMode]);

  // Send message with SSE streaming
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    scrollToBottom();

    const aiResponseId = `ai-${Date.now()}`;
    let accumulatedContent = '';

    // Use SSE for streaming
    const url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/ai/chat?message=${encodeURIComponent(messageText)}&mode=${chatMode}`;
    const sse = new EventSource(url, {
      method: 'GET',
      headers: { 'Accept': 'text/event-stream' },
    });
    sseRef.current = sse;

    sse.addEventListener('message', (event) => {
      const dataStr = event.data;
      if (!dataStr || dataStr === '[DONE]') {
        sse.close();
        setIsLoading(false);
        setIsTyping(false);
        // Auto-play TTS for AI response
        if (accumulatedContent.trim()) {
          playTTS(accumulatedContent, aiResponseId);
        }
        return;
      }

      try {
        const data = JSON.parse(dataStr) as { content?: string };
        if (data?.content) {
          accumulatedContent += data.content;
          setIsTyping(false);
          setMessages(prev => {
            const updated = [...prev];
            const aiIndex = updated.findIndex(m => m.id === aiResponseId);
            if (aiIndex >= 0) {
              updated[aiIndex] = { ...updated[aiIndex], content: accumulatedContent };
            } else {
              updated.push({
                id: aiResponseId,
                content: accumulatedContent,
                isUser: false,
                timestamp: new Date(),
              });
            }
            return updated;
          });
          scrollToBottom();
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    });

    sse.addEventListener('error', (event) => {
      console.error('SSE error:', event);
      sse.close();
      setIsLoading(false);
      setIsTyping(false);
      if (!accumulatedContent) {
        setMessages(prev => [...prev, {
          id: aiResponseId,
          content: '抱歉，对话失败，请稍后重试',
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    });
  }, [inputText, isLoading, chatMode, scrollToBottom, playTTS]);

  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      content: chatMode === 'chinese' 
        ? '你好！我是诗词小助手~\n【翻译】有什么可以帮你的吗？'
        : 'Hello! I am your English assistant.\n【翻译】你好！我是你的英语助手。',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, [chatMode]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']} backgroundColor="#F0F0F3">
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.pageTitle}>AI互动</Text>
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeBtn, chatMode === 'chinese' && styles.modeBtnActive]}
            onPress={() => {
              setChatMode('chinese');
              setMessages([]);
            }}
          >
            <Text style={[styles.modeBtnText, chatMode === 'chinese' && styles.modeBtnTextActive]}>
              语文诗词
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, chatMode === 'english' && styles.modeBtnActive]}
            onPress={() => {
              setChatMode('english');
              setMessages([]);
            }}
          >
            <Text style={[styles.modeBtnText, chatMode === 'english' && styles.modeBtnTextActive]}>
              英语对话
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageContainer, msg.isUser ? styles.userMessage : styles.aiMessage]}
          >
            {!msg.isUser && (
              <View style={styles.aiAvatar}>
                <FontAwesome6 name="robot" size={20} color="#6C63FF" />
              </View>
            )}
            <View style={msg.isUser ? styles.userBubble : styles.aiBubble}>
              <Text style={msg.isUser ? styles.userMessageText : styles.aiMessageText}>
                {msg.content}
              </Text>
              {!msg.isUser && (
                <TouchableOpacity
                  style={styles.ttsButton}
                  onPress={() => playTTS(msg.content, msg.id)}
                  disabled={msg.isPlaying}
                >
                  <FontAwesome6 
                    name={msg.isPlaying ? 'volume-high' : 'volume-low'} 
                    size={16} 
                    color={msg.isPlaying ? '#6C63FF' : '#636E72'} 
                  />
                  {msg.isPlaying && <Text style={styles.ttsButtonText}>播放中...</Text>}
                </TouchableOpacity>
              )}
            </View>
            {msg.isUser && (
              <View style={styles.userAvatar}>
                <FontAwesome6 name="user" size={20} color="#FFF" />
              </View>
            )}
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <FontAwesome6 name="robot" size={20} color="#6C63FF" />
            </View>
            <View style={styles.aiBubble}>
              <Text style={styles.aiMessageText}>正在输入...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={chatMode === 'chinese' ? '输入诗句或问题...' : 'Type your message...'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            placeholderTextColor="#B2BEC3"
            multiline
          />
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Animated.View style={{
              transform: [{ scale: pulseAnim }],
            }}>
              <FontAwesome6 
                name="microphone" 
                size={20} 
                color={isRecording ? '#FF6B6B' : '#6C63FF'} 
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <FontAwesome6 name="paper-plane" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        {isRecording && (
          <Text style={styles.recordingHint}>松开结束录音，自动识别文字</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EB',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#E8E8EB',
  },
  modeBtnActive: {
    backgroundColor: '#6C63FF',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  modeBtnTextActive: {
    color: '#FFF',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    maxWidth: '100%',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userMessageText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 22,
  },
  aiMessageText: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 22,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
    gap: 6,
  },
  ttsButtonText: {
    fontSize: 12,
    color: '#6C63FF',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micBtnActive: {
    backgroundColor: '#FFE5E5',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#B2BEC3',
  },
  recordingHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 8,
  },
});