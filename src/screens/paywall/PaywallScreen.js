import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Shield, Moon, Layout, Unlink, Check } from 'lucide-react-native';

const PaywallScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { upgradeToPro } = useUser();
  const { rewardExtraHabit, repairStreak } = useHabits();
  const { t } = useLanguage();
  const { trigger } = route.params || {};

  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const startAd = async () => {
    // Directly give reward without showing ad overlay (same as HomeScreen)
    if (trigger === 'streak_repair') {
      const { habitId } = route.params;
      await repairStreak(habitId);
      setSuccessMessage('Seri Başarıyla Onarıldı!');
    } else if (trigger === 'break_habit_limit') {
      await rewardExtraHabit();
      setSuccessMessage('Ödül Kazanıldı! 1 saat içinde yeni kötü alışkanlık ekleyebilirsin.');
    } else if (trigger === 'focus_limit') {
      await rewardExtraHabit();
      setSuccessMessage('Ödül Kazanıldı! Ekstra odaklanma oturumu hakkı kazandın.');
    } else {
      await rewardExtraHabit();
      setSuccessMessage('Ödül Kazanıldı! 1 saat içinde yeni alışkanlık ekleyebilirsin.');
    }
    setSuccessModalVisible(true);
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  const handlePurchase = async () => {
    await upgradeToPro();
    navigation.goBack();
  };

  const FeatureRow = ({ icon: Icon, title, description }) => (
    <View style={styles.featureRow}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.iconContainer}
      >
        <Icon size={24} color="white" />
      </LinearGradient>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.heroIcon}
          >
            <Zap size={48} color="white" fill="white" />
          </LinearGradient>
          <Text style={[styles.title, { color: theme.colors.text }]}>ONYX <Text style={{ color: theme.colors.primary }}>PRO</Text></Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Tam Potansiyelini Aç
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow
            icon={Zap}
            title="Sınırsız Alışkanlık"
            description="İstediğin kadar alışkanlık takip et"
          />
          <FeatureRow
            icon={Moon}
            title="Karanlık Mod & Temalar"
            description="Özel neon temalara eriş"
          />
          <FeatureRow
            icon={Layout}
            title="Pro Widgetlar"
            description="Ana ekranını özelleştir"
          />
          <FeatureRow
            icon={Unlink}
            title="Zincir Kırma"
            description="Kötü alışkanlıkları ve bağımlılıkları yen"
          />
          <FeatureRow
            icon={Shield}
            title="Reklamsız"
            description="Dikkat dağıtmayan deneyim"
          />
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity onPress={handlePurchase} activeOpacity={0.9}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseButton}
            >
              <Text style={styles.purchaseButtonText}>Ömür Boyu Erişimi Aç</Text>
              <Text style={styles.priceText}>$29.99 / Ömür Boyu</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
              Satın Alımı Geri Yükle
            </Text>
          </TouchableOpacity>

          {(trigger === 'habit_limit' || trigger === 'break_habit_limit' || trigger === 'streak_repair' || trigger === 'focus_limit') && (
            <TouchableOpacity
              style={styles.watchAdButton}
              onPress={startAd}
            >
              <Text style={[styles.watchAdText, { color: theme.colors.textSecondary }]}>
                {trigger === 'streak_repair' ? 'Reklam İzleyerek Onar' :
                  trigger === 'break_habit_limit' ? 'Reklam İzleyerek Kötü Alışkanlık Ekle' :
                    trigger === 'focus_limit' ? 'Reklam İzleyerek Odaklanmaya Başla' :
                      'Reklam İzleyerek Alışkanlık Ekle'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.modalIconContainer}
            >
              <Check size={32} color="white" />
            </LinearGradient>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Harika!</Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>{successMessage}</Text>
            <TouchableOpacity onPress={closeSuccessModal} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.modalButtonText}>Tamam</Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  features: {
    gap: 32,
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  pricingContainer: {
    marginTop: 'auto',
  },
  purchaseButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  watchAdButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  watchAdText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaywallScreen;
