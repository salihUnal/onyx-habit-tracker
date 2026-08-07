import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Shield, Moon, Layout, Unlink, Check } from 'lucide-react-native';

let Purchases;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.log('Purchases (RevenueCat) not available');
}

let AdManager;
try {
  AdManager = require('../../ads/AdManager').default;
} catch (e) {
  console.log('AdManager not available');
}

const PaywallScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { upgradeToPro, restorePurchases } = useUser();
  const { rewardExtraHabit, repairStreak } = useHabits();
  const { t } = useLanguage();
  const { trigger } = route.params || {};

  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [offerings, setOfferings] = React.useState(null);

  React.useEffect(() => {
    if (Purchases) fetchOfferings();
    if (AdManager) AdManager.init(); // Initialize AdMob
  }, []);

  const fetchOfferings = async () => {
    if (!Purchases) return;
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        setOfferings(offerings.current);
      }
    } catch (e) {
      console.error('Fetch Offerings Error:', e);
    }
  };

  const startAd = () => {
    if (!AdManager) {
      // Fallback: Directly reward for testing in Expo Go
      if (__DEV__) {
        console.log('AdManager not found - rewarding directly (DEV only)');
        giveReward();
      }
      return;
    }
    AdManager.showRewarded(
      async (reward) => {
        giveReward();
      },
      () => {
        // Ad closed
        console.log('Ad closed');
      }
    );
  };

  const giveReward = async () => {
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

  const handlePurchase = async (pkg) => {
    const success = await upgradeToPro(pkg);
    if (success) {
      setSuccessMessage('Onyx Pro Başarıyla Aktif Edildi!');
      setSuccessModalVisible(true);
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      setSuccessMessage('Satın alımlar başarıyla geri yüklendi!');
      setSuccessModalVisible(true);
    }
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
            {t('unlockPotantial') || 'Tam Potansiyelini Aç'}
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow
            icon={Zap}
            title={t('unlimitedHabits') || "Sınırsız Alışkanlık"}
            description={t('unlimitedHabitsDesc') || "İstediğin kadar alışkanlık takip et"}
          />
          <FeatureRow
            icon={Moon}
            title={t('darkMode') || "Karanlık Mod & Temalar"}
            description={t('darkModeDesc') || "Özel neon temalara eriş"}
          />
          <FeatureRow
            icon={Layout}
            title={t('proWidgets') || "Pro Widgetlar"}
            description={t('proWidgetsDesc') || "Ana ekranını özelleştir"}
          />
          <FeatureRow
            icon={Unlink}
            title={t('breakStreaks') || "Zincir Kırma"}
            description={t('breakStreaksDesc') || "Kötü alışkanlıkları ve bağımlılıkları yen"}
          />
          <FeatureRow
            icon={Shield}
            title={t('noAds') || "Reklamsız"}
            description={t('noAdsDesc') || "Dikkat dağıtmayan deneyim"}
          />
        </View>

        <View style={styles.pricingContainer}>
          {offerings && offerings.availablePackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              onPress={() => handlePurchase(pkg)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={pkg.packageType === 'LIFETIME' ? [theme.colors.primary, theme.colors.secondary] : [theme.colors.card, theme.colors.card]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.purchaseButton, pkg.packageType !== 'LIFETIME' && { borderWidth: 1, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.purchaseButtonText, pkg.packageType !== 'LIFETIME' && { color: theme.colors.text }]}>
                  {pkg.product.title}
                </Text>
                <Text style={[styles.priceText, pkg.packageType !== 'LIFETIME' && { color: theme.colors.textSecondary }]}>
                  {pkg.product.priceString} / {pkg.packageType === 'LIFETIME' ? t('lifetime') : pkg.packageType === 'ANNUAL' ? t('annual') : t('monthly')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {!offerings && (
            <View style={{ gap: 4 }}>
              <TouchableOpacity onPress={() => handlePurchase(null)} activeOpacity={0.9}>
                <View style={[styles.purchaseButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, shadowOpacity: 0.1, elevation: 2 }]}>
                  <Text style={[styles.purchaseButtonText, { color: theme.colors.text }]}>{t('monthlyPro') || 'Aylık Pro'}</Text>
                  <Text style={[styles.priceText, { color: theme.colors.textSecondary }]}>$2.99 / {t('monthly') || 'Aylık'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handlePurchase(null)} activeOpacity={0.9}>
                <View style={[styles.purchaseButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, shadowOpacity: 0.1, elevation: 2 }]}>
                  <Text style={[styles.purchaseButtonText, { color: theme.colors.text }]}>{t('annualPro') || 'Yıllık Pro'}</Text>
                  <Text style={[styles.priceText, { color: theme.colors.textSecondary }]}>$19.99 / {t('annual') || 'Yıllık'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handlePurchase(null)} activeOpacity={0.9}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.purchaseButton}
                >
                  <Text style={styles.purchaseButtonText}>{t('unlockLifetime') || 'Ömür Boyu Pro'}</Text>
                  <Text style={styles.priceText}>$29.99 / {t('lifetime') || 'Ömür Boyu'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
              {t('restorePurchase') || 'Satın Alımı Geri Yükle'}
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
