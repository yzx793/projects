import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

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

export default function TeacherVocabBooksScreen() {
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<VocabBook | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEdition, setFormEdition] = useState('人教版');
  const [formStage, setFormStage] = useState('elementary');
  const [formType, setFormType] = useState('同步课本');

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab/books`;
      const params: string[] = [];
      if (activeStage !== 'all') params.push(`stage=${activeStage}`);
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
  }, [activeStage]);

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

  const handleAddBook = async () => {
    if (!formName.trim()) {
      Alert.alert('提示', '请输入词书名称');
      return;
    }

    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          edition: formEdition,
          stage: formStage,
          type: formType,
          grade: '',
          semester: '',
          wordCount: 0,
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '词书添加成功');
        setShowAddModal(false);
        resetForm();
        fetchBooks();
      } else {
        Alert.alert('错误', data.message || '添加失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

  const handleDeleteBook = (book: VocabBook) => {
    Alert.alert('确认删除', `确定要删除"${book.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/vocab/books/${book.id}`,
              { method: 'DELETE' }
            );
            const data = await response.json();
            if (data.success) {
              Alert.alert('成功', '删除成功');
              fetchBooks();
            } else {
              Alert.alert('错误', data.message || '删除失败');
            }
          } catch (error) {
            Alert.alert('错误', '网络请求失败');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormName('');
    setFormEdition('人教版');
    setFormStage('elementary');
    setFormType('同步课本');
    setEditingBook(null);
  };

  const openEditModal = (book: VocabBook) => {
    setEditingBook(book);
    setFormName(book.name);
    setFormEdition(book.edition);
    setFormStage(book.stage);
    setFormType(book.type);
    setShowAddModal(true);
  };

  const renderBookItem = ({ item }: { item: VocabBook }) => (
    <View
      className="mx-4 mb-3 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
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
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#3B82F615' }}
            onPress={() => openEditModal(item)}
          >
            <FontAwesome6 name="pen" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#EF444415' }}
            onPress={() => handleDeleteBook(item)}
          >
            <FontAwesome6 name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-bold text-gray-900">
              词书管理
            </Text>
            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: '#6C63FF' }}
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <Text className="text-white font-medium">+ 添加词书</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <FontAwesome6 name="magnifying-glass" size={16} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="搜索词书..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Stage Filter */}
          <View className="flex-row mt-3 gap-2">
            {stages.map(stage => (
              <TouchableOpacity
                key={stage.id}
                className={`px-4 py-1.5 rounded-full ${
                  activeStage === stage.id ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                onPress={() => setActiveStage(stage.id)}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeStage === stage.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : filteredBooks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <FontAwesome6 name="book" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3">暂无词书</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        )}

        {/* Add/Edit Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold">
                  {editingBook ? '编辑词书' : '添加词书'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <FontAwesome6 name="xmark" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm text-gray-600 mb-1">词书名称</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base"
                    placeholder="如：人教版三年级英语上册"
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-1">版本</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-4 py-3 text-base"
                    value={formEdition}
                    onChangeText={setFormEdition}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-1">学段</Text>
                  <View className="flex-row gap-2">
                    {['elementary', 'middle', 'high'].map(s => (
                      <TouchableOpacity
                        key={s}
                        className={`flex-1 py-2 rounded-xl items-center ${
                          formStage === s ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                        onPress={() => setFormStage(s)}
                      >
                        <Text
                          className={
                            formStage === s ? 'text-white' : 'text-gray-600'
                          }
                        >
                          {stageLabels[s]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-sm text-gray-600 mb-1">类型</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {['同步课本', '中考词汇', '高考词汇', '四级词汇', '六级词汇'].map(t => (
                      <TouchableOpacity
                        key={t}
                        className={`px-4 py-2 rounded-xl ${
                          formType === t ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                        onPress={() => setFormType(t)}
                      >
                        <Text
                          className={
                            formType === t ? 'text-white' : 'text-gray-600'
                          }
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-blue-500 rounded-xl py-3 items-center mt-2"
                  onPress={handleAddBook}
                >
                  <Text className="text-white font-bold text-base">
                    {editingBook ? '保存修改' : '添加词书'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}