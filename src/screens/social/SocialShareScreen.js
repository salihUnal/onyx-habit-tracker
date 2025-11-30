import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Heart, Briefcase, BookOpen, Brain, Dumbbell, Tag } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const SocialShareScreen = ({ route, navigation }) => {
  const { habit, color, categoryIcon } = route.params;
  const theme = useTheme();
  const { isPro } = useUser();
  const { t } = useLanguage();
  const viewRef = useRef();

  const iconMap = {
    'other': Zap,
    'health': Heart,
    'work': Briefcase,
    'learning': BookOpen,
    'mindfulness': Brain,
    'fitness': Dumbbell,
    'custom': Tag
  };

  let IconComponent = Zap;
  if (categoryIcon && iconMap[categoryIcon]) {
    IconComponent = iconMap[categoryIcon];
  } else if (categoryIcon && categoryIcon.startsWith('custom_')) {
    IconComponent = Tag;
  }

  const gradientColors = color
    ? [color, adjustColor(color, -40)]
    : [theme.colors.primary, theme.colors.secondary];

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile'
      });

      if (Platform.OS === 'android') {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share to Story'
        });
      } else {
        await Sharing.shareAsync(uri, {
          UTI: 'public.png', // iOS specific
          mimeType: 'image/png',
          dialogTitle: 'Share to Story'
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.shareButtonText}>{t('shareToStory')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        <View
          ref={viewRef}
          collapsable={false}
          style={styles.captureContainer}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.storyCanvas}
          >
            <View style={styles.storyContent}>
              <View style={styles.iconContainer}>
                <IconComponent size={64} color="white" />
              </View>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.streakCount}>{habit.streak}</Text>
              <Text style={styles.streakLabel}>{t('dayStreak')}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.appName}>ONYX</Text>
              {!isPro && (
                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>{t('getOnyx')}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>

      {!isPro && (
        <TouchableOpacity
          style={styles.removeWatermarkButton}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={[styles.removeWatermarkText, { color: theme.colors.textSecondary }]}>
            {t('removeWatermark')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const adjustColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  captureContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    overflow: 'hidden', // Ensure rounded corners are captured
  },
  storyCanvas: {
    width: '100%',
    height: '100%', // Fill the capture container
    padding: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  habitName: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  streakCount: {
    color: 'white',
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 120,
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 4,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  watermark: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  watermarkText: {
    color: 'white',
    fontSize: 12,
  },
  removeWatermarkButton: {
    padding: 20,
    alignItems: 'center',
  },
  removeWatermarkText: {
    textDecorationLine: 'underline',
  },
});

export default SocialShareScreen;

