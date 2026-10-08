import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useHabits } from '../../context/HabitContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, CheckCircle, XCircle, AlertTriangle, TrendingUp, Calendar, Settings as SettingsIcon, Sparkles, Shield } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Config from '../../config/Config';

let BannerAd, BannerAdSize, TestIds;
try {
  const AdMob = require('react-native-google-mobile-ads');
  BannerAd = AdMob.BannerAd;
  BannerAdSize = AdMob.BannerAdSize;
  TestIds = AdMob.TestIds;
} catch (e) {
  console.log('AdMob not available in this environment');
}

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colors = theme?.colors || {};
  const { user, isPro } = useUser();
  const { habits, breakHabits, focusState, getFocusTimeLeft } = useHabits();
  const { t } = useLanguage();

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Habits in danger of streak loss
  const habitsInDanger = (habits || []).filter(h =>
    !h.completedDates?.includes(yesterdayStr) &&
    !h.frozenDates?.includes(yesterdayStr) &&
    (h.streak > 0 || (h.completedDates && h.completedDates.length > 0))
  );

  // Stats
  const incompleteHabits = (habits || []).filter(h => !h.completedDates.includes(todayStr));
  const completedHabits = (habits || []).filter(h => h.completedDates.includes(todayStr));
  const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) : 0;

  // Break Streaks (Zincir Kırma)
  const activeBreakHabits = breakHabits || [];

  const getDaysSince = (lastBreakDate, createdAt) => {
    const referenceDate = lastBreakDate || createdAt;
    if (!referenceDate) return 0;

    const today = new Date();
    const start = new Date(referenceDate);
    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Active Focus Timer
  const [focusTimeLeft, setFocusTimeLeft] = useState(0);

  useEffect(() => {
    let interval;
    if (focusState.elapsedSeconds > 0 || focusState.isActive) {
      setFocusTimeLeft(getFocusTimeLeft());
      interval = setInterval(() => {
        setFocusTimeLeft(getFocusTimeLeft());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusState, getFocusTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActiveFocus = () => {
    if (focusState.sessionCompleted) {
      return (
        <TouchableOpacity activeOpacity={0.7}
          style={[styles.section, { backgroundColor: colors.surface, borderColor: '#10B981', borderWidth: 2 }]}
          onPress={() => navigation.navigate('Focus')}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.sectionTitle, { color: '#10B981', fontSize: 16 }]}>
                {t('focusComplete')}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('tapToManage')}</Text>
            </View>
            <CheckCircle size={32} color="#10B981" />
          </View>
        </TouchableOpacity>
      );
    }

    if (focusState.elapsedSeconds === 0 && !focusState.isActive) return null;

    return (
      <TouchableOpacity activeOpacity={0.7}
        style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 }]}
        onPress={() => navigation.navigate('Focus')}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 16 }]}>
              {focusState.isActive ? t('focusing') : t('focusPaused')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('tapToManage')}</Text>
          </View>
          <Text style={{ fontSize: 32, fontWeight: 'bold', fontVariant: ['tabular-nums'], color: colors.text }}>
            {formatTime(focusTimeLeft)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>{t('welcome')}</Text>
        <Text style={[styles.greetingTitle, { color: colors.text }]}>{user?.name || 'Guest'}</Text>
      </View>
      <View style={styles.headerActions}>
        {!isPro && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Paywall')}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.proBadge}
            >
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <SettingsIcon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStreakDangerAlert = () => {
    if (habitsInDanger.length === 0) return null;

    return (
      <TouchableOpacity
        style={[styles.dangerAlertBox, { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderColor: '#06B6D4' }]}
        onPress={() => navigation.navigate('Habits')}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View style={styles.iceShieldBox}>
            <Shield size={18} color="#06B6D4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: 13 }}>
              ❄️ {habitsInDanger.length} {t('streakInDanger') || 'Alışkanlığın Serisi Dün Aksadı!'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {t('rescueStreak') || 'Serini kurtarmak için dokun.'}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color="#38BDF8" />
      </TouchableOpacity>
    );
  };

  const renderAICoachInsight = () => (
    <TouchableOpacity
      style={[styles.aiCoachBanner, { backgroundColor: colors.surface, borderColor: isPro ? '#8B5CF6' : colors.border }]}
      onPress={() => navigation.navigate('Stats')}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isPro ? ['rgba(139, 92, 246, 0.15)', 'rgba(217, 70, 239, 0.05)'] : ['rgba(255,255,255,0.03)', 'transparent']}
        style={styles.aiCoachBannerGradient}
      >
        <View style={styles.aiBannerLeft}>
          <LinearGradient colors={['#8B5CF6', '#D946EF']} style={styles.aiBannerIcon}>
            <Sparkles size={16} color="white" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiBannerTitle, { color: colors.text }]}>
              {t('aiCoachTitle') || '✨ Onyx AI Habit Coach'}
            </Text>
            <Text style={[styles.aiBannerDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {isPro
                ? (t('aiCoachSubtitle') || 'Haftalık kişiselleştirilmiş içgörülerin hazır.')
                : (t('aiCoachTeaser') || 'Alışkanlıkların analiz edildi. Raporunu incele.')}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={isPro ? '#A855F7' : colors.textSecondary} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderShortReport = () => (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('shortReport')}</Text>
        <TrendingUp size={20} color={colors.primary} />
      </View>

      <View style={styles.reportContent}>
        <View style={styles.reportItem}>
          <Text style={[styles.reportValue, { color: colors.primary }]}>{Math.round(completionRate * 100)}%</Text>
          <Text style={[styles.reportLabel, { color: colors.textSecondary }]}>{t('dailyGoals')}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.reportItem}>
          <Text style={[styles.reportValue, { color: '#10B981' }]}>{completedHabits.length}</Text>
          <Text style={[styles.reportLabel, { color: colors.textSecondary }]}>{t('success')}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.reportItem}>
          <Text style={[styles.reportValue, { color: '#EF4444' }]}>{incompleteHabits.length}</Text>
          <Text style={[styles.reportLabel, { color: colors.textSecondary }]}>{t('incompleteHabits')}</Text>
        </View>
      </View>

      <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${completionRate * 100}%` }]}
        />
      </View>
    </View>
  );

  const renderIncompleteHabits = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('incompleteHabits')}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Habits')}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {incompleteHabits.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CheckCircle size={40} color="#10B981" />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('perfectScoreMsg')}</Text>
        </View>
      ) : (
        incompleteHabits.slice(0, 3).map((habit, index) => (
          <TouchableOpacity activeOpacity={0.7}
            key={habit.id}
            style={[styles.miniHabitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Habits')}
          >
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.miniHabitText, { color: colors.text }]}>{habit.name}</Text>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderBreakStreaks = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('breakStreakTodos')}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('BreakStreak')}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {activeBreakHabits.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noBreakHabits')}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: -4 }}>
          {activeBreakHabits.map(habit => {
            const daysClean = getDaysSince(habit.lastBreakDate, habit.createdAt);
            return (
              <TouchableOpacity activeOpacity={0.7}
                key={habit.id}
                style={[styles.breakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('BreakStreak')}
              >
                <Text style={[styles.breakCardTitle, { color: colors.text }]} numberOfLines={1}>{habit.name}</Text>
                <View style={styles.breakCardStat}>
                  <Text style={[styles.breakCardValue, { color: colors.primary }]}>{daysClean}</Text>
                  <Text style={[styles.breakCardLabel, { color: colors.textSecondary }]}>{t('streakDays')}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 10, 48),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderStreakDangerAlert()}
        {renderActiveFocus()}
        {renderAICoachInsight()}
        {renderShortReport()}
        {renderIncompleteHabits()}
        {renderBreakStreaks()}

        {/* Banner Ad Space at Bottom of Scroll if needed, but keeping it fixed usually better */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Banner Ad */}
      {!isPro && BannerAd && (
        <View style={styles.bannerAdContainer}>
          <BannerAd
            unitId={__DEV__ ? TestIds.BANNER : Config.ADMOB_BANNER_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSub: { fontSize: 14 },
  greetingTitle: { fontSize: 24, fontWeight: 'bold' },
  proBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  proBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  // Section Box
  section: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportItem: {
    alignItems: 'center',
    flex: 1,
  },
  reportValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 30,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Section Headers
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Mini Habit Card
  miniHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  miniHabitText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },

  // Empty State
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },

  // Break Streak Card
  breakCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    marginLeft: 4,
  },
  breakCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakCardStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  breakCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  breakCardLabel: {
    fontSize: 12,
  },

  // Banner
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  dangerAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  iceShieldBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCoachBanner: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  aiCoachBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  aiBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  aiBannerDesc: {
    fontSize: 11,
    marginTop: 1,
  },
});

export default HomeScreen;
