import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course-detail" />
        <Stack.Screen name="question-detail" />
        <Stack.Screen name="camera" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="search-result" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="question-edit" />
        <Stack.Screen name="practice" />
        <Stack.Screen name="ai-chat" />
        <Stack.Screen name="vocab-chat" />
        <Stack.Screen name="question-search" />
        <Stack.Screen name="question-bank" />
      </Stack>
      <Toast />
    </Provider>
  );
}