import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ImageBackground } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Zap } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const AuthScreen = () => {
  const theme = useTheme();
  const { login, googleLogin } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Türkçe', label: 'Türkçe' },
    { code: 'Spanish', label: 'Español' },
    { code: 'German', label: 'Deutsch' },
    { code: 'Italian', label: 'Italiano' },
    { code: 'Russian', label: 'Русский' },
    { code: 'Chinese', label: '中文' }
  ];

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
    if (method === 'google') {
      googleLogin();
    } else {
      // For now, only Google is implemented with Firebase
      alert(t('comingSoon') || 'Coming Soon');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, '#1a1a2e', '#000000']}
        style={styles.background}
      />

      {/* Decorative Elements */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      {/* Language Button */}
      <TouchableOpacity
        style={[styles.langButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Globe size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.langButtonText, { color: theme.colors.textSecondary }]}>{language.substring(0, 2).toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.logoGradient}
            >
              <Zap size={40} color="white" fill="white" />
            </LinearGradient>
          </View>
          <Text style={[styles.title, { textShadowColor: theme.colors.primary }]}>ONYX</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('habitTrackerFocus')}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              {isReturningUser ? t('welcomeBack') : t('newUser')}
            </Text>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'white' }]}
                onPress={() => handleLogin('google')}
              >
                <Ionicons name="logo-google" size={20} color="black" style={styles.icon} />
                <Text style={[styles.buttonText, { color: 'black' }]}>
                  {isReturningUser ? t('continueWithGoogle') : t('signupWithGoogle')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => handleLogin('email')}
              >
                <Ionicons name="mail" size={20} color="white" style={styles.icon} />
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {isReturningUser ? t('continueWithEmail') : t('signupWithEmail')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => handleLogin('phone')}
              >
                <Ionicons name="call" size={20} color="white" style={styles.icon} />
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {isReturningUser ? t('continueWithPhone') : t('signupWithPhone')}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
        <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => { setLanguage(lang.code); setLanguageModalVisible(false); }}
                >
                  <Text style={[styles.langText, { color: language === lang.code ? theme.colors.primary : theme.colors.text }]}>{lang.label}</Text>
                  {language === lang.code && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} onPress={() => setLanguageModalVisible(false)}>
              <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
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
  glowOrbTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6366F1',
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#D946EF',
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  langButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  langButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-10deg' }]
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 8,
    color: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  cardContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  card: {
    padding: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
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
    fontWeight: 'bold',
  },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  langText: { fontSize: 16, fontWeight: '500' },
  closeButton: { marginTop: 24, padding: 16, borderRadius: 16, alignItems: 'center' },
});

export default AuthScreen;
