import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Zap, Shield, Moon, Layout } from 'lucide-react-native';

const PaywallScreen = ({ navigation }) => {
  const theme = useTheme();
  const { upgradeToPro } = useUser();

  const handlePurchase = async () => {
    await upgradeToPro();
    navigation.goBack();
  };

  const FeatureRow = ({ icon: Icon, title, description }) => (
    <View style={styles.featureRow}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
        <Icon size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>ONYX PRO</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Unlock your full potential
        </Text>

        <View style={styles.features}>
          <FeatureRow 
            icon={Zap} 
            title="Unlimited Habits" 
            description="Track as many habits as you want" 
          />
          <FeatureRow 
            icon={Moon} 
            title="Dark Mode & Themes" 
            description="Access exclusive neon themes" 
          />
          <FeatureRow 
            icon={Layout} 
            title="Pro Widgets" 
            description="Customize your home screen" 
          />
          <FeatureRow 
            icon={Shield} 
            title="No Ads" 
            description="Distraction-free experience" 
          />
        </View>

        <TouchableOpacity onPress={handlePurchase}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseButton}
          >
            <Text style={styles.purchaseButtonText}>Unlock Lifetime Access</Text>
            <Text style={styles.priceText}>$29.99</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
          Restore Purchase
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  purchaseButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  restoreText: {
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default PaywallScreen;

