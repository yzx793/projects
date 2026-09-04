import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';

const GRADES = [
  { label: '一年级', value: '1' },
  { label: '二年级', value: '2' },
  { label: '三年级', value: '3' },
  { label: '四年级', value: '4' },
  { label: '五年级', value: '5' },
  { label: '六年级', value: '6' },
  { label: '七年级', value: '7' },
  { label: '八年级', value: '8' },
  { label: '九年级', value: '9' },
];

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: '请输入用户名和密码' });
      return;
    }

    if (isRegister && role === 'student' && !grade) {
      Toast.show({ type: 'error', text1: '请选择年级' });
      return;
    }

    setLoading(true);
    const result = isRegister
      ? await register(username.trim(), password.trim(), role, role === 'student' ? grade : undefined)
      : await login(username.trim(), password.trim());

    setLoading(false);

    if (result.success) {
      Toast.show({ type: 'success', text1: isRegister ? '注册成功' : '登录成功' });
      router.replace('/(tabs)');
    } else {
      Toast.show({ type: 'error', text1: result.message || '操作失败' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.title}>逗逗启航</Text>
          <Text style={styles.subtitle}>
            {isRegister ? '创建新账号' : '欢迎回来'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>用户名</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isRegister && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>角色</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'student' && styles.roleButtonActive,
                    ]}
                    onPress={() => { setRole('student'); setGrade(''); }}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'student' && styles.roleButtonTextActive,
                      ]}
                    >
                      👨‍🎓 学生
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'teacher' && styles.roleButtonActive,
                    ]}
                    onPress={() => { setRole('teacher'); setGrade(''); }}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'teacher' && styles.roleButtonTextActive,
                      ]}
                    >
                      👨‍🏫 教师
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {role === 'student' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>年级</Text>
                  <View style={styles.gradeGrid}>
                    {GRADES.map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        style={[
                          styles.gradeButton,
                          grade === g.value && styles.gradeButtonActive,
                        ]}
                        onPress={() => setGrade(g.value)}
                      >
                        <Text
                          style={[
                            styles.gradeButtonText,
                            grade === g.value && styles.gradeButtonTextActive,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegister ? '注册' : '登录'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.switchButtonText}>
              {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isRegister && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>演示账号：</Text>
            <Text style={styles.hintText}>学生 student / 123456</Text>
            <Text style={styles.hintText}>教师 teacher / 123456</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  roleButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeButton: {
    width: '30%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  gradeButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  gradeButtonText: {
    fontSize: 13,
    color: '#666',
  },
  gradeButtonTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  hint: {
    marginTop: 24,
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#999',
  },
});