import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Shield, FileText, X } from 'lucide-react-native';

const LegalModal = ({ visible, onClose, initialTab = 'privacy' }) => {
  const theme = useTheme();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const isTurkish = language === 'Türkçe';

  const renderPrivacyContent = () => (
    <View style={styles.textContainer}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {isTurkish ? 'Gizlilik Politikası (Privacy Policy)' : 'Privacy Policy'}
      </Text>
      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
        {isTurkish ? 'Son Güncelleme: 4 Eylül 2026' : 'Last Updated: September 4, 2026'}
      </Text>

      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Onyx: Habit Tracker & Focus olarak kişisel verilerinizin güvenliğine ve gizliliğinize büyük önem veriyoruz. Bu Gizlilik Politikası; KVKK (Türkiye), GDPR (Avrupa Birliği) ve Apple/Google mağaza politikaları uyarınca hangi verileri nasıl topladığımızı ve koruduğumuzu açıklar.'
          : 'At Onyx: Habit Tracker & Focus, we take the security of your personal data and your privacy seriously. This Privacy Policy explains what data we collect, how it is used, and how it is protected in compliance with GDPR, KVKK, and App Store guidelines.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '1. Toplanan Bilgiler' : '1. Information We Collect'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? '• Hesap Bilgileri: Google ile veya E-posta ile kaydolduğunuzda e-posta adresiniz, kullanıcı adınız ve Firebase Authentication tarafından üretilen benzersiz kullanıcı kimliği (UID) saklanır.\n• Alışkanlık Verileri: Eklediğiniz alışkanlıklar, seriler, tamamlanan günler ve odaklanma oturum süreleri yerel olarak cihazınızda ve oturum açtığınızda Google Cloud Firestore üzerinde yedeklenir.\n• Reklam Kimlikleri: AdMob, kişiselleştirilmiş veya kişiselleştirilmemiş reklam sunumu amacıyla anonim reklam kimliklerini (IDFA/GAID) işleyebilir.'
          : '• Account Data: When signing in via Google or Email, your email, display name, and unique user identifier (UID) are processed via Firebase Authentication.\n• Habit Records: Habits, streaks, completed dates, and focus session minutes are stored locally and backed up to Google Cloud Firestore when signed in.\n• Ad Identifiers: Google AdMob may process anonymous advertising identifiers (IDFA/GAID) to serve compliant banner and rewarded ads.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '2. Reklamlar ve Sanal Kumar / Bahis Engeli' : '2. Ads & Prohibited Categories'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Uygulamamızda gösterilen reklamlar AdMob Hassas Kategori filtreleri ile korunmaktadır. Sanal kumar, yasadışı bahis, tütün, alkol, yetişkin içerikler ve şüpheli finansal aldatıcı reklamlar kesin olarak engellenmektedir.'
          : 'Advertisements served in Onyx are strictly filtered via AdMob Sensitive Category controls. Gambling, betting, adult content, tobacco, and high-risk financial ads are permanently blocked.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '3. Veri Güvenliği ve Hesap Silme Hakkı' : '3. Data Security & Account Deletion'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Verileriniz şifrelenmiş protokoller (SSL/TLS) üzerinden aktarılır. İstediğiniz an Ayarlar -> Hesabı Sil adımıyla hesabınızı ve buluttaki tüm verilerinizi kalıcı olarak silebilirsiniz ("Unutulma Hakkı").'
          : 'Your data is transmitted over encrypted protocols (SSL/TLS). You can permanently delete your account and all associated cloud data at any time via Settings -> Delete Account.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '4. İletişim' : '4. Contact Us'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Gizlilik ile ilgili sorularınız için:\nE-posta: support@onyxhabittracker.com / salihyedekler@gmail.com'
          : 'For inquiries regarding your data and privacy:\nEmail: support@onyxhabittracker.com / salihyedekler@gmail.com'}
      </Text>
    </View>
  );

  const renderTermsContent = () => (
    <View style={styles.textContainer}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {isTurkish ? 'Kullanım Şartları ve EULA' : 'Terms of Service & EULA'}
      </Text>
      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
        {isTurkish ? 'Son Güncelleme: 4 Eylül 2026' : 'Last Updated: September 4, 2026'}
      </Text>

      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Onyx uygulamasını indirerek, yükleyerek veya kullanarak bu şartları ve iOS cihazlarda Apple Standart Son Kullanıcı Lisans Sözleşmesini (EULA) kabul etmiş sayılırsınız.'
          : 'By downloading, installing, or using Onyx, you agree to be bound by these terms and the Apple Standard End User License Agreement (EULA) on iOS devices.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '1. Abonelikler ve Otomatik Yenileme (IAP)' : '1. Subscriptions & In-App Purchases'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? '• Onyx Pro, aylık, yıllık veya ömür boyu erişim paketleri sunar.\n• Satın alma onayıyla birlikte ödeme Google Play veya Apple App Store hesabınızdan tahsil edilir.\n• Abonelikler, dönem bitiminden en az 24 saat önce iptal edilmediği sürece otomatik olarak yenilenir.\n• Aboneliğinizi cihazınızın Google Play veya Apple ID abonelik ayarlarından dilediğiniz an yönetebilir veya iptal edebilirsiniz.'
          : '• Onyx Pro offers monthly, annual, and lifetime access tiers.\n• Payment is charged to your Apple App Store or Google Play account at purchase confirmation.\n• Subscriptions automatically renew unless cancelled at least 24 hours prior to the end of the current billing cycle.\n• You can manage or cancel your subscriptions anytime in your App Store / Google Play account settings.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '2. Kullanım Kuralları' : '2. Acceptable Use'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Uygulamayı tersine mühendislik (reverse engineering) yaparak kopyalamak, ödeme ve reklam mekanizmalarını manipüle etmek veya yasadışı amaçlarla kullanmak yasaktır.'
          : 'You agree not to reverse engineer, decompile, or exploit in-app purchase mechanisms or ad reward systems.'}
      </Text>

      <Text style={[styles.subheading, { color: theme.colors.text }]}>
        {isTurkish ? '3. Sorumluluk Reddi' : '3. Disclaimer'}
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {isTurkish
          ? 'Onyx, alışkanlık takibi ve odaklanma yardımcısı olarak sunulmaktadır; tıbbi veya psikolojik bir tedavi taahhüdü içermez.'
          : 'Onyx is provided as a productivity habit tracker and focus aid and does not constitute medical advice.'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'privacy' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('privacy')}
            >
              <Shield size={16} color={activeTab === 'privacy' ? 'white' : theme.colors.textSecondary} />
              <Text style={[styles.tabButtonText, { color: activeTab === 'privacy' ? 'white' : theme.colors.textSecondary }]}>
                {t('privacyPolicy')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'terms' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('terms')}
            >
              <FileText size={16} color={activeTab === 'terms' ? 'white' : theme.colors.textSecondary} />
              <Text style={[styles.tabButtonText, { color: activeTab === 'terms' ? 'white' : theme.colors.textSecondary }]}>
                {t('termsOfService')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
          {activeTab === 'privacy' ? renderPrivacyContent() : renderTermsContent()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  textContainer: {
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default LegalModal;
