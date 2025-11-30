import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Home, Target, Settings, Unlink } from 'lucide-react-native';

// Screens
import AuthScreen from '../screens/auth/AuthScreen';
import HomeScreen from '../screens/home/HomeScreen';
import FocusScreen from '../screens/focus/FocusScreen';
import BreakStreakScreen from '../screens/break/BreakStreakScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import WidgetStoreScreen from '../screens/settings/WidgetStoreScreen';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import SocialShareScreen from '../screens/social/SocialShareScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
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

  if (loading) {
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
          <Stack.Screen name="Auth" component={AuthScreen} />
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