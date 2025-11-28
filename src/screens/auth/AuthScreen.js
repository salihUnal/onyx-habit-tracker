import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AuthScreen = () => {
  const theme = useTheme();
  const { login } = useUser();

  const handleLogin = (method) => {
    // Mock login
    login({ id: '1', name: 'User', method });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.background}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>ONYX</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Habit Tracker & Focus
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('email')}
          >
            <Ionicons name="mail" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => handleLogin('phone')}
          >
            <Ionicons name="call" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Continue with Phone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  buttons: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;
