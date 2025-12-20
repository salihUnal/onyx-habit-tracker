import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Unlink, Plus, Trash2, TrendingDown, Award, Calendar } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const BreakStreakScreen = ({ navigation }) => {
    const theme = useTheme();
    const colors = theme?.colors || {};
    const { isPro } = useUser();
    const { t } = useLanguage();
    const { breakHabits, addBreakHabit, toggleBreakHabit, deleteBreakHabit, extraHabits } = useHabits();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [habitName, setHabitName] = useState('');
    const [editingHabit, setEditingHabit] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Confirmation Modal State
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [pendingBreakId, setPendingBreakId] = useState(null);
    const [confirmType, setConfirmType] = useState('break'); // 'break' | 'delete'

    const openModal = (habit = null) => {
        if (habit) {
            setEditingHabit(habit);
            setHabitName(habit.name);
            setIsModalVisible(true);
        } else {
            // Check limit including extraHabits (same as HomeScreen)
            const currentExtra = extraHabits || 0;
            if (!isPro && (breakHabits || []).length >= 3 && currentExtra <= 0) {
                navigation.navigate('Paywall', { trigger: 'break_habit_limit' });
                return;
            }
            setEditingHabit(null);
            setHabitName('');
            setIsModalVisible(true);
        }
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setEditingHabit(null);
        setHabitName('');
    };

    const handleSave = () => {
        if (habitName.trim()) {
            if (editingHabit) {
                closeModal();
            } else {
                const result = addBreakHabit(habitName);
                if (result.success) {
                    closeModal();
                } else if (result.error === 'limit_reached') {
                    closeModal();
                    navigation.navigate('Paywall', { trigger: 'break_habit_limit' });
                }
            }
        }
    };

    const handleDelete = () => {
        if (editingHabit) {
            setPendingBreakId(editingHabit.id);
            setConfirmType('delete');
            setIsConfirmModalVisible(true);
            // We keep the edit modal open in background or we could close it.
            // If we close it, editingHabit becomes null.
            // Let's close it after confirmation.
        }
    };

    const handleToggle = (id) => {
        toggleBreakHabit(id);
        // Removed confetti here because breaking a streak is a negative event.
    };

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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: -10, y: 0 }}
                    autoStart={true}
                    fadeOut={true}
                />
            )}

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('breakStreaks') || 'Break Streaks'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {t('breakStreaksDesc') || 'Track bad habits'}
                    </Text>
                </View>
                {!isPro && (
                    <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            style={styles.proBadge}
                        >
                            <Text style={styles.proBadgeText}>{t('proBadge') || 'PRO'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TrendingDown size={24} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                        {t('howItWorks') || 'How it works'}
                    </Text>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {t('breakStreaksInfo') || 'Add bad habits to break them.'}
                    </Text>
                </View>
            </View>

            {/* Break Habits List */}
            <ScrollView style={styles.habitsList} contentContainerStyle={styles.habitsListContent}>
                {(!breakHabits || breakHabits.length === 0) ? (
                    <View style={styles.emptyState}>
                        <Unlink size={64} color={colors.textSecondary} opacity={0.3} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('noBreakHabits') || 'No bad habits yet'}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            {t('addFirstBreakHabit') || 'Add one to start!'}
                        </Text>
                    </View>
                ) : (
                    breakHabits.map((habit) => {
                        const daysSince = getDaysSince(habit.lastBreakDate, habit.createdAt);
                        return (
                            <TouchableOpacity
                                key={habit.id}
                                style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onLongPress={() => openModal(habit)}
                            >
                                <View style={styles.habitInfo}>
                                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                        <Unlink size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.habitDetails}>
                                        <Text style={[styles.habitName, { color: colors.text }]}>{habit.name}</Text>
                                        <View style={styles.streakContainer}>
                                            <Award size={14} color={colors.primary} />
                                            <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                                                {daysSince} {t('daysClean') || 'days clean'}
                                            </Text>
                                        </View>
                                        {habit.lastBreakDate && (
                                            <View style={styles.dateContainer}>
                                                <Calendar size={12} color={colors.textSecondary} />
                                                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                                    {t('lastBreak')}: {new Date(habit.lastBreakDate).toLocaleDateString(t('locale') || 'en-US')}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.breakButton, { backgroundColor: '#EF4444' }]}
                                    onPress={() => {
                                        setPendingBreakId(habit.id);
                                        setConfirmType('break');
                                        setIsConfirmModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.breakButtonText}>{t('broke') || 'I Broke'}</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => openModal()}
            >
                <Plus size={32} color="white" />
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingHabit ? t('editHabit') : t('addBreakHabit')}
                            </Text>
                            {editingHabit && (
                                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                                    <Trash2 size={20} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder={t('habitNamePlaceholder') || "e.g. Smoking"}
                            placeholderTextColor={colors.textSecondary}
                            value={habitName}
                            onChangeText={setHabitName}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                                <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {editingHabit ? t('save') || 'Save' : t('create') || 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                visible={isConfirmModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsConfirmModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, alignItems: 'center' }]}>
                        <View style={[styles.iconBox, { backgroundColor: '#EF444420', marginBottom: 16, width: 64, height: 64, borderRadius: 32 }]}>
                            {confirmType === 'delete' ? <Trash2 size={32} color="#EF4444" /> : <Unlink size={32} color="#EF4444" />}
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}>
                            {confirmType === 'delete' ? (t('confirmDelete') || 'Delete Habit') : (t('confirmBreak') || 'Break Streak?')}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                            {confirmType === 'delete' ? (t('deletePrompt') || 'Are you sure?') : (t('confirmBreakMessage') || 'Did you do this bad habit today?')}
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setIsConfirmModalVisible(false)}
                                style={[styles.modalButton, { flex: 1, alignItems: 'center' }]}
                            >
                                <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (confirmType === 'delete') {
                                        deleteBreakHabit(pendingBreakId);
                                        setIsConfirmModalVisible(false);
                                        closeModal();
                                    } else {
                                        handleToggle(pendingBreakId);
                                        setIsConfirmModalVisible(false);
                                    }
                                }}
                                style={[styles.modalButton, { backgroundColor: '#EF4444', flex: 1, alignItems: 'center' }]}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {confirmType === 'delete' ? (t('delete') || 'Delete') : (t('yes') || 'Yes, I Broke It')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                        <Text style={[styles.adTitle, { color: colors.text }]}>
                            {t('unlockOnyxPro') || 'Unlock Onyx Pro'}
                        </Text>
                        <Text style={[styles.adDesc, { color: colors.textSecondary }]}>
                            {t('removeAdsDesc')}
                        </Text>
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
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginTop: 4 },
    proBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    proBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    infoCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20, gap: 12 },
    infoTextContainer: { flex: 1 },
    infoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    infoText: { fontSize: 12, lineHeight: 18 },
    habitsList: { flex: 1 },
    habitsListContent: { paddingBottom: 100 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
    habitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
    habitInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    habitDetails: { flex: 1 },
    habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    streakContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    streakText: { fontSize: 14, fontWeight: '500' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    dateText: { fontSize: 11 },
    breakButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    breakButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    addButton: { position: 'absolute', bottom: 90, right: 20, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 4.65, elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24, width: '100%', maxWidth: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    deleteButton: { padding: 8 },
    input: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    modalButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    bannerAd: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderTopWidth: 1, elevation: 4 },
    adLabelContainer: { backgroundColor: '#F59E0B', paddingHorizontal: 4, borderRadius: 4, marginRight: 12 },
    adLabel: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    adContent: { flex: 1 },
    adTitle: { fontSize: 14, fontWeight: 'bold' },
    adDesc: { fontSize: 10 },
    adButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    adButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});

export default BreakStreakScreen;
