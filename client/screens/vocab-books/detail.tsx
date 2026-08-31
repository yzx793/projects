import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  meaning: string;
  example?: string;
  exampleCn?: string;
}

export default function VocabBookDetailScreen() {
  const router = useSafeRouter();
  const { bookId } = useSafeSearchParams<{ bookId: string }>();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab/books/${bookId}`
      );
      const data = await response.json();
      if (data.success) {
        setWords(data.data.words);
        setBookName(data.data.name);
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      fetchWords();
    }, [fetchWords])
  );

  const renderWordItem = ({ item, index }: { item: VocabWord; index: number }) => {
    const isExpanded = expandedWord === item.id;
    return (
      <TouchableOpacity
        className="mx-4 mb-2 rounded-xl bg-white p-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => setExpandedWord(isExpanded ? null : item.id)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-xs text-gray-400 w-6">{index + 1}</Text>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-800">
                  {item.word}
                </Text>
                <Text className="text-sm text-gray-400 ml-2">
                  {item.phonetic}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 mt-0.5">
                {item.pos} {item.meaning}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#9CA3AF"
          />
        </View>
        {isExpanded && (item.example || item.exampleCn) && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            {item.example && (
              <Text className="text-sm text-gray-600 italic">
                &ldquo;{item.example}&rdquo;
              </Text>
            )}
            {item.exampleCn && (
              <Text className="text-sm text-gray-400 mt-1">
                {item.exampleCn}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <FontAwesome6 name="arrow-left" size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {bookName}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                共 {words.length} 个单词
              </Text>
            </View>
          </View>
        </View>

        {/* Word List */}
        <FlatList
          data={words}
          keyExtractor={item => item.id}
          renderItem={renderWordItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}
