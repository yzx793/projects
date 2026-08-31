import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Descriptor } from '@react-navigation/routers';

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
  const router = useRouter();

  const titleMap: Record<string, string> = {
    'vocab-books': '词书',
    'poetry': '古诗词',
    'question-sync': '题库',
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = titleMap[route.name] ?? options.title ?? route.name;
        const isFocused = state.index === index;

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
          'vocab-books': 'book',
          'poetry': 'scroll',
          'question-sync': 'database',
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
      {/* Switch back to student mode */}
      <TouchableOpacity
        style={styles.switchBtn}
        onPress={() => router.replace('/(tabs)')}
      >
        <FontAwesome6 name="user" size={20} color="#6C63FF" />
      </TouchableOpacity>
    </View>
  );
}

export default function TeacherLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTeacherTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="vocab-books"
        options={{ title: '词书' }}
      />
      <Tabs.Screen
        name="poetry"
        options={{ title: '古诗词' }}
      />
      <Tabs.Screen
        name="question-sync"
        options={{ title: '题库' }}
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
  switchBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E8E8EB',
    paddingLeft: 8,
  },
});