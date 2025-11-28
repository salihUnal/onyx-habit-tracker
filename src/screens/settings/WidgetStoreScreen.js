import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WidgetStoreScreen = ({ navigation }) => {
  const theme = useTheme();
  const { isPro } = useUser();
  const { t } = useLanguage();
  const [selectedWidget, setSelectedWidget] = useState('basic');

  useEffect(() => {
    loadWidgetSelection();
  }, []);

  const loadWidgetSelection = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedWidget');
      if (saved) setSelectedWidget(saved);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = async (id, isPremium) => {
    if (isPremium && !isPro) {
      navigation.navigate('Paywall');
    } else {
      setSelectedWidget(id);
      await AsyncStorage.setItem('selectedWidget', id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('widgetStore')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('customizeHome')}
        </Text>

        {/* Basic Widget */}
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: selectedWidget === 'basic' ? theme.colors.primary : theme.colors.border
            }
          ]}
          onPress={() => handleSelect('basic', false)}
        >
          <View style={styles.previewBasic}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('minimalList')}</Text>
            <Text style={[styles.cardPrice, { color: theme.colors.success }]}>{t('free')}</Text>
          </View>
          {selectedWidget === 'basic' && (
            <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Premium Widget */}
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: selectedWidget === 'neon' ? theme.colors.primary : theme.colors.border
            }
          ]}
          onPress={() => handleSelect('neon', true)}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.previewNeon}
          >
            <Text style={styles.neonText}>ONYX</Text>
          </LinearGradient>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('neonCyberpunk')}</Text>
            <Text style={[styles.cardPrice, { color: theme.colors.primary }]}>PRO</Text>
          </View>
          {selectedWidget === 'neon' ? (
            <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          ) : !isPro && (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewBasic: {
    width: 80,
    height: 80,
    backgroundColor: '#E4E4E7',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
  },
  line: {
    height: 4,
    backgroundColor: '#A1A1AA',
    borderRadius: 2,
    width: '100%',
  },
  previewNeon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    padding: 4,
  },
});

export default WidgetStoreScreen;
