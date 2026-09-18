import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { BarChart2, TrendingUp, Calendar, Award, Zap, ChevronRight, Clock, Lock, Sparkles, RefreshCw, Flame, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateAICoachReport } from '../../services/AICoachService';

const { width } = Dimensions.get('window');

const StatsScreen = ({ navigation }) => {
    const theme = useTheme();
    const { habits, breakHabits, focusHistory } = useHabits();
    const { t, language } = useLanguage();
    const { isPro, user } = useUser();

    // AI Coach State
    const [coachReport, setCoachReport] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);

    const loadCoach = async (force = false) => {
        setCoachLoading(true);
        try {
            const report = await generateAICoachReport({
                habits,
                breakHabits,
                focusHistory,
                language,
                userName: user?.name || 'Champion',
                forceRefresh: force,
            });
            setCoachReport(report);
        } catch (e) {
            console.log('Error generating AI coach report:', e);
        } finally {
            setCoachLoading(false);
        }
    };

    useEffect(() => {
        loadCoach();
    }, [habits, breakHabits, language, isPro]);

    // Calculate Weekly Completion Data
    const getWeeklyData = () => {
        const days = [t('sun') || 'Sun', t('mon') || 'Mon', t('tue') || 'Tue', t('wed') || 'Wed', t('thu') || 'Thu', t('fri') || 'Fri', t('sat') || 'Sat'];
        const data = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        habits.forEach(habit => {
            habit.completedDates.forEach(dateStr => {
                const date = new Date(dateStr);
                date.setHours(0, 0, 0, 0);

                const diffTime = today - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays < 7) {
                    const dayIndex = date.getDay();
                    data[dayIndex]++;
                }
            });
        });

        const currentDay = today.getDay();
        const orderedData = [];
        const orderedLabels = [];
        for (let i = 6; i >= 0; i--) {
            const idx = (currentDay - i + 7) % 7;
            orderedData.push(data[idx]);
            orderedLabels.push(days[idx]);
        }
        return { labels: orderedLabels, values: orderedData };
    };

    const getCategoryData = () => {
        const categoryMap = {};
        habits.forEach(habit => {
            const cat = habit.category || 'other';
            categoryMap[cat] = (categoryMap[cat] || 0) + habit.completedDates.length;
        });

        return Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    };

    const getWeeklyFocusTotal = () => {
        let total = 0;
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            total += focusHistory[dateStr] || 0;
        }
        return total;
    };

    const weeklyData = getWeeklyData();
    const categoryData = getCategoryData();
    const weeklyFocusTotal = getWeeklyFocusTotal();
    const maxVal = Math.max(...weeklyData.values, 1);

    const getDaysSince = (lastBreakDate, createdAt) => {
        const referenceDate = lastBreakDate || createdAt;
        if (!referenceDate) return 0;

        const today = new Date();
        const start = new Date(referenceDate);
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffTime = today - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{title}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('shortReport')}</Text>

                {/* Summary Section */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon={TrendingUp}
                        title={t('success')}
                        value={habits.length > 0 ? `${Math.round((habits.filter(h => h.streak > 0).length / habits.length) * 100)}%` : '0%'}
                        color={theme.colors.primary}
                    />
                    <StatCard
                        icon={Award}
                        title={t('streak')}
                        value={habits.length > 0 ? `${Math.max(...habits.map(h => h.streak))}g` : '0g'}
                        color="#F59E0B"
                    />
                </View>

                {/* ✨ Onyx AI Habit Coach Card */}
                <View style={[styles.aiCoachContainer, { backgroundColor: theme.colors.surface, borderColor: isPro ? '#8B5CF6' : theme.colors.border }]}>
                    <LinearGradient
                        colors={isPro ? ['rgba(139, 92, 246, 0.15)', 'rgba(217, 70, 239, 0.04)'] : ['rgba(255,255,255,0.02)', 'transparent']}
                        style={styles.aiCoachGradient}
                    >
                        {/* AI Header */}
                        <View style={styles.aiCoachHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <LinearGradient colors={['#8B5CF6', '#D946EF']} style={styles.aiSparkleBox}>
                                    <Sparkles size={18} color="white" />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.aiCoachTitle, { color: theme.colors.text }]}>
                                        {t('aiCoachTitle') || '✨ Onyx AI Habit Coach'}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                                        {t('aiCoachSubtitle') || 'Kişiselleştirilmiş Akıllı Analiz'}
                                    </Text>
                                </View>
                            </View>
                            {isPro && (
                                <TouchableOpacity activeOpacity={0.7}
                                    onPress={() => loadCoach(true)}
                                    disabled={coachLoading}
                                    style={styles.refreshBtn}
                                >
                                    {coachLoading ? (
                                        <ActivityIndicator size="small" color="#A855F7" />
                                    ) : (
                                        <RefreshCw size={16} color="#A855F7" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {isPro ? (
                            coachReport ? (
                                <View style={styles.aiCoachBody}>
                                    {/* Score & Assessment */}
                                    <View style={styles.scoreRow}>
                                        <View style={styles.scoreCircle}>
                                            <Text style={styles.scoreValue}>{coachReport.habitScore}</Text>
                                            <Text style={styles.scoreMax}>/100</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.scoreBadgeText, { color: theme.colors.primary }]}>
                                                {coachReport.scoreBadge}
                                            </Text>
                                            <Text style={[styles.coachMoodText, { color: theme.colors.textSecondary }]}>
                                                {coachReport.coachMood}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Power Habit */}
                                    <View style={styles.insightBox}>
                                        <View style={styles.insightRow}>
                                            <Flame size={16} color="#F59E0B" fill="#F59E0B" />
                                            <Text style={[styles.insightLabel, { color: theme.colors.text }]}>
                                                {t('powerHabit') || 'En Güçlü Alışkanlık'}:
                                            </Text>
                                        </View>
                                        <Text style={[styles.insightDesc, { color: theme.colors.textSecondary }]}>
                                            {coachReport.powerHabitText}
                                        </Text>
                                    </View>

                                    {/* Vulnerable Habit */}
                                    {coachReport.vulnerableHabitTitle !== 'Yok' && coachReport.vulnerableHabitTitle !== 'None' && (
                                        <View style={[styles.insightBox, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                                            <View style={styles.insightRow}>
                                                <AlertCircle size={16} color="#EF4444" />
                                                <Text style={[styles.insightLabel, { color: '#EF4444' }]}>
                                                    {t('vulnerableHabit') || 'Dikkat Edilmeli'}:
                                                </Text>
                                            </View>
                                            <Text style={[styles.insightDesc, { color: theme.colors.textSecondary }]}>
                                                {coachReport.vulnerableHabitText}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Actionable Tips */}
                                    <View style={styles.tipsSection}>
                                        <Text style={[styles.sectionHeading, { color: theme.colors.text, marginBottom: 8 }]}>
                                            💡 {t('actionableTips') || 'AI Eylem Önerileri'}
                                        </Text>
                                        {(coachReport.actionableTips || []).map((tip, idx) => (
                                            <View key={idx} style={styles.tipCard}>
                                                <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>• {tip.title}</Text>
                                                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{tip.text}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Quote */}
                                    {coachReport.dailyQuote && (
                                        <View style={styles.quoteBox}>
                                            <Text style={styles.quoteText}>{coachReport.dailyQuote}</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={{ padding: 24, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <Text style={{ marginTop: 8, color: theme.colors.textSecondary, fontSize: 13 }}>
                                        {t('analyzingHabits') || 'Alışkanlıkların analiz ediliyor...'}
                                    </Text>
                                </View>
                            )
                        ) : (
                            /* Free User Teaser */
                            <View style={styles.freeTeaserContainer}>
                                <View style={styles.teaserBlurredArea}>
                                    <View style={styles.scoreRow}>
                                        <View style={[styles.scoreCircle, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                                            <Text style={[styles.scoreValue, { color: theme.colors.textSecondary }]}>??</Text>
                                            <Text style={styles.scoreMax}>/100</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.scoreBadgeText, { color: theme.colors.textSecondary }]}>
                                                🔒 {t('habitScore') || 'Alışkanlık Sağlık Skoru'}
                                            </Text>
                                            <Text style={[styles.coachMoodText, { color: theme.colors.textSecondary }]}>
                                                {t('aiCoachTeaser') || 'AI Koç haftalık disiplinini analiz etti. Skorunu & raporunu görmek için Pro\'ya geç.'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity activeOpacity={0.7}
                                    style={styles.unlockBtn}
                                    onPress={() => navigation.navigate('Paywall')}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#8B5CF6', '#D946EF']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.unlockBtnGradient}
                                    >
                                        <Sparkles size={16} color="white" />
                                        <Text style={styles.unlockBtnText}>
                                            {t('unlockAICoach') || 'Onyx Pro ile Kişisel AI Koçunu Aç'}
                                        </Text>
                                        <ChevronRight size={16} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </LinearGradient>
                </View>

                {/* Focus Time Card */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface, marginBottom: 20 }]}>
                    <View style={styles.chartHeader}>
                        <Clock size={20} color={theme.colors.secondary} />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{t('focusTime')}</Text>
                    </View>
                    <View style={styles.focusSummary}>
                        <Text style={[styles.focusTotal, { color: theme.colors.text }]}>{weeklyFocusTotal}</Text>
                        <Text style={[styles.focusUnit, { color: theme.colors.textSecondary }]}>{t('totalMinutes')}</Text>
                    </View>
                </View>

                {/* Weekly Chart */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.chartHeader}>
                        <BarChart2 size={20} color={theme.colors.primary} />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{t('weeklyActivity')}</Text>
                    </View>

                    <View style={styles.barChart}>
                        {weeklyData.values.map((val, i) => (
                            <View key={i} style={styles.barWrapper}>
                                <View style={styles.barBackground}>
                                    <LinearGradient
                                        colors={[theme.colors.primary, theme.colors.secondary]}
                                        style={[styles.barFill, { height: `${(val / maxVal) * 100}%` }]}
                                    />
                                </View>
                                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>{weeklyData.labels[i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Category Distribution */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface, marginTop: 20 }]}>
                    <View style={[styles.chartHeader, !isPro && styles.lockedHeader]}>
                        <TrendingUp size={20} color={theme.colors.primary} />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{t('categoryDistribution')}</Text>
                        {!isPro && <Lock size={16} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }} />}
                    </View>

                    {isPro ? (
                        <View style={styles.categoryList}>
                            {categoryData.map(([cat, count]) => (
                                <View key={cat} style={styles.categoryRow}>
                                    <View style={styles.categoryInfo}>
                                        <Text style={[styles.categoryName, { color: theme.colors.text }]}>{t(cat)}</Text>
                                        <Text style={[styles.categoryCount, { color: theme.colors.textSecondary }]}>{count}</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, {
                                            backgroundColor: theme.colors.primary,
                                            width: `${(count / Math.max(...categoryData.map(d => d[1]))) * 100}%`
                                        }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.lockedContent}>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Paywall')}>
                                <LinearGradient colors={[theme.colors.primary + '30', 'transparent']} style={styles.blurOverlay}>
                                    <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                                        {t('unlockToSeeAnalysis')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Pro Features Call to Action if not Pro */}
                {!isPro && (
                    <TouchableOpacity activeOpacity={0.7}
                        style={styles.proCard}
                        onPress={() => navigation.navigate('Paywall')}
                    >
                        <LinearGradient
                            colors={['#D946EF', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.proGradient}
                        >
                            <View style={styles.proContent}>
                                <View>
                                    <Text style={styles.proTitle}>{t('detailsAnalysis')}</Text>
                                    <Text style={styles.proSubtitle}>{t('detailsAnalysisDesc')}</Text>
                                </View>
                                <ChevronRight color="white" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Bad Habit Statistics */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface, marginTop: 20 }]}>
                    <View style={styles.chartHeader}>
                        <Zap size={20} color="#EF4444" />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{t('breakStreakSummary')}</Text>
                    </View>
                    {breakHabits.map(habit => (
                        <View key={habit.id} style={styles.breakStatRow}>
                            <Text style={[styles.breakName, { color: theme.colors.text }]}>{habit.name}</Text>
                            <Text style={[styles.breakVal, { color: theme.colors.primary }]}>
                                {getDaysSince(habit.lastBreakDate, habit.createdAt)} {t('daysClean')}
                            </Text>
                        </View>
                    ))}
                    {breakHabits.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('noData')}</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
    statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    statCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center' },
    iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '600' },
    chartContainer: { padding: 20, borderRadius: 24 },
    chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
    chartTitle: { fontSize: 18, fontWeight: 'bold' },
    barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingHorizontal: 5 },
    barWrapper: { alignItems: 'center', flex: 1 },
    barBackground: { width: 12, height: 120, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 6 },
    barLabel: { fontSize: 10, marginTop: 10, fontWeight: '600' },
    proCard: { marginTop: 20, borderRadius: 24, overflow: 'hidden' },
    proGradient: { padding: 24 },
    proContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    proTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    proSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
    breakStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    breakName: { fontSize: 14, fontWeight: '500' },
    breakVal: { fontSize: 14, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginVertical: 10, fontSize: 14 },
    focusSummary: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    focusTotal: { fontSize: 36, fontWeight: 'bold' },
    focusUnit: { fontSize: 16, fontWeight: '500' },
    categoryList: { gap: 16 },
    categoryRow: { gap: 8 },
    categoryInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryName: { fontSize: 14, fontWeight: '600' },
    categoryCount: { fontSize: 12, fontWeight: '500', opacity: 0.7 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    lockedHeader: { opacity: 0.5 },
    lockedContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
    blurOverlay: { padding: 20, borderRadius: 16, alignItems: 'center', width: '100%' },
    lockedText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

    // AI Coach Styles
    aiCoachContainer: { borderRadius: 24, borderWidth: 1.5, marginBottom: 20, overflow: 'hidden' },
    aiCoachGradient: { padding: 20 },
    aiCoachHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    aiSparkleBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    aiCoachTitle: { fontSize: 18, fontWeight: 'bold' },
    refreshBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center' },
    aiCoachBody: { gap: 12 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 16 },
    scoreCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(139, 92, 246, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#8B5CF6' },
    scoreValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    scoreMax: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: -2 },
    scoreBadgeText: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    coachMoodText: { fontSize: 13, lineHeight: 18 },
    insightBox: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    insightRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    insightLabel: { fontSize: 13, fontWeight: 'bold' },
    insightDesc: { fontSize: 13, lineHeight: 18 },
    tipsSection: { marginTop: 4 },
    sectionHeading: { fontSize: 13, fontWeight: 'bold' },
    tipCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 10, marginBottom: 6 },
    tipTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    tipText: { fontSize: 12, lineHeight: 16 },
    quoteBox: { borderLeftWidth: 3, borderLeftColor: '#D946EF', paddingLeft: 12, paddingVertical: 4, marginTop: 4 },
    quoteText: { fontStyle: 'italic', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
    freeTeaserContainer: { gap: 12 },
    teaserBlurredArea: { opacity: 0.8 },
    unlockBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
    unlockBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 8 },
    unlockBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});

export default StatsScreen;
