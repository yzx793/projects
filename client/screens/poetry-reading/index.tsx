import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface Poetry {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  type: string;
  content: string;
  translation?: string;
  appreciation?: string;
}

const typeColors: Record<string, string> = {
  '唐诗': '#EF4444',
  '宋词': '#8B5CF6',
  '诗经': '#F59E0B',
  '文言文': '#10B981',
};

export default function PoetryReadingScreen() {
  const [poems, setPoems] = useState<Poetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [selectedPoem, setSelectedPoem] = useState<Poetry | null>(null);

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/poetry`;
      if (activeType !== 'all') {
        url += `?type=${activeType}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPoems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch poems:', error);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useFocusEffect(
    useCallback(() => {
      fetchPoems();
    }, [fetchPoems])
  );

  const fetchPoemDetail = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/poetry/${id}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedPoem(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch poem detail:', error);
    }
  }, []);

  const types = [
    { id: 'all', label: '全部', icon: 'book' as const },
    { id: '唐诗', label: '唐诗', icon: 'sun' as const },
    { id: '宋词', label: '宋词', icon: 'moon' as const },
    { id: '诗经', label: '诗经', icon: 'scroll' as const },
    { id: '文言文', label: '文言文', icon: 'feather' as const },
  ];

  const renderPoemCard = ({ item }: { item: Poetry }) => (
    <TouchableOpacity
      className="mx-4 mb-3 rounded-2xl bg-white p-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={() => fetchPoemDetail(item.id)}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="px-2 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: `${typeColors[item.type] || '#6B7280'}20` }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: typeColors[item.type] || '#6B7280' }}
          >
            {item.type}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">
          {item.dynasty} · {item.author}
        </Text>
      </View>
      <Text className="text-lg font-bold text-gray-800 mb-2">{item.title}</Text>
      <Text
        className="text-sm text-gray-600 leading-6"
        numberOfLines={3}
      >
        {item.content.replace(/\n/g, ' ')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            古诗文鉴赏
          </Text>

          {/* Type Filter */}
          <View className="flex-row gap-2">
            {types.map(t => (
              <TouchableOpacity
                key={t.id}
                className={`flex-row items-center px-3 py-1.5 rounded-full ${
                  activeType === t.id ? 'bg-amber-500' : 'bg-gray-100'
                }`}
                onPress={() => setActiveType(t.id)}
              >
                <FontAwesome6
                  name={t.icon}
                  size={12}
                  color={activeType === t.id ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  className={`text-sm font-medium ml-1.5 ${
                    activeType === t.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Poem List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : (
          <FlatList
            data={poems}
            keyExtractor={item => item.id}
            renderItem={renderPoemCard}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-20">
                <FontAwesome6 name="scroll" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-base">
                  暂无诗词数据
                </Text>
              </View>
            }
          />
        )}

        {/* Poem Detail Modal */}
        <Modal
          visible={!!selectedPoem}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedPoem(null)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className="bg-white rounded-t-3xl max-h-[85%]"
              style={{ paddingBottom: 40 }}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    {selectedPoem?.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    [{selectedPoem?.dynasty}] {selectedPoem?.author}
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => setSelectedPoem(null)}
                >
                  <FontAwesome6 name="xmark" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
                {/* Poem Content */}
                <View className="bg-amber-50 rounded-xl p-5 mb-4">
                  <Text className="text-lg text-gray-800 leading-8 text-center">
                    {selectedPoem?.content}
                  </Text>
                </View>

                {/* Translation */}
                {selectedPoem?.translation && (
                  <View className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <FontAwesome6 name="language" size={14} color="#F59E0B" />
                      <Text className="text-base font-semibold text-gray-800 ml-2">
                        译文
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 leading-6 bg-gray-50 rounded-xl p-4">
                      {selectedPoem.translation}
                    </Text>
                  </View>
                )}

                {/* Appreciation */}
                {selectedPoem?.appreciation && (
                  <View className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <FontAwesome6 name="lightbulb" size={14} color="#8B5CF6" />
                      <Text className="text-base font-semibold text-gray-800 ml-2">
                        赏析
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 leading-6 bg-purple-50 rounded-xl p-4">
                      {selectedPoem.appreciation}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}
