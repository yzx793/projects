import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useCSSVariable } from 'uniwind';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [background, muted, accent, border] = useCSSVariable([
    '--color-background',
    '--color-muted',
    '--color-accent',
    '--color-border',
  ]) as string[];

  let tabBarStyle = {
    backgroundColor: '#F0F0F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0,
    paddingTop: 12,
    height: 70 + insets.bottom,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  };

  if (Platform.OS === 'web') {
    tabBarStyle = {
      ...tabBarStyle,
      height: 'auto' as any,
    };
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#B2BEC3',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '学习',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'house' : 'house'}
              size={20}
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: '课程',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'book-open' : 'book-open'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wrong-questions"
        options={{
          title: '错题本',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'clipboard-list' : 'clipboard-list'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'user' : 'user'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}