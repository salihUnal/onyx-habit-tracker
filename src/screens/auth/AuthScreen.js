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
import { TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';


const AuthScreen = () => {
  const theme = useTheme();
  const { login, loginWithDummyUser, googleLogin, emailLogin, emailSignup, resetPassword } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);


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
    } else if (method === 'email') {
      setIsSignup(false);
      setEmailModalVisible(true);
    } else {
      Alert.alert(t('comingSoon') || 'Coming Soon');
    }
  };

  const openForgotPasswordModal = () => {
    setResetEmail(email ? email.trim() : '');
    setForgotPasswordModalVisible(true);
  };

  const handleSendResetEmail = async () => {
    const trimmed = resetEmail.trim();
    if (!trimmed) {
      Alert.alert(t('warning') || 'Uyarı', t('enterEmailForReset') || 'Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(trimmed);
    setResetLoading(false);

    if (res.success) {
      setForgotPasswordModalVisible(false);
      Alert.alert(
        t('emailSent') || 'Bağlantı Gönderildi',
        `${trimmed}\n\n${t('resetEmailSentDesc') || 'Şifre belirleme/sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz.'}\n\n${t('checkSpamNotice') || 'Not: E-posta birkaç dakika içinde gelmezse lütfen Spam/Gereksiz klasörünü kontrol ediniz.'}`,
        [{ text: t('ok') || 'Tamam' }]
      );
    } else {
      if (res.code === 'auth/operation-not-allowed' || res.error?.includes('operation-not-allowed')) {
        Alert.alert(
          t('operationNotAllowedTitle') || 'E-posta Sağlayıcısı Kapalı',
          'Firebase Konsolunda "Email/Password" sağlayıcısı henüz aktif edilmemiştir.\n\nSıfırlama bağlantısı gönderebilmek için lütfen Firebase Konsolu -> Authentication -> Sign-in method sekmesinden "Email/Password" seçeneğini etkinleştiriniz.',
          [{ text: t('ok') || 'Tamam' }]
        );
      } else if (res.code === 'auth/user-not-found' || res.error?.includes('user-not-found')) {
        Alert.alert(
          t('accountNotFoundTitle') || 'Hesap Bulunamadı',
          t('accountNotFoundDesc') || 'Bu e-posta adresine ait bir hesap bulunamadı.'
        );
      } else if (res.code === 'auth/invalid-email' || res.error?.includes('invalid-email')) {
        Alert.alert(
          t('invalidEmailTitle') || 'Geçersiz E-posta',
          t('invalidEmail') || 'Lütfen geçerli bir e-posta adresi giriniz.'
        );
      } else {
        Alert.alert(t('error') || 'Hata', res.error || 'E-posta gönderilemedi.');
      }
    }
  };



  const handleAuthError = (result) => {
    const code = result?.code || '';
    const rawError = result?.error || '';

    // 1. E-posta Zaten Kullanımda (Kayıt ekranında)
    if (code === 'auth/email-already-in-use' || rawError.includes('email-already-in-use')) {
      Alert.alert(
        t('accountAlreadyExists') || 'Hesap Zaten Mevcut',
        t('emailAlreadyInUse') || 'Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapmak ister misiniz?',
        [
          {
            text: t('cancel') || 'İptal',
            style: 'cancel',
          },
          {
            text: t('login') || 'Giriş Yap',
            onPress: () => {
              setIsSignup(false);
            },
          },
        ]
      );
      return;
    }

    // 2. Yanlış Şifre / Kimlik Doğrulama Hatası
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      rawError.includes('wrong-password') ||
      rawError.includes('invalid-credential')
    ) {
      Alert.alert(
        t('loginFailed') || 'Giriş Yapılamadı',
        t('wrongPasswordDesc') || 'Girdiğiniz şifre hatalı. Eğer bu hesabı Google ile açtıysanız henüz bir şifreniz olmayabilir. Google ile giriş yapabilir veya şifre belirleme bağlantısı isteyebilirsiniz.',
        [
          { text: t('retry') || 'Tekrar Dene', style: 'cancel' },
          {
            text: t('sendResetLink') || 'Şifre Belirle / Sıfırla',
            onPress: () => openForgotPasswordModal(),
          },
          {
            text: t('continueWithGoogle') || 'Google ile Giriş Yap',
            onPress: () => {
              setEmailModalVisible(false);
              handleLogin('google');
            },
          },
        ]
      );
      return;
    }

    // 3. E-posta/Şifre Giriş Yöntemi Kapalı veya Google Hesabı (auth/operation-not-allowed)
    if (code === 'auth/operation-not-allowed' || rawError.includes('operation-not-allowed')) {
      Alert.alert(
        t('operationNotAllowedTitle') || 'E-posta ile Giriş Devre Dışı / Google Hesabı',
        t('operationNotAllowedDesc') || 'Bu hesap Google ile oluşturulmuş olabilir veya Firebase konsolunda E-posta/Şifre sağlayıcısı henüz aktif edilmemiştir. Google ile giriş yapmak ister misiniz?',
        [
          { text: t('cancel') || 'İptal', style: 'cancel' },
          {
            text: t('continueWithGoogle') || 'Google ile Giriş Yap',
            onPress: () => {
              setEmailModalVisible(false);
              handleLogin('google');
            },
          },
        ]
      );
      return;
    }

    // 4. Hesap Bulunamadı
    if (code === 'auth/user-not-found' || rawError.includes('user-not-found')) {
      Alert.alert(
        t('accountNotFoundTitle') || 'Hesap Bulunamadı',
        t('accountNotFoundDesc') || 'Bu e-posta adresine ait bir hesap bulunamadı. Yeni bir hesap oluşturmak ister misiniz?',
        [
          { text: t('cancel') || 'İptal', style: 'cancel' },
          {
            text: t('signup') || 'Kayıt Ol',
            onPress: () => {
              setIsSignup(true);
            },
          },
        ]
      );
      return;
    }

    // 5. Geçersiz E-posta
    if (code === 'auth/invalid-email' || rawError.includes('invalid-email')) {
      Alert.alert(
        t('invalidEmailTitle') || 'Geçersiz E-posta',
        t('invalidEmail') || 'Lütfen geçerli formatta bir e-posta adresi giriniz.'
      );
      return;
    }

    // 6. Zayıf Şifre
    if (code === 'auth/weak-password' || rawError.includes('weak-password')) {
      Alert.alert(
        t('weakPasswordTitle') || 'Şifre Yetersiz',
        t('weakPassword') || 'Şifreniz en az 6 karakter olmalıdır.'
      );
      return;
    }

    // 7. Çok Fazla Deneme
    if (code === 'auth/too-many-requests' || rawError.includes('too-many-requests')) {
      Alert.alert(
        t('tooManyRequestsTitle') || 'Çok Fazla Deneme Yapıldı',
        t('tooManyRequests') || 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyiniz veya şifrenizi sıfırlayınız.',
        [
          { text: t('cancel') || 'Tamam', style: 'cancel' },
          {
            text: t('sendResetLink') || 'Şifremi Sıfırla',
            onPress: () => openForgotPasswordModal(),
          },
        ]
      );
      return;
    }

    // 8. Ağ Hatası
    if (code === 'auth/network-request-failed' || rawError.includes('network-request-failed')) {
      Alert.alert(
        t('networkErrorTitle') || 'Bağlantı Hatası',
        t('networkError') || 'Ağ hatası. Lütfen internet bağlantınızı kontrol ediniz.'
      );
      return;
    }

    Alert.alert(t('error') || 'Hata', rawError || 'Bir hata oluştu.');
  };

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password || (isSignup && !trimmedName)) {
      Alert.alert(t('warning') || 'Uyarı', t('fillAllFields') || 'Lütfen tüm alanları doldurun');
      return;
    }

    setAuthLoading(true);
    let result;
    if (isSignup) {
      result = await emailSignup(trimmedEmail, password, trimmedName);
    } else {
      result = await emailLogin(trimmedEmail, password);
    }
    setAuthLoading(false);

    if (result.success) {
      setEmailModalVisible(false);
    } else {
      handleAuthError(result);
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
      <TouchableOpacity activeOpacity={0.7}
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
              <TouchableOpacity activeOpacity={0.7}
                style={[styles.button, { backgroundColor: 'white' }]}
                onPress={() => handleLogin('google')}
              >
                <Ionicons name="logo-google" size={20} color="black" style={styles.icon} />
                <Text style={[styles.buttonText, { color: 'black' }]}>
                  {isReturningUser ? t('continueWithGoogle') : t('signupWithGoogle')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}
                style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => handleLogin('email')}
              >
                <Ionicons name="mail" size={20} color="white" style={styles.icon} />
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {isReturningUser ? t('continueWithEmail') : t('signupWithEmail')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}
                style={[styles.button, { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: '#6366F1' }]}
                onPress={() => setDemoModalVisible(true)}
              >
                <Ionicons name="flask-outline" size={20} color="#A5B4FC" style={styles.icon} />
                <Text style={[styles.buttonText, { color: '#E0E7FF' }]}>
                  🧪 Test / Demo Girişi
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
                <TouchableOpacity activeOpacity={0.7}
                  key={lang.code}
                  style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => { setLanguage(lang.code); setLanguageModalVisible(false); }}
                >
                  <Text style={[styles.langText, { color: language === lang.code ? theme.colors.primary : theme.colors.text }]}>{lang.label}</Text>
                  {language === lang.code && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.7} style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} onPress={() => setLanguageModalVisible(false)}>
              <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
      <Modal visible={emailModalVisible} transparent animationType="slide" onRequestClose={() => setEmailModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {isSignup ? t('signupWithEmail') : t('loginWithEmail')}
              </Text>

              <View style={styles.inputContainer}>
                {isSignup && (
                  <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder={t('name') || 'Name'}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                )}
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder={t('email') || 'Email'}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder={t('password') || 'Password'}
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                {!isSignup && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={openForgotPasswordModal}
                    style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 }}
                  >
                    <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
                      {t('forgotPassword') || 'Şifremi Unuttum / Şifre Belirle'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleEmailAuth}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.mainButtonText}>
                    {isSignup ? t('signup') : t('login')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsSignup(!isSignup)}
                style={styles.switchButton}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, width: '100%' }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Text style={{ marginHorizontal: 12, color: theme.colors.textSecondary, fontSize: 12 }}>
                  {t('or') || 'veya'}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  marginBottom: 12,
                }}
                onPress={() => {
                  setEmailModalVisible(false);
                  handleLogin('google');
                }}
              >
                <Ionicons name="logo-google" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
                  {t('continueWithGoogle') || 'Google ile Devam Et'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setEmailModalVisible(false)}
              >
                <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Forgot / Set Password Modal */}
      <Modal visible={forgotPasswordModalVisible} transparent animationType="slide" onRequestClose={() => setForgotPasswordModalVisible(false)}>
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('resetPasswordTitle') || 'Şifre Sıfırlama / Belirleme'}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 16, lineHeight: 18, textAlign: 'center' }}>
              {t('resetPasswordPrompt') || 'Şifrenizi sıfırlamak veya Google hesabınıza yeni bir şifre tanımlamak için lütfen e-posta adresinizi giriniz.'}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder={t('email') || 'Email'}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
            </View>

            <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.25)' }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, lineHeight: 16 }}>
                {t('resetEmailNotice') || 'ℹ️ Gönderilen e-postanın gelen kutunuza düşmesi birkaç dakika sürebilir. Lütfen Spam/Gereksiz klasörünü de kontrol ediniz.'}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSendResetEmail}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {t('sendResetLink') || 'Sıfırlama Bağlantısı Gönder'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setForgotPasswordModalVisible(false)}
            >
              <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Demo / Dummy Users Modal */}
      <Modal visible={demoModalVisible} transparent animationType="fade" onRequestClose={() => setDemoModalVisible(false)}>
        <BlurView intensity={70} tint="dark" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>🧪 Test Profili Seçin</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
              Uygulamanın tüm özelliklerini anında test edebileceğiniz hazır profiller:
            </Text>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.demoOptionCard, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}
              onPress={async () => {
                setDemoModalVisible(false);
                await loginWithDummyUser('FREE');
              }}
            >
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16 }}>Alex Rivera (Free Tester)</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                • 3 Alışkanlık sınırı (4. alışkanlıkta Paywall açılır){'\n'}
                • Standart reklam ve sosyal paylaşım filigranı
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.demoOptionCard, { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.12)', marginTop: 12 }]}
              onPress={async () => {
                setDemoModalVisible(false);
                await loginWithDummyUser('PRO');
              }}
            >
              <Text style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: 16 }}>Sarah Connor (Pro Tester)</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                • Sınırsız alışkanlık (6 aktif alışkanlık yüklü){'\n'}
                • 42 günlük yüksek streak & Pomodoro seansları
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.demoOptionCard, { borderColor: theme.colors.border, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginTop: 12 }]}
              onPress={async () => {
                setDemoModalVisible(false);
                await loginWithDummyUser('CLEAN');
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 16 }}>Yeni Kullanıcı (Sıfır Alışkanlık)</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                • Boş başlangıç deneyimi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}
              style={[styles.closeButton, { backgroundColor: theme.colors.surface, marginTop: 20 }]}
              onPress={() => setDemoModalVisible(false)}
            >
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
  inputContainer: { gap: 12, marginBottom: 24 },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  mainButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  demoOptionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
});

export default AuthScreen;
