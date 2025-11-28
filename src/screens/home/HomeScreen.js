import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useHabits } from '../../context/HabitContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Plus, Share2, Check } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, isPro } = useUser();
  const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
  const { t } = useLanguage();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const completedCount = habits.filter(h => h.completedDates.includes(today.toISOString().split('T')[0])).length;
  const progress = habits.length > 0 ? completedCount / habits.length : 0;

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const result = addHabit(newHabitName);
      if (result.success) {
        setNewHabitName('');
        setIsAddModalVisible(false);
      } else if (result.error === 'limit_reached') {
        setIsAddModalVisible(false);
        navigation.navigate('Paywall');
      }
    }
  };

  const openAddModal = () => {
    if (!isPro && habits.length >= 3) {
      navigation.navigate('Paywall');
    } else {
      setIsAddModalVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>{t('welcome')}</Text>
          <Text style={[styles.username, { color: theme.colors.text }]}>{user?.name || 'Guest'}</Text>
        </View>
        {!isPro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.proBadge}
            >
              <Text style={styles.proBadgeText}>{t('proBadge')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{dateString}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {Math.round(progress * 100)}% {t('dailyGoals')}
        </Text>
      </View>

      {/* Habits List */}
      <ScrollView contentContainerStyle={styles.habitsList}>
        {habits.map(habit => {
          const isCompleted = habit.completedDates.includes(today.toISOString().split('T')[0]);
          return (
            <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.habitInfo}>
                <View style={[styles.iconBox, { backgroundColor: isCompleted ? theme.colors.primary : theme.colors.background }]}>
                  <Zap size={20} color={isCompleted ? 'white' : theme.colors.primary} />
                </View>
                <View>
                  <Text style={[styles.habitName, { color: theme.colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
                    {habit.name}
                  </Text>
                  <Text style={[styles.streakText, { color: theme.colors.textSecondary }]}>
                    {habit.streak} {t('streak')}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => navigation.navigate('SocialShare', { habit })} style={styles.actionButton}>
                  <Share2 size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleHabit(habit.id)} style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: isCompleted ? theme.colors.primary : 'transparent' }]}>
                  {isCompleted && <Check size={16} color="white" />}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={openAddModal}
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>

      {/* Add Habit Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Habit</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
              placeholder="e.g. Read 20 mins"
              placeholderTextColor={theme.colors.textSecondary}
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddHabit} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!isPro && (
        <View style={[styles.bannerAd, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>BANNER AD</Text>
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
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  date: {
    fontSize: 14,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  habitsList: {
    paddingBottom: 100,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bannerAd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default HomeScreen;
