import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const defaultLanguageContext = {
  language: 'English',
  setLanguage: () => { },
  t: (key) => key,
};

const LanguageContext = createContext(defaultLanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
