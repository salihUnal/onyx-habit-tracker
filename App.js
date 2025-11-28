import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import { HabitProvider } from './src/context/HabitContext';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <HabitProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </HabitProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}