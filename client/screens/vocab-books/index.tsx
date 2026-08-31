import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface VocabBook {
  id: string;
  name: string;
  edition: string;
  stage: string;
  grade: string;
  semester: string;
  type: string;
  wordCount: number;
}

const stageLabels: Record<string, string> = {
  elementary: '小学',
  middle: '初中',
  high: '高中',
};

const stageColors: Record<string, string> = {
  elementary: '#10B981',
  middle: '#3B82F6',
  high: '#8B5CF6',
};

export default function VocabBooksScreen() {
  const router = useSafeRouter();
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab/books`;
      const params: string[] = [];
      if (activeStage !== 'all') params.push(`stage=${activeStage}`);
      if (activeType !== 'all') params.push(`type=${activeType}`);
      if (params.length > 0) url += `/filter?${params.join('&')}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vocab books:', error);
    } finally {
      setLoading(false);
    }
  }, [activeStage, activeType]);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  const filteredBooks = searchText
    ? books.filter(b => b.name.includes(searchText))
    : books;

  const stages = [
    { id: 'all', label: '全部' },
    { id: 'elementary', label: '小学' },
    { id: 'middle', label: '初中' },
    { id: 'high', label: '高中' },
  ];

  const types = [
    { id: 'all', label: '全部' },
    { id: '同步课本', label: '同步课本' },
    { id: '中考词汇', label: '中考' },
    { id: '高考词汇', label: '高考' },
    { id: '四级词汇', label: '四级' },
    { id: '六级词汇', label: '六级' },
  ];

  const renderBookItem = ({ item }: { item: VocabBook }) => (
    <TouchableOpacity
      className="mx-4 mb-3 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={() => router.push(`/vocab-books/${item.id}`)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View
              className="px-2 py-0.5 rounded-full mr-2"
              style={{ backgroundColor: `${stageColors[item.stage]}20` }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: stageColors[item.stage] }}
              >
                {stageLabels[item.stage]}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">{item.edition}</Text>
          </View>
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.type} · {item.wordCount} 词
          </Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${stageColors[item.stage]}15` }}
        >
          <FontAwesome6
            name="book-open"
            size={18}
            color={stageColors[item.stage]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            词书中心
          </Text>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 mb-3">
            <FontAwesome6 name="magnifying-glass" size={16} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="搜索词书..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Stage Filter */}
          <View className="flex-row gap-2 mb-2">
            {stages.map(s => (
              <TouchableOpacity
                key={s.id}
                className={`px-4 py-1.5 rounded-full ${
                  activeStage === s.id ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                onPress={() => setActiveStage(s.id)}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeStage === s.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Filter */}
          <View className="flex-row flex-wrap gap-2">
            {types.map(t => (
              <TouchableOpacity
                key={t.id}
                className={`px-3 py-1 rounded-full ${
                  activeType === t.id ? 'bg-indigo-500' : 'bg-gray-100'
                }`}
                onPress={() => setActiveType(t.id)}
              >
                <Text
                  className={`text-xs font-medium ${
                    activeType === t.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={item => item.id}
            renderItem={renderBookItem}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-20">
                <FontAwesome6 name="book" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-base">
                  暂无符合条件的词书
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Screen>
  );
}
