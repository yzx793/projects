import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// 学科配置
const SUBJECTS = [
  { id: 'chinese', name: '语文', icon: 'book' as const, color: '#EF4444' },
  { id: 'math', name: '数学', icon: 'calculator' as const, color: '#3B82F6' },
  { id: 'english', name: '英语', icon: 'language' as const, color: '#10B981' },
];

// 学段配置
const PHASES = [
  { id: 'primary', name: '小学', grades: ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] },
  { id: 'middle', name: '初中', grades: ['grade7', 'grade8', 'grade9'] },
  { id: 'high', name: '高中', grades: ['grade10', 'grade11', 'grade12'] },
];

// 年级名称映射
const GRADE_NAMES: Record<string, string> = {
  grade1: '一年级', grade2: '二年级', grade3: '三年级',
  grade4: '四年级', grade5: '五年级', grade6: '六年级',
  grade7: '七年级', grade8: '八年级', grade9: '九年级',
  grade10: '高一', grade11: '高二', grade12: '高三',
};

interface SyncStatus {
  subject: string;
  phase: string;
  grade: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress: number;
  total: number;
  synced: number;
  errors: number;
  lastSyncAt?: string;
  message?: string;
}

interface APIStatus {
  xuekubao: boolean;
  message: string;
}

export default function QuestionSyncScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [selectedPhase, setSelectedPhase] = useState<string>('primary');
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // 获取同步状态
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/sync/status`);
      const data = await response.json();
      setApiStatus(data.api);
      setSyncStatuses(data.syncStatuses || []);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus])
  );

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  // 开始同步
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/sync/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          phase: selectedPhase,
          grade: PHASES.find(p => p.id === selectedPhase)?.grades[0] || 'grade1',
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('同步已启动', '题库同步任务已在后台开始运行');
        // 延迟刷新状态
        setTimeout(fetchStatus, 2000);
      } else {
        Alert.alert('同步失败', data.message);
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败，请稍后重试');
    } finally {
      setSyncing(false);
    }
  };

  // 获取指定学科/学段的同步状态
  const getSyncStatus = (subject: string, phase: string): SyncStatus | undefined => {
    return syncStatuses.find(
      s => s.subject === subject && s.phase === phase
    );
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* API状态提示 */}
        {apiStatus && (
          <View className={`mx-4 mt-4 p-4 rounded-2xl ${apiStatus.xuekubao ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <View className="flex-row items-center">
              <FontAwesome6
                name={apiStatus.xuekubao ? 'check-circle' : 'exclamation-triangle'}
                size={20}
                color={apiStatus.xuekubao ? '#10B981' : '#F59E0B'}
              />
              <Text className={`ml-2 flex-1 text-sm ${apiStatus.xuekubao ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {apiStatus.message}
              </Text>
            </View>
          </View>
        )}

        {/* 学科选择 */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            选择学科
          </Text>
          <View className="flex-row gap-3">
            {SUBJECTS.map(subject => (
              <TouchableOpacity
                key={subject.id}
                onPress={() => setSelectedSubject(subject.id)}
                className={`flex-1 p-4 rounded-2xl items-center ${
                  selectedSubject === subject.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent'
                }`}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: `${subject.color}20` }}>
                  <FontAwesome6 name={subject.icon} size={24} color={subject.color} />
                </View>
                <Text className={`font-medium ${
                  selectedSubject === subject.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 学段选择 */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            选择学段
          </Text>
          <View className="flex-row gap-3">
            {PHASES.map(phase => {
              const status = getSyncStatus(selectedSubject, phase.id);
              return (
                <TouchableOpacity
                  key={phase.id}
                  onPress={() => setSelectedPhase(phase.id)}
                  className={`flex-1 p-4 rounded-2xl ${
                    selectedPhase === phase.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent'
                  }`}
                >
                  <Text className={`text-center font-medium mb-1 ${
                    selectedPhase === phase.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {phase.name}
                  </Text>
                  {status && status.status === 'completed' && (
                    <Text className="text-center text-xs text-green-600 dark:text-green-400">
                      已同步 {status.synced} 题
                    </Text>
                  )}
                  {status && status.status === 'syncing' && (
                    <View className="items-center mt-1">
                      <ActivityIndicator size="small" color="#4F46E5" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 同步按钮 */}
        <View className="mx-4 mt-8">
          <TouchableOpacity
            onPress={handleSync}
            disabled={syncing || !apiStatus?.xuekubao}
            className={`p-4 rounded-2xl items-center ${
              syncing || !apiStatus?.xuekubao
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-indigo-600'
            }`}
          >
            {syncing ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="ml-2 text-white font-bold">同步中...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <FontAwesome6 name="cloud-arrow-down" size={20} color="white" />
                <Text className="ml-2 text-white font-bold">
                  {apiStatus?.xuekubao ? '开始同步题库' : 'API未配置，无法同步'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 同步历史 */}
        {syncStatuses.length > 0 && (
          <View className="mx-4 mt-6 mb-8">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              同步记录
            </Text>
            {syncStatuses.map((status, index) => (
              <View
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <FontAwesome6
                      name={SUBJECTS.find(s => s.id === status.subject)?.icon || 'book'}
                      size={16}
                      color={SUBJECTS.find(s => s.id === status.subject)?.color || '#6B7280'}
                    />
                    <Text className="ml-2 font-medium text-gray-900 dark:text-white">
                      {SUBJECTS.find(s => s.id === status.subject)?.name} - {PHASES.find(p => p.id === status.phase)?.name}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    status.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    status.status === 'syncing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    status.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Text className={`text-xs ${
                      status.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      status.status === 'syncing' ? 'text-blue-600 dark:text-blue-400' :
                      status.status === 'error' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {status.status === 'completed' ? '已完成' :
                       status.status === 'syncing' ? '同步中' :
                       status.status === 'error' ? '失败' : '等待'}
                    </Text>
                  </View>
                </View>

                {status.status === 'syncing' && (
                  <View className="mt-2">
                    <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${status.progress}%` }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      进度: {status.progress}% | 已同步: {status.synced} | 错误: {status.errors}
                    </Text>
                  </View>
                )}

                {status.lastSyncAt && (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    上次同步: {new Date(status.lastSyncAt).toLocaleString('zh-CN')}
                  </Text>
                )}

                {status.message && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {status.message}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 说明 */}
        <View className="mx-4 mt-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <Text className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            题库同步说明
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5">
            1. 题库同步需要配置第三方API密钥（学库宝）{'\n'}
            2. 同步过程在后台运行，可离开页面继续{'\n'}
            3. 同步的题目会保存到本地数据库{'\n'}
            4. 未配置API时，使用本地预置题库数据
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
