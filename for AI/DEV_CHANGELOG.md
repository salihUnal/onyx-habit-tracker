# DEVELOPER AGENT - CHANGELOG

## Tarih: 2026-09-21 (Global Mağaza Standartları, Yasal Uyum & Dayanıklılık)

### 1. WidgetStore & Mağaza Politikası Temizliği (Seçenek A)
* `src/screens/settings/WidgetStoreScreen.js` üzerinde Google Play / App Store yanıltıcı içerik riski temizlendi; ekran "Uygulama İçi Kart & Bileşen Temaları" olarak netleştirildi.
* `useSafeAreaInsets` entegrasyonu tamamlandı; Android edge-to-edge ve iOS notch / Dynamic Island taşmaları engellendi.

### 2. Legal / Paywall & Restore Purchase Standartları (Seçenek B)
* `src/i18n/translations.js`: 7 dilde (`English`, `Türkçe`, `German`, `Spanish`, `Italian`, `Russian`, `Chinese`) yasal ve abonelik yönetimi anahtarları (`manageSubscription`, `manageSubscriptionDesc`, `subscriptionTerms`, `viewOnline`, `openLinkError`) eklendi.
* `src/screens/settings/LegalModal.js`: `useSafeAreaInsets` ile yenilendi; `Gizlilik Politikası`, `Kullanım Şartları` ve özel `EULA` olmak üzere 3 sekme haline getirildi; GitHub ve Apple resmi bağlantılarına açılan web butonları eklendi.
* `src/screens/paywall/PaywallScreen.js`: Geri yükleme (Restore Purchases) işlemine `restoring` yüklenme durumu (`ActivityIndicator`) eklendi; abonelik bulunamadığında Apple standardı uyarınca `Alert.alert` uyarısı verildi; alt alana `Gizlilik` • `Şartlar` • `EULA` bağlantıları yerleştirildi.
* `src/screens/settings/SettingsScreen.js`: `restorePurchases` butonu Apple Guideline 3.1.2 uyarınca Pro ve Free tüm kullanıcılara sürekli görünür kılındı; Pro kullanıcılar için App Store / Google Play abonelik yönetimine doğrudan giden "Aboneliği Yönet" butonu ve "Hakkında" alanına EULA seçeneği eklendi.

### 3. Bildirimler ve Android 13+ İzinleri (Seçenek C)
* `android/app/src/main/AndroidManifest.xml`: Android 13+ için zorunlu `POST_NOTIFICATIONS`, cihaz yeniden başlatma için `RECEIVE_BOOT_COMPLETED` ve kesin saat alarmı için `SCHEDULE_EXACT_ALARM` izinleri eklendi.
* `app.json`: `expo-notifications` eklentisi logo ve tema rengiyle (`#6366F1`) yapılandırıldı.
* `src/services/NotificationService.js`: Android için yüksek öncelikli bildirim kanalları (`habit-reminders`, `streak-protection`), alışkanlık bazlı saatlik alarm kurma (`scheduleHabitReminder`), iptal etme (`cancelHabitReminder`), liste senkronizasyonu (`syncAllHabitReminders`) ve sabah 09:00 genel hatırlatıcı (`scheduleDailyReview`) fonksiyonları geliştirildi.
* `src/screens/home/HabitsScreen.js` & `src/context/HabitContext.js`: Alışkanlık ekleme/düzenleme/silme akışları `NotificationService` ile tam entegre edildi.

### 4. Firebase / Firestore Çevrimdışı Dayanıklılık (Seçenek D)
* `src/context/HabitContext.js`: `loadFromCloud` ve `syncWithCloud` fonksiyonlarına 5 saniyelik zaman aşımı (`withTimeout`) eklendi. Cihaz çevrimdışıyken veya internet çok yavaşken uygulamanın donması engellendi.
* **Local-First İlkesi:** `AsyncStorage` birincil önbellek olarak tutuluyor; internetsiz ortamda tüm alışkanlık tamamlamaları kaydedilir, internet geldiğinde sessizce Firestore'a yedeklenir.

### 5. Kapsamlı Test ve Doğrulama (Seçenek E)
* Ayarlar ekranındaki `Sarah Connor (Pro)`, `Alex Rivera (Free)` ve `Temiz Kullanıcı (Clean)` profilleri test edildi.
* 7 ana servis ve ekran dosyası (`NotificationService`, `HabitsScreen`, `HabitContext`, `SettingsScreen`, `PaywallScreen`, `LegalModal`, `translations`) Expo Babel derleyicisi ile test edilip 0 derleme hatasıyla doğrulandı.

---

## Tarih: 2026-09-18
### Düzeltilen Hatalar
1. `src/screens/home/HabitsScreen.js` - CLEAN profili için profesyonel bir empty state bileşeni eklendi. - Yeni kullanıcı deneyimini artırmak ve uygulamanın boş görünümünden ziyade alışkanlık eklemeye teşvik etmek için gerekliydi.
2. `src/screens/auth/AuthScreen.js` - E-posta modalı içeriği `KeyboardAvoidingView` ile sarmalandı. - Klavye açıldığında input alanlarının kapanmasını önlemek ve kullanıcı deneyimini iyileştirmek için elzemdi.
3. `src/screens/break/BreakStreakScreen.js` - Alışkanlık ekleme modalı `KeyboardAvoidingView` ile sarmalandı. - Klavye açıldığında formun yukarı kayarak görünür kalması için gerekliydi.
4. `src/theme/colors.js` - Eksik olan (error, success, warning, info, accent, gold) renk kodları light ve dark temalarına eklendi. - Farklı ekranlarda UI tutarlılığı ve dinamik temalandırma desteği sağlamak için gerekliydi.
5. `Projedeki tüm ekranlar ve bileşenler` - `activeOpacity` prop'u eksik olan tüm `TouchableOpacity` bileşenlerine `activeOpacity={0.7}` eklendi. - Uygulama genelinde dokunma geribildirimi hissiyatını standart ve profesyonel seviyeye taşımak için yapıldı.
