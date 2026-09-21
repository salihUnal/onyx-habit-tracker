import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Target, Unlink, TrendingUp, ChevronRight, Globe } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        title: 'welcomeOnyx',
        description: 'onboardingWelcomeDesc',
        icon: Zap,
        colors: ['#6366F1', '#8B5CF6'],
    },
    {
        title: 'focusMode',
        description: 'onboardingFocusDesc',
        icon: Target,
        colors: ['#D946EF', '#C026D3'],
    },
    {
        title: 'breakStreaks',
        description: 'onboardingBreakDesc',
        icon: Unlink,
        colors: ['#EF4444', '#B91C1C'],
    },
    {
        title: 'trackProgress',
        description: 'onboardingProgressDesc',
        icon: TrendingUp,
        colors: ['#10B981', '#059669'],
    }
];

const OnboardingScreen = ({ navigation, onComplete }) => {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const languages = [
        { code: 'English', label: 'English' },
        { code: 'Türkçe', label: 'Türkçe' },
        { code: 'Spanish', label: 'Español' },
        { code: 'German', label: 'Deutsch' },
        { code: 'Italian', label: 'Italiano' },
        { code: 'Russian', label: 'Русский' },
        { code: 'Chinese', label: '中文' }
    ];

    const handleNext = async () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            if (onComplete) {
                onComplete();
            } else {
                navigation.replace('Auth');
            }
        }
    };

    const currentSlide = onboardingData[currentIndex];
    const Icon = currentSlide.icon;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Language Button */}
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.langButton,
                    {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        top: Math.max(insets.top + 10, 48),
                    }
                ]}
                onPress={() => setLanguageModalVisible(true)}
            >
                <Globe size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.langButtonText, { color: theme.colors.textSecondary }]}>{language.substring(0, 2).toUpperCase()}</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={currentSlide.colors}
                        style={styles.iconGradient}
                    >
                        <Icon size={80} color="white" />
                    </LinearGradient>
                </View>

                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t(currentSlide.title)}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {t(currentSlide.description)}
                </Text>

                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? currentSlide.colors[0] : theme.colors.border },
                                index === currentIndex && styles.activeDot
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity activeOpacity={0.7} onPress={handleNext} style={styles.buttonContainer}>
                    <LinearGradient
                        colors={currentSlide.colors}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === onboardingData.length - 1 ? t('getStarted') : t('next')}
                        </Text>
                        <ChevronRight size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Language Modal */}
            <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
                <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {languages.map(lang => (
                                <TouchableOpacity activeOpacity={0.7}
                                    key={lang.code}
                                    style={[styles.langItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => { setLanguage(lang.code); setLanguageModalVisible(false); }}
                                >
                                    <Text style={[styles.langText, { color: language === lang.code ? theme.colors.primary : theme.colors.text }]}>{lang.label}</Text>
                                    {language === lang.code && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity activeOpacity={0.7} style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={{ color: theme.colors.text }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    iconContainer: { marginBottom: 40 },
    iconGradient: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    description: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    pagination: { flexDirection: 'row', gap: 8, marginBottom: 40 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    activeDot: { width: 20 },
    buttonContainer: { width: '100%' },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    langButton: { position: 'absolute', right: 24, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 6, zIndex: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    langButtonText: { fontWeight: '600', fontSize: 12 },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 24 },
    modalContent: { padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    langItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
    langText: { fontSize: 16, fontWeight: '500' },
    closeButton: { marginTop: 24, padding: 16, borderRadius: 16, alignItems: 'center' },
});

export default OnboardingScreen;
