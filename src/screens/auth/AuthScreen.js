import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe } from 'lucide-react-native';

const AuthScreen = () => {
  const theme = useTheme();
  const { login } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = ['English', 'Turkish', 'Spanish', 'German', 'Italian', 'Russian', 'Chinese'];

  useEffect(() => {
    checkReturningUser();
  }, []);

  const checkReturningUser = async () => {
    try {
      const hasVisited = await AsyncStorage.getItem('hasVisited');
      setIsReturningUser(!!hasVisited);
      if (!hasVisited) {
        await AsyncStorage.setItem('hasVisited', 'true');
      }
    } catch (error) {
      console.error('Failed to check user status:', error);
    }
  };

  const handleLogin = (method) => {
    const userData = {
      id: '1',
      name: 'User',
      email: method === 'email' ? 'user@example.com' : null,
      method
    };
    login(userData);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.background}
      />

      {/* Language Button */}
      <TouchableOpacity
        style={[styles.langButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Globe size={20} color={theme.colors.text} />
        <Text style={[styles.langButtonText, { color: theme.colors.text }]}>{language.substring(0, 2).toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>ONYX</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('habitTrackerFocus')}
          </Text>
          {isReturningUser && (
            <Text style={[styles.welcomeText, { color: theme.colors.text, marginTop: 16 }]}>
              {t('welcomeBack')}
            </Text>
          )}
          {!isReturningUser && (
            <Text style={[styles.welcomeText, { color: theme.colors.text, marginTop: 16 }]}>
              {t('newUser')}
            </Text>
          )}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {isReturningUser ? t('loginWithGoogle') : t('signupWithGoogle')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('email')}
          >
            <Ionicons name="mail" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {isReturningUser ? t('loginWithEmail') : t('signupWithEmail')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('phone')}
          >
            <Ionicons name="call" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {isReturningUser ? t('loginWithPhone') : t('signupWithPhone')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>
            <ScrollView>
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => { setLanguage(lang); setLanguageModalVisible(false); }}
                >
                  <Text style={[styles.langText, { color: language === lang ? theme.colors.primary : theme.colors.text }]}>{lang}</Text>
                  {language === lang && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} onPress={() => setLanguageModalVisible(false)}>
              <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  langButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  langButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  langText: { fontSize: 16 },
  closeButton: { marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
});

export default AuthScreen;
