import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const defaultLanguageContext = {
  language: 'English',
  setLanguage: () => { },
  t: (key) => key,
};

const LanguageContext = createContext(defaultLanguageContext);

// Map system locales to our supported languages
const localeMap = {
  en: 'English',
  tr: 'Turkish',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  ru: 'Russian',
  zh: 'Chinese',
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('English');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');

      if (savedLanguage) {
        // Use saved language
        setLanguageState(savedLanguage);
      } else {
        // First launch: detect system language
        const systemLocale = Localization.getLocales()[0]?.languageCode || 'en';
        const detectedLanguage = localeMap[systemLocale] || 'English';
        setLanguageState(detectedLanguage);
        await AsyncStorage.setItem('appLanguage', detectedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      setLanguageState('English');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('appLanguage', newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
