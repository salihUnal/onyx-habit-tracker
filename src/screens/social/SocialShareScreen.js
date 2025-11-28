import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap } from 'lucide-react-native';

const SocialShareScreen = ({ route, navigation }) => {
  const { habit } = route.params;
  const theme = useTheme();
  const { isPro } = useUser();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.shareButtonText}>Share to Story</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.storyCanvas}
        >
          <View style={styles.storyContent}>
            <View style={styles.iconContainer}>
              <Zap size={64} color="white" />
            </View>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.streakCount}>{habit.streak}</Text>
            <Text style={styles.streakLabel}>DAY STREAK</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.appName}>ONYX</Text>
            {!isPro && (
              <View style={styles.watermark}>
                <Text style={styles.watermarkText}>Get Onyx on App Store</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {!isPro && (
        <TouchableOpacity 
          style={styles.removeWatermarkButton}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={[styles.removeWatermarkText, { color: theme.colors.textSecondary }]}>
            Remove Watermark
          </Text>
        </TouchableOpacity>
      )}
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
  storyCanvas: {
    width: '100%',
    aspectRatio: 9/16,
    borderRadius: 24,
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

