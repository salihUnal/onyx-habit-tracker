# 📌 ONYX HABIT TRACKER - YAPILACAKLAR LİSTESİ VE EYLEM PLANI (ROADMAP)

**Son Güncelleme:** 08 Ekim 2026  
**Durum:** Kod altyapısı %100 tamamlandı ve tüm ekran hataları giderildi. Geriye yalnızca mağaza dağıtım ve konsol adımları kalmıştır.

---

## 🔴 SEVİYE 1: GOOGLE PLAY STORE CANLIYA ÇIKIŞ VE DAĞITIM ADIMLARI

- [x] **1.1. Release Keystore ve İmzalama Yapılandırması ([build.gradle](file:///d:/Github/onyx-habit-tracker/android/app/build.gradle#L127-L145)):**
  - **Durum:** ✅ **TAMAMLANDI.** `android/app/release.keystore` PKCS12 formatında 10.000 gün geçerlilikle üretildi.
  - [gradle.properties](file:///d:/Github/onyx-habit-tracker/android/gradle.properties) içine `MYAPP_UPLOAD_STORE_FILE=release.keystore` ve alias ayarları eklendi.
  - Gradle `signingReport` ile release konfigürasyonunun başarıyla bağlandığı doğrulandı.
  - **Keystore Bilgileri:**
    - Dosya Yolu: `android/app/release.keystore`
    - Alias: `onyx-release-key`
    - Şifre: `onyx2026release`

- [x] **1.2. Google Sign-In Android SHA-1 ve SHA-256 Parmak İzi Tespiti:**
  - **Durum:** ✅ **TAMAMLANDI.** Keystore parmak izleri çıkarıldı.
  - **Konsola Eklenecek Parmak İzleri:**
    - **Release Keystore:**
      - SHA-1: `BF:D7:CA:A1:2D:06:B0:CD:51:A8:02:7D:FB:86:FE:0C:D2:F2:5A:C0`
      - SHA-256: `07:A9:2F:4F:F9:CE:C7:3A:A4:01:63:3C:C3:B0:D6:0B:9A:D0:F0:13:13:D9:8F:33:E2:CA:8D:61:24:B6:82:EB`
    - **Debug Keystore (Geliştirme için):**
      - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
      - SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
  - **Kullanıcı Aksiyonu:** Firebase Console -> Proje Ayarları -> Android Uygulaması (com.onyx.habittracker) -> "Parmak izi ekle" alanına yukarıdaki SHA-1 ve SHA-256 parmak izlerini ekleyip güncel `google-services.json` dosyasını indirmek yeterlidir.

- [x] **1.3. AAB (Android App Bundle) Derleme Scripti ve Proguard Optimizasyonu:**
  - **Durum:** ✅ **TAMAMLANDI.** 
  - [package.json](file:///d:/Github/onyx-habit-tracker/package.json) içine `npm run build:aab` ve `npm run build:apk` scriptleri entegre edildi.
  - [proguard-rules.pro](file:///d:/Github/onyx-habit-tracker/android/app/proguard-rules.pro) içine RevenueCat, Google Play Billing, Google Mobile Ads ve Google Sign-In için R8 koruma kuralları eklendi.

- [ ] **1.4. Google Play 20 Test Kullanıcısı (Kapalı Test / Closed Testing - 14 Gün Kuralı):**
  - **Kural:** 2023 sonrası açılan bireysel Google Play Developer hesaplarında doğrudan canlıya çıkılamaz.
  - **Aksiyon:** `npm run build:aab` ile üretilen AAB paketi Google Play Console -> "Kapalı Test" (Closed Testing) kanalına yüklenmeli ve 20 test kullanıcısı ile 14 günlük süreç başlatılmalıdır.

---

## 🟡 SEVİYE 2: DIŞ SERVİS VE KONSOL YAPILANDIRMALARI (GELİR & GÜVENLİK)

- [ ] **2.1. RevenueCat ve Google Play Billing Abonelik Eşleştirmesi:**
  - Google Play Console -> Monetize -> Subscriptions altında paketler oluşturulmalı:
    - `onyx_monthly` (Aylık Pro)
    - `onyx_annual` (Yıllık Pro - 3 Gün Ücretsiz Deneme)
    - `onyx_lifetime` (In-App Products - Ömür Boyu Pro)
  - RevenueCat kontrol panelinde Google Play Service Account JSON anahtarı bağlanmalı.
  - Entitlement ID: `appd32a585f83` olarak [Config.js](file:///d:/Github/onyx-habit-tracker/src/config/Config.js#L6) ile birebir eşleştirilmelidir.

- [x] **2.2. AdMob Reklam Birimleri, Ödüllü Geçiş ve app-ads.txt ([Config.js](file:///d:/Github/onyx-habit-tracker/src/config/Config.js#L8-L14)):**
  - **Durum:** ✅ **TAMAMLANDI.**
  - **Kayıtlı Reklam Birimleri:**
    - App ID: `ca-app-pub-9005956424727190~4380402516`
    - İlk Banner: `ca-app-pub-9005956424727190/6614849461`
    - Geçiş Reklamı: `ca-app-pub-9005956424727190/3997259137`
    - Normal Ödüllü Reklam: `ca-app-pub-9005956424727190/2074459914`
    - Ödüllü Geçiş Reklamı (Rewarded Interstitial): `ca-app-pub-9005956424727190/9058014129`
  - [AdManager.js](file:///d:/Github/onyx-habit-tracker/src/ads/AdManager.js) içine hem `RewardedAd` hem de `RewardedInterstitialAd` akıllı fallback kurgusuyla dahil edildi.
  - Proje kökünde [app-ads.txt](file:///d:/Github/onyx-habit-tracker/app-ads.txt) dosyası oluşturuldu.
  - GDPR rıza formu (UMP) ve COPPA çocuk koruması koda entegre edildi.

- [ ] **2.3. Herkese Açık Gizlilik Politikası Web Sayfası:**
  - Play Console mağaza girişinde girilen link doğrudan herkese açık bir web sayfası olmalıdır.
  - Proje kökündeki [PRIVACY_POLICY.md](file:///d:/Github/onyx-habit-tracker/PRIVACY_POLICY.md) GitHub üzerinden canlıdadır:
    `https://github.com/salihUnal/onyx-habit-tracker/blob/main/PRIVACY_POLICY.md`

---

## 🟢 SEVİYE 3: OPSİYONEL GELECEK ÖZELLİKLERİ (ROADMAP V2)

- [ ] **3.1. Gerçek Ana Ekran Widget'ları (iOS WidgetKit & Android Glance):**
  - [WidgetStoreScreen.js](file:///d:/Github/onyx-habit-tracker/src/screens/settings/WidgetStoreScreen.js) şu anda uygulama içi kart stillerini özelleştirmektedir. Gelecek sürümde `react-native-android-widget` veya Expo Config Plugin kullanılarak Android ana ekranında doğrudan tamamlanabilen gerçek widget'lar eklenebilir.

- [ ] **3.2. Firebase Analytics veya Mixpanel Entegrasyonu:**
  - Alışkanlık tamamlama oranları, paywall dönüşüm oranı ve focus oturumu tamamlama metriklerini ölçümlemek için event analitiği bağlanabilir.

---

## 📋 TAMAMLANAN GELİŞTİRMELER ARŞİVİ

- [x] **[2026-10-08]** `BreakStreakScreen.js` kötü alışkanlık düzenleme/yeniden adlandırma fonksiyonu (`updateBreakHabit`) [HabitContext.js](file:///d:/Github/onyx-habit-tracker/src/context/HabitContext.js) içine eklenerek bağlandı.
- [x] **[2026-10-08]** `SettingsScreen.js` profil düzenleme ve şifre belirleme form modallarına `KeyboardAvoidingView` koruması eklendi.
- [x] **[2026-10-08]** `FocusScreen.js` dikey ekran taşmalarını önlemek amacıyla `ScrollView` ile güçlendirildi.
- [x] **[2026-10-08]** `scripts/audit-engine.js` ve `scripts/run-all-tests.js` denetim araçlarındaki i18n ve responsive tespit motorları dinamikleştirildi; 0 hata ile doğrulandı.
- [x] **[2026-10-08]** `scripts/test_dummy_users.js` test kümesine 3 alışkanlık limiti, Pro sınırsız ekleme ve kötü alışkanlık isim güncelleme testleri eklendi.
- [x] **[2026-10-08]** 7 Dilde (İngilizce, Türkçe, Almanca, İspanyolca, İtalyanca, Rusça, Çince) 260 çeviri anahtarının tamamı eşitlendi (%100 kapsama).
- [x] **[2026-09-21]** Apple Guideline 3.1.2 uyumlu "Satın Alımı Geri Yükle" (Restore Purchase) ve "Aboneliği Yönet" butonları eklendi.
- [x] **[2026-09-21]** Android 13+ bildirim izinleri (`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`) ve `NotificationService` entegrasyonu tamamlandı.
- [x] **[2026-09-21]** Firestore senkronizasyonuna 5 saniyelik zaman aşımı (`withTimeout`) eklenerek çevrimdışı kilitlenmeler engellendi.
- [x] **[2026-09-21]** Play Store gereksinimi olan "Hesap Silme" ([deleteAccount](file:///d:/Github/onyx-habit-tracker/src/context/UserContext.js#L470-L530)) Firestore ve Auth bağlantılarıyla tamamlandı.
- [x] **[2026-09-18]** `AuthScreen.js` içindeki test butonu `__DEV__` korumasına alındı.
- [x] **[2026-09-18]** EmptyState yönlendiricileri ve tüm `TouchableOpacity` bileşenlerine standart `activeOpacity={0.7}` eklendi.
