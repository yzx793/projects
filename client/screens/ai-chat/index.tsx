// d:\Download\project_20260706_203050\projects\client\screens\ai-chat\index.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeSearchParams } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

type ChatMode = 'chinese' | 'english';

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const { mode: routeMode } = useSafeSearchParams<{ mode?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>(routeMode === 'english' ? 'english' : 'chinese');
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          mode: chatMode,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const aiResponseId = `ai-${Date.now()}`;
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder('utf-8').decode(value);
        const lines = text.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
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
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                accumulatedContent += data.content;
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
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        content: '抱歉，对话失败，请稍后重试',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [inputText, isLoading, chatMode, scrollToBottom]);

  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      content: chatMode === 'chinese' 
        ? '你好！我是诗词小助手~'
        : 'Hello! I am your English assistant.',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, [chatMode]); // 添加 chatMode 依赖

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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageContainer, msg.isUser ? styles.userMessage : styles.aiMessage]}
          >
            <View style={msg.isUser ? styles.userBubble : styles.aiBubble}>
              <Text style={msg.isUser ? styles.userMessageText : styles.aiMessageText}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
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
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <FontAwesome6 name="paper-plane" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
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
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
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
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 10,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3436',
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
});