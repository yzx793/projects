import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const inTeacherGroup = segments[0] === '(teacher)';
    const inStudentGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // 根据角色跳转到对应端
      if (user.role === 'teacher') {
        router.replace('/(teacher)/question-bank');
      } else {
        router.replace('/(tabs)');
      }
    } else if (user?.role === 'student' && inTeacherGroup) {
      // 学生误入教师端，踢回学生端
      router.replace('/(tabs)');
    } else if (user?.role === 'teacher' && inStudentGroup) {
      // 教师误入学生端，踢到教师端
      router.replace('/(teacher)/question-bank');
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider>
      <AuthProvider>
        <AuthGuard>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              headerShown: false
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="course-detail" />
            <Stack.Screen name="question-detail" />
            <Stack.Screen name="camera" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="search-result" />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="question-edit" />
            <Stack.Screen name="practice" />
            <Stack.Screen name="ai-chat" />
            <Stack.Screen name="vocab-books/[bookId]" />
            <Stack.Screen name="vocab-chat" />
            <Stack.Screen name="question-search" />
            <Stack.Screen name="question-bank" />
          </Stack>
        </AuthGuard>
        <Toast />
      </AuthProvider>
    </Provider>
  );
}