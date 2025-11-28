import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw } from 'lucide-react-native';

const FocusScreen = () => {
  const theme = useTheme();
  const { isPro } = useUser();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Focus Mode</Text>
        
        <View style={[styles.timerContainer, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.timerText, { color: theme.colors.text }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={toggleTimer}
            style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
          >
            {isActive ? (
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
        <View style={[styles.bannerAd, { backgroundColor: theme.colors.surface }]}>
           <Text style={{color: theme.colors.textSecondary, fontSize: 10}}>BANNER AD</Text>
        </View>
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
    marginBottom: 60,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
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
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default FocusScreen;

