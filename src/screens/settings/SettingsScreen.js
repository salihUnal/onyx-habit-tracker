import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Globe, Moon, LogOut, Layout } from 'lucide-react-native';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { logout, isPro } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = [
    'English', 'Turkish', 'Spanish', 'German', 'Italian', 'Russian', 'Chinese'
  ];

  const handleLogout = () => {
    logout();
  };

  const SettingItem = ({ icon: Icon, title, value, onPress, isSwitch, switchValue, onSwitchChange }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
          <Icon size={20} color={theme.colors.text} />
        </View>
        <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>

      {isSwitch ? (
        <Switch
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={'white'}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <View style={styles.itemRight}>
          {value && <Text style={[styles.itemValue, { color: theme.colors.textSecondary }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>

        <SettingItem
          icon={Globe}
          title={t('language')}
          value={language}
          onPress={() => setLanguageModalVisible(true)}
        />

        <SettingItem
          icon={Moon}
          title={t('darkMode')}
          isSwitch
          switchValue={theme.dark}
          onSwitchChange={theme.toggleTheme}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 24 }]}>CUSTOMIZATION</Text>

        <SettingItem
          icon={Layout}
          title="Home Screen Widgets"
          onPress={() => navigation.navigate('WidgetStore')}
        />

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 24 }]}>ACCOUNT</Text>

        <SettingItem
          icon={LogOut}
          title={t('logOut')}
          onPress={handleLogout}
        />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Language</Text>
            {languages.map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModalVisible(false);
                }}
              >
                <Text style={[
                  styles.langText,
                  { color: language === lang ? theme.colors.primary : theme.colors.text }
                ]}>
                  {lang}
                </Text>
                {language === lang && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={{ color: theme.colors.text }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default SettingsScreen;
