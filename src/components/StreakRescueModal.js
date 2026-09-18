import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Shield, Tv, Crown, X, Flame } from 'lucide-react-native';

const StreakRescueModal = ({
  visible,
  habit,
  streakFreezes = 0,
  isPro = false,
  loading = false,
  onClose,
  onUseFreeze,
  onWatchAd,
  onUpgrade,
}) => {
  const theme = useTheme();
  const colors = theme?.colors || {};
  const { t } = useLanguage();

  if (!habit) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={70} tint="dark" style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: '#38BDF8' }]}>
          {/* Close button */}
          <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Ice Glow Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#06B6D4', '#38BDF8']}
              style={styles.iconGradient}
            >
              <Text style={{ fontSize: 32 }}>❄️</Text>
            </LinearGradient>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t('streakRescueModalTitle') || 'Serini Kurtar ❄️'}
          </Text>

          <View style={styles.streakBadge}>
            <Flame size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>
              {habit.streak} {t('streakDays') || 'Günlük Seri'} Tehlikede!
            </Text>
          </View>

          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            "{habit.name}" alışkanlığı dün tamamlanmadı. Zinciri kırmamak için kalkan kullanabilir veya reklam izleyebilirsin.
          </Text>

          {/* Freeze Balance Pill */}
          <View style={[styles.balancePill, { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)' }]}>
            <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '600' }}>
              ❄️ {t('streakFreezesLeft') || 'Kalan Kalkan'}: <Text style={{ fontWeight: 'bold' }}>{isPro ? 'Sınırsız (Pro)' : streakFreezes}</Text>
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {/* 1. Use Freeze Shield */}
            <TouchableOpacity activeOpacity={0.7}
              style={[styles.primaryButton, { opacity: (streakFreezes > 0 || isPro) && !loading ? 1 : 0.5 }]}
              disabled={(streakFreezes <= 0 && !isPro) || loading}
              onPress={() => onUseFreeze(habit.id)}
            >
              <LinearGradient
                colors={['#0284C7', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Shield size={18} color="white" />
                    <Text style={styles.primaryBtnText}>
                      {t('useFreezeButton') || '1 Seri Dondurma Kalkanı Kullan'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* 2. Watch Ad (Free Users or when out of freezes) */}
            {!isPro && (
              <TouchableOpacity activeOpacity={0.7}
                style={[styles.secondaryButton, { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}
                onPress={() => onWatchAd(habit.id)}
                disabled={loading}
              >
                <Tv size={18} color="#A78BFA" />
                <Text style={[styles.secondaryBtnText, { color: '#E0E7FF' }]}>
                  {t('watchAdToRescue') || '📺 Reklam İzle & Seriyi Kurtar'}
                </Text>
              </TouchableOpacity>
            )}

            {/* 3. Pro CTA */}
            {!isPro && (
              <TouchableOpacity activeOpacity={0.7}
                style={styles.proLink}
                onPress={() => {
                  onClose();
                  onUpgrade();
                }}
              >
                <Crown size={15} color="#F59E0B" />
                <Text style={styles.proLinkText}>
                  {t('upgradeForUnlimitedFreezes') || 'Sınırsız Kalkan İçin Pro\'ya Yükselt'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  streakText: {
    color: '#F59E0B',
    fontWeight: 'bold',
    fontSize: 13,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  balancePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  proLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    marginTop: 4,
  },
  proLinkText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default StreakRescueModal;
