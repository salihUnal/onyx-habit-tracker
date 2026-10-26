import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import { HabitProvider } from './src/context/HabitContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AdManager from './src/ads/AdManager';

// Üçüncü parti kütüphanelerin (expo-firebase-recaptcha vb.) zararsız defaultProps uyarılarını gizle
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
]);

// Durum çubuğu sistem temasını değil uygulama temasını izlemeli; aksi halde koyu temada ikonlar görünmez
function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}

export default function App() {
  useEffect(() => {
    if (AdManager && typeof AdManager.init === 'function') {
      AdManager.init();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <HabitProvider>
              <ThemedStatusBar />
              <AppNavigator />
            </HabitProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}