import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitContext';
import { Play, Pause, RotateCcw, MoreHorizontal } from 'lucide-react-native';

const FocusScreen = ({ navigation }) => {
  const theme = useTheme();
  const { isPro } = useUser();
  const { t } = useLanguage();
  const { focusState, startFocus, pauseFocus, stopFocus, getFocusTimeLeft } = useHabits();

  const [selectedDuration, setSelectedDuration] = useState(25);
  // Display time left derived from context or local state if idle
  const [displayTime, setDisplayTime] = useState(25 * 60);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const durations = [15, 25, 50];

  // Sync local selection with context if context is active
  useEffect(() => {
    if (focusState.isActive) {
      setSelectedDuration(focusState.durationMinutes);
    }
  }, [focusState.isActive, focusState.durationMinutes]);

  // Timer tick
  useEffect(() => {
    let interval;
    if (focusState.isActive) {
      // Update immediately
      setDisplayTime(getFocusTimeLeft());

      interval = setInterval(() => {
        const left = getFocusTimeLeft();
        setDisplayTime(left);

        if (left <= 0) {
          stopFocus(); // Context handles completion logic
        }
      }, 1000);
    } else {
      // If paused/stopped, show leftover or selected duration
      if (focusState.elapsedSeconds > 0) {
        // Paused state
        setDisplayTime(Math.max(0, (focusState.durationMinutes * 60) - focusState.elapsedSeconds));
      } else {
        // Idle state
        setDisplayTime(selectedDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [focusState, selectedDuration, getFocusTimeLeft]);



  const toggleTimer = () => {
    if (focusState.isActive) {
      pauseFocus();
    } else {
      const result = startFocus(selectedDuration);
      if (!result.success) {
        if (result.error === 'focus_limit_reached') {
          // Show Paywall or Ad prompt
          navigation.navigate('Paywall', { trigger: 'focus_limit' });
        }
      }
    }
    setShowCustomInput(false);
    Keyboard.dismiss();
  };

  const resetTimer = () => {
    stopFocus();
    // Resetting stops and clears elapsed.
  };

  const handleDurationSelect = (duration) => {
    if (focusState.isActive) return; // Disable changing while active
    stopFocus(); // Reset previous session if any (e.g. paused)
    setSelectedDuration(duration);
    setDisplayTime(duration * 60); // Immediate update
    setShowCustomInput(false);
  };

  const handleCustomDurationSubmit = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      if (focusState.isActive) return;
      stopFocus();
      setSelectedDuration(minutes);
      setDisplayTime(minutes * 60);
      setShowCustomInput(false);
      setCustomMinutes('');
      Keyboard.dismiss();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('focusMode')}</Text>

        <View style={[styles.timerContainer, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.timerText, { color: theme.colors.text }]}>
            {formatTime(displayTime)}
          </Text>
        </View>

        <View style={styles.durationContainer}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && { backgroundColor: theme.colors.primary },
                { borderColor: theme.colors.border, borderWidth: 1 }
              ]}
              onPress={() => handleDurationSelect(duration)}
              disabled={focusState.isActive}
            >
              <Text style={[
                styles.durationText,
                { color: selectedDuration === duration ? 'white' : theme.colors.text }
              ]}>
                {duration}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.durationButton,
              showCustomInput && { backgroundColor: theme.colors.primary },
              { borderColor: theme.colors.border, borderWidth: 1 }
            ]}
            onPress={() => setShowCustomInput(!showCustomInput)}
            disabled={focusState.isActive}
          >
            <MoreHorizontal size={20} color={showCustomInput ? 'white' : theme.colors.text} />
          </TouchableOpacity>
        </View>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={[styles.customInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              placeholder={t('enterMinutes')}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              value={customMinutes}
              onChangeText={setCustomMinutes}
              onSubmitEditing={handleCustomDurationSubmit}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.customButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCustomDurationSubmit}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleTimer}
            style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
          >
            {focusState.isActive ? (
              <Pause size={32} color="white" fill="white" />
            ) : (
              <Play size={32} color="white" fill="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetTimer}
            style={[styles.resetButton, { backgroundColor: theme.colors.surface }]}
          >
            <RotateCcw size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {!isPro && (
        <TouchableOpacity
          style={[styles.bannerAd, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}
          onPress={() => navigation.navigate('Paywall')}
        >
          <View style={styles.adLabelContainer}>
            <Text style={styles.adLabel}>Ad</Text>
          </View>
          <View style={styles.adContent}>
            <Text style={[styles.adTitle, { color: theme.colors.text }]}>{t('unlockOnyxPro') || 'Unlock Onyx Pro'}</Text>
            <Text style={[styles.adDesc, { color: theme.colors.textSecondary }]}>{t('removeAdsDesc')}</Text>
          </View>
          <View style={[styles.adButton, { backgroundColor: theme.colors.primary }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 1,
  },
  timerContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  durationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 10,
    alignItems: 'center',
  },
  customInput: {
    width: 120,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
  },
  customButton: {
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  }
});

export default FocusScreen;
