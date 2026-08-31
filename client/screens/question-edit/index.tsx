import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

const SUBJECTS = [
  { key: 'math', label: '数学', color: '#4F46E5' },
  { key: 'english', label: '英语', color: '#059669' },
  { key: 'physics', label: '物理', color: '#0891B2' },
  { key: 'chemistry', label: '化学', color: '#D97706' },
  { key: 'chinese', label: '语文', color: '#DC2626' },
  { key: 'biology', label: '生物', color: '#16A34A' },
  { key: 'history', label: '历史', color: '#9333EA' },
  { key: 'geography', label: '地理', color: '#0D9488' },
];

const ERROR_TYPES = [
  { key: 'calculation', label: '计算错误', icon: 'calculator' as const },
  { key: 'concept', label: '概念错误', icon: 'lightbulb' as const },
  { key: 'careless', label: '粗心大意', icon: 'exclamation-triangle' as const },
  { key: 'method', label: '方法错误', icon: 'route' as const },
];

const DIFFICULTY_LEVELS = [
  { key: 'easy', label: '简单', color: '#10B981' },
  { key: 'medium', label: '中等', color: '#F59E0B' },
  { key: 'hard', label: '困难', color: '#EF4444' },
];

interface QuestionData {
  id?: number;
  subject: string;
  subjectName: string;
  title: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  analysis: string;
  knowledgePoint: string;
  difficulty: string;
  imageUrl: string;
  errorType: string;
  tags: string[];
  notes: string;
}

export default function QuestionEditScreen() {
  const router = useSafeRouter();
  const { id, imageUrl: paramImageUrl, subject: paramSubject } = useSafeSearchParams<{
    id?: number;
    imageUrl?: string;
    subject?: string;
  }>();

  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [data, setData] = useState<QuestionData>({
    subject: paramSubject || 'math',
    subjectName: '数学',
    title: '',
    question: '',
    userAnswer: '',
    correctAnswer: '',
    analysis: '',
    knowledgePoint: '',
    difficulty: 'medium',
    imageUrl: paramImageUrl || '',
    errorType: 'calculation',
    tags: [],
    notes: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      if (isEdit && id) {
        fetchQuestion();
      }
    }, [id])
  );

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：GET /api/v1/wrong-questions/:id
       * Path 参数：id: number
       */
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/${id}`);
      const result = await response.json();
      if (result.code === 0) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data.title.trim()) {
      Alert.alert('提示', '请输入题目标题');
      return;
    }
    if (!data.question.trim()) {
      Alert.alert('提示', '请输入题目内容');
      return;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions/${id}`
        : `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wrong-questions`;

      const method = isEdit ? 'PUT' : 'POST';

      /**
       * 服务端文件：server/src/routes/wrongQuestions.ts
       * 接口：POST /api/v1/wrong-questions 或 PUT /api/v1/wrong-questions/:id
       * Body 参数：subject: string, subjectName: string, title: string, question: string,
       *           userAnswer?: string, correctAnswer?: string, analysis?: string,
       *           knowledgePoint?: string, difficulty?: string, imageUrl?: string,
       *           errorType?: string, tags?: string[], notes?: string
       */
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.code === 0) {
        Alert.alert('成功', isEdit ? '错题已更新' : '错题已保存', [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('错误', result.message || '保存失败');
      }
    } catch (error) {
      console.error('Failed to save question:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData({ ...data, tags: [...data.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setData({ ...data, tags: data.tags.filter(t => t !== tag) });
  };

  const updateSubject = (subjectKey: string) => {
    const subject = SUBJECTS.find(s => s.key === subjectKey);
    if (subject) {
      setData({ ...data, subject: subjectKey, subjectName: subject.label });
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '编辑错题' : '新建错题'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 图片预览 */}
        {data.imageUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: data.imageUrl }} style={styles.previewImage} resizeMode="contain" />
          </View>
        ) : null}

        {/* 科目选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择科目</Text>
          <View style={styles.subjectGrid}>
            {SUBJECTS.map(subject => (
              <TouchableOpacity
                key={subject.key}
                style={[
                  styles.subjectChip,
                  data.subject === subject.key && { backgroundColor: subject.color },
                ]}
                onPress={() => updateSubject(subject.key)}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    data.subject === subject.key && styles.subjectChipTextActive,
                  ]}
                >
                  {subject.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 题目标题 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>题目标题</Text>
          <TextInput
            style={styles.input}
            value={data.title}
            onChangeText={(text) => setData({ ...data, title: text })}
            placeholder="输入题目标题，如：二次函数顶点坐标求解"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* 题目内容 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>题目内容</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={data.question}
            onChangeText={(text) => setData({ ...data, question: text })}
            placeholder="输入题目内容"
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 我的答案 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的答案</Text>
          <TextInput
            style={[styles.input, styles.errorInput]}
            value={data.userAnswer}
            onChangeText={(text) => setData({ ...data, userAnswer: text })}
            placeholder="输入你的答案"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* 正确答案 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>正确答案</Text>
          <TextInput
            style={[styles.input, styles.correctInput]}
            value={data.correctAnswer}
            onChangeText={(text) => setData({ ...data, correctAnswer: text })}
            placeholder="输入正确答案"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* 解析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>题目解析</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={data.analysis}
            onChangeText={(text) => setData({ ...data, analysis: text })}
            placeholder="输入题目解析"
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 知识点 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>知识点</Text>
          <TextInput
            style={styles.input}
            value={data.knowledgePoint}
            onChangeText={(text) => setData({ ...data, knowledgePoint: text })}
            placeholder="输入相关知识点"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* 错误类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>错误类型</Text>
          <View style={styles.errorTypeGrid}>
            {ERROR_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.errorTypeChip,
                  data.errorType === type.key && styles.errorTypeChipActive,
                ]}
                onPress={() => setData({ ...data, errorType: type.key })}
              >
                <FontAwesome6
                  name={type.icon}
                  size={16}
                  color={data.errorType === type.key ? '#FFFFFF' : '#6C63FF'}
                />
                <Text
                  style={[
                    styles.errorTypeChipText,
                    data.errorType === type.key && styles.errorTypeChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 难度等级 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>难度等级</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTY_LEVELS.map(level => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.difficultyChip,
                  data.difficulty === level.key && { backgroundColor: level.color },
                ]}
                onPress={() => setData({ ...data, difficulty: level.key })}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    data.difficulty === level.key && styles.difficultyChipTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 标签 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>标签</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="输入标签后点击添加"
              placeholderTextColor="#A0AEC0"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
              <FontAwesome6 name="plus" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {data.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {data.tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <FontAwesome6 name="xmark" size={10} color="#6C63FF" style={styles.tagClose} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 笔记 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人笔记</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={data.notes}
            onChangeText={(text) => setData({ ...data, notes: text })}
            placeholder="记录你的学习心得或注意事项"
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.savingText}>保存中...</Text>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3436',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
  },
  subjectChipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D3436',
  },
  textArea: {
    minHeight: 80,
  },
  errorInput: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  correctInput: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  errorTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  errorTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
    gap: 6,
  },
  errorTypeChipActive: {
    backgroundColor: '#6C63FF',
  },
  errorTypeChipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  errorTypeChipTextActive: {
    color: '#FFFFFF',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
  },
  difficultyChipText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  difficultyChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  tagClose: {
    marginLeft: 6,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
});
