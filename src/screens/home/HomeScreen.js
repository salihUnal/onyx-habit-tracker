import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const HomeScreen = () => {
  const { theme } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.greeting, { color: theme.colors.text }]}>
        Merhaba, Kullanıcı! 👋
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Günlük İlerleme
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%', backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.primary }]}>%65</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Bugünkü Alışkanlıklar
      </Text>

      <View style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, { color: theme.colors.text }]}>Su İç</Text>
          <Text style={[styles.habitStreak, { color: theme.colors.textSecondary }]}>7 gün devam</Text>
        </View>
        <View style={[styles.checkbox, { borderColor: theme.colors.primary }]} />
      </View>

      <View style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, { color: theme.colors.text }]}>Kitap Oku</Text>
          <Text style={[styles.habitStreak, { color: theme.colors.textSecondary }]}>3 gün devam</Text>
        </View>
        <View style={[styles.checkbox, { borderColor: theme.colors.primary }]} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
});

export default HomeScreen;
