import { Tabs } from 'expo-router';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useCSSVariable } from 'uniwind';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { LinearGradient } from 'expo-linear-gradient';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const [background, muted, accent, border] = useCSSVariable([
    '--color-background',
    '--color-muted',
    '--color-accent',
    '--color-border',
  ]) as string[];

  // Filter out the camera tab from the regular tabs
  const regularTabs = state.routes.filter((route: any) => route.name !== 'camera');
  const cameraRoute = state.routes.find((route: any) => route.name === 'camera');

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {regularTabs.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
          const label = options.title || route.name;
          const color = isFocused ? '#6C63FF' : '#B2BEC3';

          // Find the actual index in the state
          const actualIndex = state.routes.findIndex((r: any) => r.key === route.key);
          
          // Insert camera button after the 2nd tab (courses)
          const insertCameraAfter = index === 1;

          return (
            <View key={route.key} style={styles.tabWrapper}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => navigation.navigate(route.name)}
                style={styles.tabButton}
              >
                {options.tabBarIcon?.({ color, focused: isFocused })}
                <View style={{ height: 2 }} />
                <View style={[styles.tabLabelContainer, { backgroundColor: isFocused ? '#6C63FF20' : 'transparent' }]}>
                  <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                </View>
              </TouchableOpacity>
              {insertCameraAfter && cameraRoute && (
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => router.push('/camera')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#896BFF']}
                    style={styles.cameraGradient}
                  >
                    <FontAwesome6 name="camera" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cameraLabel}>搜题</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
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
        name="camera"
        options={{
          title: '搜题',
          href: null,
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
        name="questions"
        options={{
          title: '题库',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'database' : 'database'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="math-practice"
        options={{
          title: '数学',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name={focused ? 'calculator' : 'calculator'}
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
      <Tabs.Screen
        name="vocab-books"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="poetry-reading"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#F0F0F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 56,
  },
  tabLabelContainer: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginTop: -20,
  },
  cameraGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 4,
  },
});
