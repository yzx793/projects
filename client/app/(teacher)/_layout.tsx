import { Tabs, useRouter } from 'expo-router';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Descriptor } from '@react-navigation/routers';
import { useAuth } from '@/context/AuthContext';

function CustomTeacherTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: Record<string, Descriptor<any, any, any>>;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();

  // Hide extra routes from tab bar
  const hiddenRoutes = ['poetry', 'vocab-books', 'question-sync'];
  const visibleRoutes = state.routes.filter((route: any) => !hiddenRoutes.includes(route.name));

  const titleMap: Record<string, string> = {
    'students': '学生',
    'question-bank': '题库',
    'profile': '我的',
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {visibleRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = titleMap[route.name] ?? options.title ?? route.name;
        const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconMap: Record<string, string> = {
          'students': 'users',
          'question-bank': 'database',
          'profile': 'user',
        };

        const icon = iconMap[route.name] || 'circle';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name={icon as any}
              size={22}
              color={isFocused ? '#6C63FF' : '#B2BEC3'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? '#6C63FF' : '#B2BEC3' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TeacherLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'student') {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <Tabs
      tabBar={(props) => <CustomTeacherTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="students"
        options={{ title: '学生' }}
      />
      <Tabs.Screen
        name="question-bank"
        options={{ title: '题库' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: '我的' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8EB',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});