// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';

// AuthScreen bileşeni
const AuthScreen = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Onyx</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Alışkanlıklarını Takip Et, Hedeflerine Ulaş
      </Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.buttonText}>Başla</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Geçici boş ekran bileşeni
const PlaceholderScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.colors.background 
    }}>
      <Text style={{ color: theme.colors.text }}>Yakında...</Text>
    </View>
  );
};

const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'İstatistikler') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
          height: Platform.OS === 'ios' ? 90 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
          fontFamily: 'System',
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="İstatistikler" component={PlaceholderScreen} />
      <Tab.Screen name="Profil" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const [isAuthenticated] = React.useState(true); // Şimdilik true yapıyoruz

  return (
    <NavigationContainer theme={{
      dark: theme.dark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.notification,
      },
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AppNavigator;