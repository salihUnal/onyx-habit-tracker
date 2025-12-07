import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useHabits } from '../../context/HabitContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, CheckCircle, XCircle, AlertTriangle, TrendingUp, Calendar } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const HomeScreen = ({ navigation }) => {
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

  // Stats
  const incompleteHabits = (habits || []).filter(h => !h.completedDates.includes(todayStr));
  const completedHabits = (habits || []).filter(h => h.completedDates.includes(todayStr));
  const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) : 0;

  // Break Streaks (Zincir Kırma)
  const activeBreakHabits = breakHabits || [];

  const getDaysSince = (lastBreakDate) => {
    if (!lastBreakDate) return 0;
    const today = new Date();
    const lastBreak = new Date(lastBreakDate);
    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    lastBreak.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastBreak);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <TouchableOpacity
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
      <TouchableOpacity
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
      <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
        {!isPro && (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.proBadge}
          >
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
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
        <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
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
          <TouchableOpacity
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
        <TouchableOpacity onPress={() => navigation.navigate('BreakStreak')}>
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
            const daysClean = getDaysSince(habit.lastBreakDate);
            return (
              <TouchableOpacity
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderActiveFocus()}
        {renderShortReport()}
        {renderIncompleteHabits()}
        {renderBreakStreaks()}

        {/* Banner Ad Space at Bottom of Scroll if needed, but keeping it fixed usually better */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Banner Ad */}
      {!isPro && (
        <TouchableOpacity
          style={[styles.bannerAd, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
          onPress={() => navigation.navigate('Paywall')}
        >
          <View style={styles.adLabelContainer}>
            <Text style={styles.adLabel}>Ad</Text>
          </View>
          <View style={styles.adContent}>
            <Text style={[styles.adTitle, { color: colors.text }]}>{t('unlockOnyxPro') || 'Unlock Onyx Pro'}</Text>
            <Text style={[styles.adDesc, { color: colors.textSecondary }]}>{t('removeAdsDesc')}</Text>
          </View>
          <View style={[styles.adButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.adButtonText}>{t('upgrade') || 'Upgrade'}</Text>
          </View>
        </TouchableOpacity>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  bannerAd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adLabelContainer: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  adLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adContent: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  adDesc: {
    fontSize: 10,
  },
  adButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
