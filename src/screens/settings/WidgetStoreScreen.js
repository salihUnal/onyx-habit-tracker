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

        {/* Setup Guide Section */}
        <View style={styles.guideSection}>
          <Text style={[styles.guideTitle, { color: theme.colors.text }]}>{t('widgetSetup')}</Text>
          <Text style={[styles.guideDesc, { color: theme.colors.textSecondary }]}>{t('widgetSetupDesc')}</Text>

          <View style={styles.steps}>
            <Step number="1" text={t('step1')} theme={theme} />
            <Step number="2" text={t('step2')} theme={theme} />
            <Step number="3" text={t('step3')} theme={theme} />
          </View>

          <View style={[styles.warningBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
              {t('nativeLimitationWarning')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Step = ({ number, text, theme }) => (
  <View style={styles.stepRow}>
    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={[styles.stepText, { color: theme.colors.text }]}>{text}</Text>
  </View>
);

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
    shadowColor: "#D946EF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  neonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
  guideSection: {
    marginTop: 40,
    paddingBottom: 40,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guideDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  steps: {
    gap: 16,
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default WidgetStoreScreen;
