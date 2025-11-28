import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Modal, Image, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';
import { Globe, Moon, LogOut, Layout, User, Crown, Edit2, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const SettingsScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user, logout, isPro, updateUser } = useUser();
    const { language, setLanguage, t } = useLanguage();
    const { habits } = useHabits();

    // Calculate stats
    const totalHabits = habits.length;
    // Simple success rate calculation
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    const successRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
    const [avatarOptionsVisible, setAvatarOptionsVisible] = useState(false);

    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedAvatar, setEditedAvatar] = useState('');

    const languages = ['English', 'Turkish', 'Spanish', 'German', 'Italian', 'Russian', 'Chinese'];

    const handleLogout = () => {
        logout();
    };

    const openEditProfile = () => {
        setEditedName(user?.name || '');
        setEditedEmail(user?.email || '');
        setEditedAvatar(user?.avatar || '');
        setEditProfileModalVisible(true);
    };

    const handleSaveProfile = async () => {
        if (!editedName.trim()) {
            Alert.alert(t('error'), t('nameCannotBeEmpty'));
            return;
        }
        await updateUser({ name: editedName, email: editedEmail, avatar: editedAvatar });
        setEditProfileModalVisible(false);
        Alert.alert(t('success'), t('profileUpdated'));
    };

    const takePhoto = async () => {
        setAvatarOptionsVisible(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), 'Camera permission required');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setEditedAvatar(result.assets[0].uri);
    };

    const chooseFromGallery = async () => {
        setAvatarOptionsVisible(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), 'Gallery permission required');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setEditedAvatar(result.assets[0].uri);
    };

    const removeAvatar = () => {
        setAvatarOptionsVisible(false);
        setEditedAvatar('');
    };

    const UserPanel = () => {
        const userName = user?.name || user?.email?.split('@')[0] || 'User';
        const userEmail = user?.email || 'user@example.com';

        return (
            <ExpoLinearGradient
                colors={theme.dark ? ['#D946EF', '#8B5CF6', '#6366F1'] : ['#C026D3', '#7C3AED', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.userPanel}
            >
                <View style={styles.userPanelContent}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <User size={32} color="#FFFFFF" />
                                </View>
                            )}
                            {isPro && (
                                <View style={styles.proBadge}>
                                    <Crown size={12} color="#FFD700" fill="#FFD700" />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={openEditProfile}>
                            <Edit2 size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{userName}</Text>
                            {isPro && (
                                <View style={styles.proTag}>
                                    <Crown size={14} color="#FFD700" />
                                    <Text style={styles.proText}>{t('proBadge')}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userEmail}>{userEmail}</Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalHabits}</Text>
                            <Text style={styles.statLabel}>{t('habits')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{successRate}%</Text>
                            <Text style={styles.statLabel}>{t('success')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{maxStreak}d</Text>
                            <Text style={styles.statLabel}>{t('streakDays')}</Text>
                        </View>
                    </View>
                </View>
            </ExpoLinearGradient>
        );
    };

    const SettingItem = ({ icon: Icon, title, value, onPress, isSwitch, switchValue, onSwitchChange }) => (
        <TouchableOpacity style={[styles.item, { backgroundColor: theme.colors.surface }]} onPress={onPress} disabled={isSwitch}>
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
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('settings')}</Text>
            <UserPanel />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{t('preferences')}</Text>
                <SettingItem icon={Globe} title={t('language')} value={language} onPress={() => setLanguageModalVisible(true)} />
                <SettingItem icon={Moon} title={t('darkMode')} isSwitch switchValue={theme.dark} onSwitchChange={theme.toggleTheme} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 24 }]}>{t('customization')}</Text>
                <SettingItem icon={Layout} title={t('widgetStore')} onPress={() => navigation.navigate('WidgetStore')} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 24 }]}>{t('account')}</Text>
                <SettingItem icon={LogOut} title={t('logOut')} onPress={handleLogout} />
            </ScrollView>

            {/* Language Modal */}
            <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>
                        {languages.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                                onPress={() => { setLanguage(lang); setLanguageModalVisible(false); }}
                            >
                                <Text style={[styles.langText, { color: language === lang ? theme.colors.primary : theme.colors.text }]}>{lang}</Text>
                                {language === lang && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal visible={editProfileModalVisible} transparent animationType="slide" onRequestClose={() => setEditProfileModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.editModalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('editProfile')}</Text>
                            <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarEditSection}>
                            <TouchableOpacity onPress={() => setAvatarOptionsVisible(true)}>
                                {editedAvatar ? (
                                    <Image source={{ uri: editedAvatar }} style={styles.avatarEdit} />
                                ) : (
                                    <View style={[styles.avatarEdit, styles.avatarPlaceholder]}>
                                        <User size={40} color={theme.colors.textSecondary} />
                                    </View>
                                )}
                                <View style={styles.cameraIconContainer}>
                                    <Camera size={16} color="#FFFFFF" />
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.changeAvatarText, { color: theme.colors.primary }]}>{t('changeAvatar')}</Text>
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{t('name')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <User size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder={t('name')}
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 16 }]}>{t('email')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                value={editedEmail}
                                onChangeText={setEditedEmail}
                                placeholder={t('email')}
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => setEditProfileModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.saveButtonText}>{t('save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Avatar Options Modal */}
            <Modal visible={avatarOptionsVisible} transparent animationType="fade" onRequestClose={() => setAvatarOptionsVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.avatarOptionsContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectAvatar')}</Text>
                        <TouchableOpacity style={[styles.avatarOption, { borderBottomColor: theme.colors.border }]} onPress={takePhoto}>
                            <Camera size={24} color={theme.colors.text} />
                            <Text style={[styles.avatarOptionText, { color: theme.colors.text }]}>{t('takePhoto')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.avatarOption, { borderBottomColor: theme.colors.border }]} onPress={chooseFromGallery}>
                            <ImageIcon size={24} color={theme.colors.text} />
                            <Text style={[styles.avatarOptionText, { color: theme.colors.text }]}>{t('chooseFromGallery')}</Text>
                        </TouchableOpacity>
                        {editedAvatar && (
                            <TouchableOpacity style={[styles.avatarOption, { borderBottomColor: theme.colors.border }]} onPress={removeAvatar}>
                                <X size={24} color={theme.colors.error || '#FF0000'} />
                                <Text style={[styles.avatarOptionText, { color: theme.colors.error || '#FF0000' }]}>{t('remove')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.surface, marginTop: 16 }]} onPress={() => setAvatarOptionsVisible(false)}>
                            <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
    userPanel: { borderRadius: 24, marginBottom: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    userPanelContent: { padding: 20 },
    avatarSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.3)' },
    avatarPlaceholder: { backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
    proBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
    editButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
    userInfo: { marginBottom: 20 },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    proTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    proText: { fontSize: 12, fontWeight: 'bold', color: '#FFD700' },
    userEmail: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 16, padding: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
    statLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' },
    statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    content: { paddingBottom: 40 },
    sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 12 },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '500' },
    itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemValue: { fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24 },
    editModalContent: { padding: 24, borderRadius: 24, maxHeight: '90%' },
    avatarOptionsContent: { padding: 24, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    langItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
    langText: { fontSize: 16 },
    closeButton: { marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    avatarEditSection: { alignItems: 'center', marginBottom: 24 },
    avatarEdit: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
    cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#D946EF', borderRadius: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
    changeAvatarText: { marginTop: 8, fontSize: 14, fontWeight: '600' },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
    input: { flex: 1, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelButton: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    saveButton: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    avatarOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 16 },
    avatarOptionText: { fontSize: 16, fontWeight: '500' },
});

export default SettingsScreen;
