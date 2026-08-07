import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Home, Target, Settings, Unlink, List, BarChart2 } from 'lucide-react-native';
import AdManager from '../ads/AdManager';

// Screens
import AuthScreen from '../screens/auth/AuthScreen';
import HomeScreen from '../screens/home/HomeScreen';
import HabitsScreen from '../screens/home/HabitsScreen';
import StatsScreen from '../screens/home/StatsScreen';
import FocusScreen from '../screens/focus/FocusScreen';
import BreakStreakScreen from '../screens/break/BreakStreakScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import WidgetStoreScreen from '../screens/settings/WidgetStoreScreen';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import SocialShareScreen from '../screens/social/SocialShareScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen'; // New Import
import AsyncStorage from '@react-native-async-storage/async-storage'; // New Import

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const theme = useTheme();
  const { isPro } = useUser();
  const tabChangeCount = React.useRef(0);

  return (
    <Tab.Navigator
      screenListeners={{
        state: (e) => {
          if (isPro) return;

          tabChangeCount.current += 1;
          // Show interstitial ad every 5 tab changes
          if (tabChangeCount.current >= 5) {
            if (AdManager && typeof AdManager.showInterstitial === 'function') {
              AdManager.showInterstitial();
            }
            tabChangeCount.current = 0;
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="BreakStreak"
        component={BreakStreakScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Unlink size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const theme = useTheme();
  const { user, loading } = useUser();

  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then(val => {
      setHasSeenOnboarding(val === 'true');
    });
  }, []);

  if (loading || hasSeenOnboarding === null) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer theme={{
      dark: theme.dark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.notification,
      },
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            {!hasSeenOnboarding && (
              <Stack.Screen name="Onboarding">
                {props => <OnboardingScreen {...props} onComplete={() => setHasSeenOnboarding(true)} />}
              </Stack.Screen>
            )}
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="SocialShare"
              component={SocialShareScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="WidgetStore" component={WidgetStoreScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;