import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, Platform, SectionList, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useHabits } from '../../context/HabitContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Plus, Share2, Check, Briefcase, BookOpen, Brain, Dumbbell, Heart, Clock, Search, Filter, Edit2, X, Star, Trash2, Tag } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || {};
  const { user, isPro } = useUser();
  const { habits, addHabit, updateHabit, toggleHabit, deleteHabit } = useHabits();
  const { t, language } = useLanguage();

  // Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [perfectScoreVisible, setPerfectScoreVisible] = useState(false);

  // Form States
  const [habitName, setHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [reminderTime, setReminderTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Custom Categories
  const [customCategories, setCustomCategories] = useState([]);

  // Effects
  const [showConfetti, setShowConfetti] = useState(false);

  const defaultCategories = [
    { id: 'other', icon: Zap, label: 'other', color: '#6366F1' },
    { id: 'health', icon: Heart, label: 'health', color: '#EF4444' },
    { id: 'work', icon: Briefcase, label: 'work', color: '#3B82F6' },
    { id: 'learning', icon: BookOpen, label: 'learning', color: '#F59E0B' },
    { id: 'mindfulness', icon: Brain, label: 'mindfulness', color: '#8B5CF6' },
    { id: 'fitness', icon: Dumbbell, label: 'fitness', color: '#10B981' },
  ];

  const allCategories = [...defaultCategories, ...customCategories];

  const today = new Date();
  const localeMap = {
    'English': 'en-US',
    'Turkish': 'tr-TR',
    'Spanish': 'es-ES',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Russian': 'ru-RU',
    'Chinese': 'zh-CN'
  };
  const dateString = today.toLocaleDateString(localeMap[language] || 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const completedCount = (habits || []).filter(h => h.completedDates.includes(today.toISOString().split('T')[0])).length;
  const progress = (habits || []).length > 0 ? completedCount / habits.length : 0;

  useEffect(() => {
    registerForPushNotificationsAsync();
    scheduleDailyNotification();
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('customCategories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const withIcons = parsed.map(c => ({ ...c, icon: Tag }));
          setCustomCategories(withIcons);
        }
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const saveCustomCategory = async () => {
    if (newCategoryName.trim()) {
      const newCat = {
        id: `custom_${Date.now()}`,
        label: newCategoryName,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        isCustom: true
      };

      const updated = [...customCategories, { ...newCat, icon: Tag }];
      setCustomCategories(updated);

      const toStore = updated.map(({ icon, ...rest }) => rest);
      await AsyncStorage.setItem('customCategories', JSON.stringify(toStore));

      setNewCategoryName('');
      setIsCategoryModalVisible(false);
      setSelectedCategory(newCat.id);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
    }
  };

  const scheduleDailyNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Morning! ☀️",
        body: "Time to check your habits for today!",
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  const handleSaveHabit = () => {
    if (habitName.trim()) {
      if (editingHabit) {
        updateHabit(editingHabit.id, {
          name: habitName,
          category: selectedCategory,
          reminderTime: reminderTime
        });
        closeModal();
      } else {
        const result = addHabit(habitName, selectedCategory, reminderTime);
        if (result.success) {
          closeModal();
        } else if (result.error === 'limit_reached') {
          closeModal();
          navigation.navigate('Paywall');
        }
      }
    }
  };

  const handleDeleteHabit = () => {
    if (editingHabit) {
      Alert.alert(
        t('confirmDelete'),
        t('deletePrompt'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => {
              deleteHabit(editingHabit.id);
              closeModal();
            }
          }
        ]
      );
    }
  };

  const openModal = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setHabitName(habit.name);
      setSelectedCategory(habit.category || 'other');
      setReminderTime(habit.reminderTime);
    } else {
      if (!isPro && habits.length >= 3) {
        navigation.navigate('Paywall');
        return;
      }
      setEditingHabit(null);
      setHabitName('');
      setSelectedCategory('other');
      setReminderTime(null);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingHabit(null);
    setHabitName('');
    setSelectedCategory('other');
    setReminderTime(null);
  };

  const handleToggleHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    const isCompleted = habit.completedDates.includes(today.toISOString().split('T')[0]);

    toggleHabit(id);

    if (!isCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const newCompletedCount = completedCount + 1;
      const newProgress = newCompletedCount / habits.length;

      if (newProgress === 1) {
        setPerfectScoreVisible(true);
        setCongratsVisible(false);
      } else if (newProgress >= 0.8 && progress < 0.8) {
        setCongratsVisible(true);
      }
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderTime(selectedDate.toISOString());
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryIcon = (catId) => {
    const cat = allCategories.find(c => c.id === catId) || defaultCategories[0];
    return cat.icon;
  };

  const getCategoryColor = (catId) => {
    const cat = allCategories.find(c => c.id === catId) || defaultCategories[0];
    return cat.color;
  };

  const getCategoryLabel = (cat) => {
    return cat.isCustom ? cat.label : t(cat.label);
  };

  // Filtering and Grouping
  const filteredHabits = (habits || []).filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'all' || h.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedHabits = allCategories.reduce((acc, cat) => {
    const catHabits = filteredHabits.filter(h => (h.category || 'other') === cat.id);
    if (catHabits.length > 0) {
      acc.push({
        title: cat.id,
        data: catHabits,
        color: cat.color,
        label: getCategoryLabel(cat)
      });
    }
    return acc;
  }, []);

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
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{t('welcome')}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{user?.name || 'Guest'}</Text>
        </View>
        {!isPro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.proBadge}
            >
              <Text style={styles.proBadgeText}>{t('proBadge')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.date, { color: colors.textSecondary }]}>{dateString}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progress * 100)}% {t('dailyGoals')}
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('search')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === 'all' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, { color: activeFilter === 'all' ? 'white' : colors.text }]}>{t('all')}</Text>
          </TouchableOpacity>
          {allCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === cat.id ? cat.color : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setActiveFilter(cat.id)}
            >
              <Text style={[styles.filterText, { color: activeFilter === cat.id ? 'white' : colors.text }]}>
                {getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Habits List */}
      <SectionList
        sections={groupedHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.habitsList}
        renderSectionHeader={({ section: { label, color } }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: color }]}>{label}</Text>
            <View style={[styles.sectionLine, { backgroundColor: color, opacity: 0.3 }]} />
          </View>
        )}
        renderItem={({ item }) => {
          const isCompleted = item.completedDates.includes(today.toISOString().split('T')[0]);
          const Icon = getCategoryIcon(item.category);
          const iconColor = getCategoryColor(item.category);

          return (
            <View style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.habitInfo}>
                <View style={[styles.iconBox, { backgroundColor: isCompleted ? iconColor : colors.background }]}>
                  <Icon size={20} color={isCompleted ? 'white' : iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.habitName, { color: colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
                    {item.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                      {item.streak} {t('streak')}
                    </Text>
                    {item.reminderTime && (
                      <View style={styles.timeTag}>
                        <Clock size={10} color={colors.textSecondary} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                          {formatTime(item.reminderTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
                  <Edit2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SocialShare', { habit: item })} style={styles.actionButton}>
                  <Share2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleHabit(item.id)} style={[styles.checkbox, { borderColor: iconColor, backgroundColor: isCompleted ? iconColor : 'transparent' }]}>
                  {isCompleted && <Check size={16} color="white" />}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => openModal()}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Habit Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingHabit ? t('editHabit') || 'Edit Habit' : t('newHabit')}
                </Text>
                {editingHabit && (
                  <TouchableOpacity onPress={handleDeleteHabit} style={styles.deleteButton}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder={t('habitNamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={habitName}
                onChangeText={setHabitName}
                autoFocus={!editingHabit}
              />

              <View style={styles.categoryHeader}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('category')}</Text>
                <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>+ {t('addCategory')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {allCategories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor: isSelected ? cat.color : colors.surface,
                          borderColor: isSelected ? cat.color : colors.border
                        }
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Icon size={20} color={isSelected ? 'white' : colors.text} />
                      <Text style={[styles.categoryLabel, { color: isSelected ? 'white' : colors.text }]}>
                        {getCategoryLabel(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>{t('time')}</Text>
              <TouchableOpacity
                style={[styles.timeButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                onPress={() => setShowTimePicker(true)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.timeIconContainer}
                >
                  <Clock size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                  {reminderTime ? formatTime(reminderTime) : t('setReminder')}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={reminderTime ? new Date(reminderTime) : new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                  <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveHabit} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {editingHabit ? t('save') || 'Save' : t('create')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('createCategory')}</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={t('categoryName')}
              placeholderTextColor={colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCustomCategory} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Congrats Modal (80%) */}
      <Modal
        visible={congratsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCongratsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.congratsContent, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.congratsIconContainer}
            >
              <Star size={48} color="white" fill="white" />
            </LinearGradient>
            <Text style={[styles.congratsTitle, { color: colors.text }]}>{t('greatJob')}</Text>
            <Text style={[styles.congratsText, { color: colors.textSecondary }]}>
              {t('dailyGoalReached')}
            </Text>
            <TouchableOpacity
              style={[styles.congratsButton, { backgroundColor: colors.primary }]}
              onPress={() => setCongratsVisible(false)}
            >
              <Text style={styles.congratsButtonText}>{t('awesome')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Perfect Score Modal (100%) */}
      <Modal
        visible={perfectScoreVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPerfectScoreVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.congratsContent, { backgroundColor: colors.card, borderWidth: 2, borderColor: '#FFD700' }]}>
            <ConfettiCannon count={100} origin={{ x: 0, y: 0 }} autoStart={true} fadeOut={true} />
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.congratsIconContainer}
            >
              <Star size={48} color="white" fill="white" />
            </LinearGradient>
            <Text style={[styles.congratsTitle, { color: colors.text }]}>{t('perfectScore')}</Text>
            <Text style={[styles.congratsText, { color: colors.textSecondary }]}>
              {t('perfectScoreMsg')}
            </Text>
            <TouchableOpacity
              style={[styles.congratsButton, { backgroundColor: '#FFD700' }]}
              onPress={() => setPerfectScoreVisible(false)}
            >
              <Text style={[styles.congratsButtonText, { color: 'black' }]}>{t('awesome')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!isPro && (
        <View style={[styles.bannerAd, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>BANNER AD</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: { fontSize: 14 },
  username: { fontSize: 24, fontWeight: 'bold' },
  proBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  proBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  date: { fontSize: 14, marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 },
  progressContainer: { marginBottom: 24 },
  progressBarBg: { height: 8, borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'right' },

  // Search & Filter
  searchContainer: { marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterText: { fontSize: 12, fontWeight: '600' },

  // List
  habitsList: { paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginRight: 8, textTransform: 'uppercase' },
  sectionLine: { flex: 1, height: 1, borderRadius: 1 },
  habitCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  habitInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  habitName: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  streakText: { fontSize: 12 },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionButton: { padding: 8 },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  addButton: { position: 'absolute', bottom: 90, right: 20, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 4.65, elevation: 8 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 24, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  deleteButton: { padding: 8 },
  input: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16, fontSize: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  categoryList: { flexDirection: 'row', marginBottom: 8, maxHeight: 50 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, gap: 6 },
  categoryLabel: { fontSize: 12, fontWeight: '600' },
  timeButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 24 },
  timeIconContainer: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  timeButtonText: { fontSize: 16, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  modalButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },

  // Congrats Modal
  congratsContent: { padding: 32, borderRadius: 24, alignItems: 'center' },
  congratsIconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 10 },
  congratsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  congratsText: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  congratsButton: { paddingVertical: 16, paddingHorizontal: 48, borderRadius: 16, elevation: 4 },
  congratsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  bannerAd: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, justifyContent: 'center', alignItems: 'center' }
});

export default HomeScreen;
