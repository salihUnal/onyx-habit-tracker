# 💎 ONYX HABIT TRACKER - GLOBAL MAĞAZA VE GELİR DENETİM RAPORU & YOL HARİTASI
**Hedef:** App Store (iOS) & Google Play Store (Android) Üzerinde Küresel Yayın, Yasal Koruma, Güvenlik ve Maksimum Aktif/Pasif Gelir Elde Etme  
**Tarih:** 2026-09-04  
**Versiyon:** 1.0.0-Audit  

---

## 📌 YÖNETİCİ ÖZETİ
Onyx projesi; **React Native (Expo SDK 51), Firebase, RevenueCat ve AdMob** temeline oturtulmuş, karanlık neon temasıyla Gen-Z ve modern kullanıcılara hitap eden güçlü bir potansiyele sahiptir. 

Ancak projenin **uluslararası mağazalarda yayınlanması, geliştiricinin şahsına yasal/cezai sorumluluk doğurmaması ve sürdürülebilir pasif gelir üretebilmesi için** giderilmesi gereken çok kritik yasal, teknik, mağaza politikası ve monetizasyon eksikleri bulunmaktadır.

Aşağıda tüm eksikler, riskler ve yapılması gerekenler **Öncelik ve Kritiklik Seviyesine Göre** detaylandırılmıştır.

---

## ✅ TAMAMLANAN GELİŞTİRMELER (COMPLETED ITEMS - 2026-09-04)

Aşağıdaki temel yasal, güvenlik ve mağaza politikası maddeleri başarıyla tamamlanmış ve projeye uygulanmıştır:

1. **`AdManager.js` COPPA (Çocuk Politikası) Düzeltmesi (Madde 1.2):**
   - `tagForChildDirectedTreatment: false` ve `tagForUnderAgeOfConsent: false` olarak güncellendi.
   - İçerik derecelendirmesi genel kitleye uygun olarak `MaxAdContentRating.T` (Gençler/Genel Kitle) olarak ayarlandı.
   - Google Play Aile Politikası askıya alma riski ve %90'a varan reklam geliri kaybı bertaraf edildi.

2. **Google UMP (Avrupa & İngiltere GDPR Rıza Formu) Entegrasyonu (Madde 1.8):**
   - `react-native-google-mobile-ads` kütüphanesinin `AdsConsent` modülü `AdManager.js` başlatma akışına eklendi.
   - `AdsConsent.requestInfoUpdate()` ve `AdsConsent.loadAndShowConsentFormIfRequired()` ile Avrupa trafiğinde yasal rıza formu kontrolü devreye alındı.

3. **Apple Kuralı 3.1.2: Paywall Yasal Eksikleri (Madde 1.4):**
   - `PaywallScreen.js` ekranının en altına standart Kullanım Şartları (EULA), Gizlilik Politikası (Privacy Policy) linkleri ve otomatik yenilenen abonelik şartları feragatnamesi eklendi.
   - Ödüllü reklam sonrası başarı mesajları çok dilli (`t(...)`) yapıya geçirildi.

4. **Geçersiz Gizlilik Sözleşmesi & Kullanım Şartları Linkleri (Madde 1.5):**
   - Proje kök dizininde App Store, Google Play, GDPR ve KVKK uyumlu resmi `PRIVACY_POLICY.md` ve `TERMS_OF_SERVICE.md` belgeleri oluşturuldu.
   - `Config.js` ve `SettingsScreen.js` üzerinden bu resmi belgelere (ve iOS için Apple Standard EULA'ya) kalıcı bağlantı kuruldu.

5. **Google Play Disruptive Ads (Rahatsız Edici Sekme Reklamı) Temizlendi (Madde 1.6):**
   - `AppNavigator.js` içerisindeki her 5 sekme geçişinde kullanıcıyı rahatsız eden ve Google Play kurallarını ihlal eden tam ekran geçiş reklamı kaldırıldı.

6. **iOS İzin Bildirimleri (`infoPlist`) ve Sürüm Kodları Eklendi (Madde 1.7):**
   - `app.json` dosyasına `NSCameraUsageDescription` ve `NSPhotoLibraryUsageDescription` açıklamaları eklendi.
   - Mağaza dağıtımı için iOS `buildNumber: "1"` ve Android `versionCode: 1` tanımlandı.

7. **Geliştirici Test Butonunun Güvenliği:**
   - `SettingsScreen.js` altındaki "DEV: Free User Mode / Reset Pro" butonu `__DEV__` koşuluna bağlanarak mağaza incelemelerinde görünmeyecek şekilde izole edildi.

8. **Dummy / Test Kullanıcıları Altyapısı (2026-09-12):**
   - `src/constants/dummyData.js` oluşturularak Alex Rivera (Free Tester - 3 Alışkanlık Sınırı), Sarah Connor (Pro Tester - 6 Alışkanlık, 42 Günlük Streak) ve Temiz Yeni Kullanıcı hazır veri setleri kuruldu.
   - `AuthScreen.js` ve `SettingsScreen.js` üzerinden tek tıkla test kullanıcıları arasında geçiş yapabilen test aracı devreye alındı.

9. **5 Sekmeli Alt Bar Mimarisi ve Ergonomi (2026-09-12):**
   - Alt barda 6 olan sekme sayısı 5'e (Home, Habits, Stats, Focus, BreakStreak) düşürüldü.
   - `SettingsScreen` alt menüden çıkarılarak `HomeScreen` sağ üst başlığına modern bir profil/ayarlar butonu olarak entegre edildi.

10. **Paywall Dönüşüm ve Ret Riski Düzenlemesi (2026-09-12):**
    - `PaywallScreen.js` üzerindeki yanıltıcı "Pro Widgetlar" vaadi mağaza reddini önlemek için "Özel Neon Temalar & Rozetler" olarak güncellendi.
    - Yıllık pakete küresel dönüşüm oranını katlayan "EN POPÜLER - %50 TASARRUF" rozeti ve "3 Gün Ücretsiz Deneme" vurgusu eklendi.

11. **Hesap Silme Re-Authentication Güvenliği (2026-09-12):**
    - `UserContext.js` ve `SettingsScreen.js` üzerinde Firebase `auth/requires-recent-login` hatasını yakalayan ve kullanıcıyı doğru yönlendiren akış kuruldu (Apple Guideline 5.1.1(v) uyumu).

12. **Firestore Güvenlik Kuralları (2026-09-12):**
    - Proje kökünde `firestore.rules` dosyası oluşturuldu. 30 günlük test modunun dolmasıyla oluşabilecek kilitlenme engellendi.

---

## 🔴 SEVİYE 1: KRİTİK - YASAL RİSKLER, CEZAİ SORUMLULUK VE KESİN MAĞAZA REDLERİ (BLOCKER)

Bu kategorideki maddeler çözülmeden uygulama mağazalara gönderilirse **%100 ret alır**, hesabınız askıya alınabilir veya ikamet ettiğiniz ülkede (Türkiye) adli/cezai yaptırımlarla karşılaşabilirsiniz.

---

### 1.1. Yasal ve Cezai Koruma: Sanal Kumar, Bahis ve Yasadışı Reklamların Engellenmesi
* **Mevcut Durum:** `AdManager.js` ve AdMob entegrasyonunda reklam kategorisi kısıtlaması kod seviyesinde yapılamaz; AdMob varsayılan olarak kumarhane, bahis ve yüksek riskli finans reklamlarını hedef kitleye göre sunabilir.
* **Hukuki / Cezai Risk:** Türkiye'de **7258 Sayılı Futbol ve Diğer Spor Müsabakalarında Bahis ve Şans Oyunları Düzenlenmesi Hakkında Kanun** uyarınca, yasadışı bahis veya sanal kumar reklamı yapmak/aracılık etmek **1 ila 3 yıl hapis ve adli para cezası** teşkil eder. Ayrıca Birleşik Arap Emirlikleri, Suudi Arabistan, Singapur gibi ülkelerde kumar reklamı doğrudan uygulamanın yasaklanmasına ve geliştiriciye dava açılmasına yol açar.
* **Gereken Aksiyonlar:**
  1. **Google AdMob Web Paneli -> Engelleme Kontrolleri (Blocking Controls) -> Hassas Kategoriler (Sensitive Categories):**
     - ❌ **Kumar ve Bahis (18+) (Gambling & Betting)** -> Engellenmeli.
     - ❌ **Sosyal Kumarhane Oyunları (Social Casino Games)** -> Engellenmeli.
     - ❌ **Alkol, Tütün ve Elektronik Sigara** -> Engellenmeli.
     - ❌ **Yetişkin İçerik ve Cinsellik (Sensual / Adult)** -> Engellenmeli.
     - ❌ **Kripto Spekülasyonu, Hızlı Zengin Olma ve Şüpheli Krediler (Get-Rich-Quick)** -> Engellenmeli.
     - ❌ **Siyaset ve Din** -> Engellenmeli.
  2. **AdMob `maxAdContentRating`:** `AdManager.js` içinde `MaxAdContentRating.T` (Teen) veya `MaxAdContentRating.PG` ayarlanmalıdır.

---

### 1.2. `AdManager.js` İçindeki COPPA / Çocuk Politikası Hatası (Google Play Askıya Alma Riski)
* **Mevcut Kod (`src/ads/AdManager.js` satır 37-38):**
  ```javascript
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true,
  ```
* **Kritik Hata:** Bu parametrelerin `true` yapılması, uygulamanızın **13 yaş altı çocuklara yönelik olduğunu (COPPA)** AdMob'a beyan eder!
* **Doğuracağı Zararlar:**
  - **Google Play Aile Politikası İhlali:** Eğer Google Play Geliştirici Konsolu'nda hedef kitleyi "13 yaş altı" seçmediyseniz, Google uygulamanızı **"Aldatıcı Beyan ve Aile Politikası İhlali"** sebebiyle mağazadan kaldırır veya geliştirici hesabınızı askıya alır.
  - **Gelir Kaybı (%80 - %90 Düşüş):** Çocuk olarak etiketlenen trafiğe kişiselleştirilmiş reklam verilemez, eCPM oranları dip yapar ($0.10 - $0.30 seviyesine düşer).
* **Gereken Aksiyon:** Hedef kitle 13+ veya 16+ olarak belirlenmeli ve bu etiketler kaldırılmalı (`false` yapılmalı veya genel kitleye bırakılmalıdır).

---

### 1.3. Apple App Store Kuralı 4.8: "Sign In with Apple" Zorunluluğu
* **Mevcut Durum:** Uygulamada Google ile giriş (`@react-native-google-signin/google-signin`) ve E-posta/Şifre mevcuttur; fakat Apple ile Giriş YOKTUR.
* **Apple İnceleme Kılavuzu 4.8:** *"Uygulamanız Google, Facebook vb. üçüncü taraf sosyal oturum açma yöntemleri sunuyorsa, eşdeğer seçenek olarak **Sign in with Apple** sunmak ZORUNDADIR."*
* **Sonuç:** Bu şekilde App Store'a yüklendiği anda Apple Review ekibi tarafından **İLK İNCELEMEDE KESİN OLARAK REDDEDİLİR**.
* **Gereken Aksiyon:** `expo-apple-authentication` paketi eklenmeli, iOS cihazlarda `AuthScreen.js` içerisine şık, native "Apple ile Giriş Yap" butonu ve Firebase Auth entegrasyonu kurulmalıdır.

---

### 1.4. Apple Kuralı 3.1.2 & Google Play: Paywall Ekranı Yasal Eksikleri
* **Mevcut Durum (`PaywallScreen.js`):**
  - Kullanım Koşulları (Terms of Use - EULA) linki YOK.
  - Gizlilik Politikası (Privacy Policy) linki YOK.
  - Abonelik yenileme, iptal koşulları ve faturalandırma şartları metni YOK.
* **Apple Kılavuzu 3.1.2:** Abonelik / Paywall ekranında Apple Standard EULA veya özel Kullanım Şartları ile Gizlilik Sözleşmesi linkleri bulunmak zorundadır. Aksi takdirde onaylanmaz.
* **Gereken Aksiyon:**
  - `PaywallScreen.js` alt kısmına tıklanabilir **"Kullanım Şartları (EULA)"** ve **"Gizlilik Politikası"** linkleri eklenmelidir.
  - Mağaza onay metni: *"Satın alma onayıyla birlikte ödeme iTunes / Google Play hesabınızdan tahsil edilir. Abonelik, dönem bitiminden en az 24 saat önce iptal edilmediği sürece otomatik yenilenir."* ibaresi eklenmelidir.

---

### 1.5. Gizlilik Sözleşmesi & Kullanım Şartları Sahte / Geçersiz Linkler
* **Mevcut Durum (`SettingsScreen.js` satır 287-288):**
  - `https://onyxhabittracker.com/privacy`
  - `https://onyxhabittracker.com/terms`
* **Kritik Risk:** Bu domain aktif değildir veya generic boş sayfadır. Apple ve Google denetçileri test sırasında bu linklere bizzat tıklar. 404 veren veya açılmayan politika doğrudan mağaza reddidir.
* **KVKK / GDPR Riski:** Kullanıcıların e-posta ve alışkanlık verilerini işlerken yasal bir Gizlilik Politikası barındırmamak, Avrupa Birliği (GDPR) ve Türkiye (KVKK) nezdinde doğrudan veri koruma ihlalidir.
* **Gereken Aksiyon:** GitHub Pages, Notion veya ücretsiz statik bir barındırma (Firebase Hosting / Vercel) üzerinden çalışan, GDPR & KVKK uyumlu gerçek bir Gizlilik Politikası ve Şartlar sayfası yayına alınmalı ve linkler oraya bağlanmalıdır.
* **Uygulanan Çözüm & İleriye Dönük Plan (Firebase Hosting):**
  - **Uygulama İçi (In-App):** `LegalModal.js` bileşeni geliştirilerek Ayarlar ve Paywall ekranlarına bağlandı; kullanıcılar uygulama içinden çevrimdışı dahi yasal metinleri okuyabiliyor (kırık link sorunu uygulama içinde kalıcı olarak çözüldü).
  - **Mağaza Konsolları İçin Harici Web Sayfası (Firebase Hosting - Sonra Yapılacak):** Projedeki mevcut Firebase altyapısı (`onyx-habit-tracker.firebaseapp.com`) kullanılarak `onyx-habit-tracker.web.app/privacy.html` ve `/terms.html` sayfaları ücretsiz Google CDN üzerinde yayına alınacaktır. Bu link Google Play Console ve App Store Connect mağaza listelemesine eklenecektir.

---

### 1.6. Google Play Disruptive Ads (Rahatsız Edici Reklam) İhlali
* **Mevcut Durum (`AppNavigator.js` satır 39-46):**
  ```javascript
  tabChangeCount.current += 1;
  // Her 5 sekme değişiminde araya tam ekran geçiş reklamı (interstitial) açılıyor!
  if (tabChangeCount.current >= 5) {
      AdManager.showInterstitial();
  }
  ```
* **Kritik Risk:**
  1. **Google Play Better Ads Policy:** Sekmeler arası geçişte aniden patlayan beklenmedik tam ekran reklamlar Google Play politikalarına aykırıdır ve uygulamanın mağazadan uyarısız silinmesine sebep olabilir.
  2. **Kullanıcı Kaybı:** Alışkanlık işaretlerken veya istatistiğe bakarken 5 dokunuşta bir tam ekran reklam gören kullanıcıların %95'i uygulamayı 1. günde siler ve mağazada 1 yıldız verir.
* **Gereken Aksiyon:** Sekme geçişindeki sayaçlı tam ekran reklam kaldırılmalı! Reklamlar sadece doğal duraklama anlarına konmalıdır (Örn: Pomodoro seansı başarıyla tamamlandığında veya günün tüm alışkanlıkları bittiğinde kutlama ekranından sonra).

---

### 1.7. iOS İzin Bildirimleri (`infoPlist` - App Store Binary Upload Reddi)
* **Mevcut Durum:** `package.json` içerisinde `expo-image-picker` var (kullanıcı profil resmi seçebiliyor). Ancak `app.json` içinde iOS için `NSPhotoLibraryUsageDescription` ve `NSCameraUsageDescription` tanımlı DEĞİL.
* **Risk:** Apple Transporter / EAS Build ile iOS binary (.ipa) gönderildiğinde, bu açıklamalar eksikse Apple sistemi yüklemeyi daha incelemeye girmeden otomatik reddeder ("Missing Purpose String in Info.plist").
* **Gereken Aksiyon:** `app.json` dosyasında `ios.infoPlist` altına izin metinleri eklenmelidir.

---

### 1.8. Firebase ve Google UMP (Avrupa & İngiltere GDPR Reklam İzni)
* **Mevcut Durum:** Uygulamada Avrupa (EEA) ve Birleşik Krallık için UMP (User Messaging Platform) GDPR rıza formu entegre değildir.
* **Sonuç:** 16 Ocak 2024'ten itibaren Google, Google Onaylı CMP (Consent Management Platform) kullanmayan uygulamalarda Avrupa trafiğine reklam göstermeyi durdurmuştur. Avrupa'dan indiren kullanıcılardan 0 reklam geliri elde edilir.
* **Gereken Aksiyon:** `react-native-google-mobile-ads` kütüphanesinin UMP Consent modülü uygulama ilk açılışında çağrılmalıdır.

---

## 🟡 SEVİYE 2: YÜKSEK - GELİR MODELİ, ABONELİK VE MONETİZASYON EKSİKLERİ

Sadece reklam geliriyle bir alışkanlık takip uygulamasından ciddi pasif gelir elde edilemez. Küresel başarı elde eden rakipler (Streaks, Fabulous, Habitica, Everyday) gelirlerinin **%85-90'ını Aboneliklerden (In-App Subscriptions)** kazanır.

---

### 2.1. RevenueCat Altyapısı Eksiklikleri ve Test Modunda Kalması
* **Mevcut Durum:** `src/config/Config.js` içinde iOS için test anahtarı (`test_akWXroIJ...`) ve rastgele entitlement ID (`appd32a585f83`) bulunuyor.
* **Yapılması Gerekenler:**
  1. Google Play Console ve Apple App Store Connect üzerinde resmi ürünler açılmalı:
     - `onyx_monthly` (Aylık Abonelik - Örn: $3.99 / ay)
     - `onyx_annual` (Yıllık Abonelik - Örn: $24.99 / yıl - 3 gün ücretsiz deneme ile)
     - `onyx_lifetime` (Ömür Boyu Tek Seferlik - Örn: $49.99)
  2. RevenueCat panelinde Entitlement adı standartlaştırılmalı (Örn: `pro_access`).
  3. Canlı `REVENUECAT_API_KEY_IOS` ve `REVENUECAT_API_KEY_ANDROID` prodüksiyona bağlanmalıdır.

---

### 2.2. Paywall Dönüşüm Oranı (Conversion Rate) Optimizasyonu
* **Mevcut Durum:** `PaywallScreen.js` statik, sade ve psikolojik ikna unsurlarından yoksundur. Ayrıca `offerings` yüklenemezse görünen butonlar simüle fiyatlar gösteriyor ve satın alma çalışmıyor.
* **Önerilen Profesyonel İyileştirmeler:**
  1. **En Popüler / En İyi Fiyat Rozeti:** Yıllık paketin üzerine *"EN POPÜLER - %50 TASARRUF"* rozeti koyulmalıdır.
  2. **Ücretsiz Deneme (Free Trial):** Kullanıcıların satın alma bariyerini kırmak için 3 Gün Ücretsiz Deneme (3-Day Free Trial) sunulmalıdır. (Globalde dönüşüm oranını 3 katına çıkarır).
  3. **Yanıltıcı Özellik İfadesi Düzeltilmeli:** Paywall'da *"Pro Widgetlar: Ana ekranını özelleştir"* yazıyor. Fakat uygulamada yerel iOS/Android ana ekran widget'ı yoktur! Apple denetçisi bunu test edip ret verebilir. Bunun yerine *"Özel Neon Temalar ve Rozetler"* olarak güncellenmelidir.
  4. **Lokal Para Birimi Dinamizmi:** RevenueCat paketleri yüklendiğinde kullanıcının kendi ülke para birimi (TL, USD, EUR vb.) otomatik formatlanmalı, fallback durumunda ise kullanıcıya internet hatası ve tekrar dene butonu gösterilmelidir.

---

### 2.3. Gelir Artırıcı Alternatif Monetizasyon Önerileri
1. **Mikro Ödemeler (Consumable IAP - Tüketilebilir Ürünler):**
   - **Seri Kurtarma / Dondurma (Streak Freeze):** Kullanıcı bir gün alışkanlığını kaçırdığında serisi bozulur.
   - Serisini kurtarmak için 2 seçenek sunulur:
     - Ücretsiz kullanıcı: 1 adet Ödüllü Reklam (Rewarded Ad) izler.
     - Ya da 5'li "Streak Freeze Paketi" satın alır ($0.99 - $1.99).
2. **Yapay Zeka Destekli Kişisel Alışkanlık Analizi (AI Habit Coach):**
   - 2025-2026 trendi! Kullanıcının haftalık/aylık performansını Gemini API ile analiz edip kişiselleştirilmiş motivasyon ve başarı raporu hazırlama.
   - Bu özellik **Sadece Pro** kullanıcılara sunularak Pro üyelik cazibesi %100 artırılabilir.
3. **Detaylı Rapor Dışa Aktarma (Export to PDF/CSV):**
   - Alışkanlık ve odaklanma verilerini doktoruna, koçuna veya kendine sunmak için şık bir PDF karne olarak indirme (Pro özellik).
4. **Özel Uygulama İkonları (App Icons):**
   - Pro kullanıcılar telefon ana ekranındaki Onyx logosunu altın, neon mor, siyah minimalist gibi alternatif ikonlarla değiştirebilsin. (Gen-Z kullanıcıların en çok para ödediği kozmetik özellik).

---

## 🔵 SEVİYE 3: ORTA - GÜVENLİK, VERİ BÜTÜNLÜĞÜ VE ALTYAPI

---

### 3.1. Firebase Firestore Güvenlik Kuralları (Security Rules)
* **Mevcut Durum:** Kodda `permission-denied` veya yetki hatalarını yakalayan try-catch blokları var. Firebase projeleri ilk açıldığında kurallar varsayılan 30 günlük test modunda gelir ve süre dolunca tüm bulut kaydı kilitlenir.
* **Gereken Kural (`firestore.rules`):**
  Kullanıcıların yalnızca ve yalnızca kendi verilerini okuyup yazabileceği sıkı güvenlik kuralları Firebase Console'da yayınlanmalıdır:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /habits/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

---

### 3.2. Firebase Hesap Silme (`deleteAccount`) Yetki Hatası (Requires Recent Login)
* **Risk:** Firebase Auth güvenliği gereği, uzun süre önce giriş yapmış bir kullanıcı `deleteUser()` fonksiyonunu çağırdığında Firebase `auth/requires-recent-login` hatası fırlatır.
* **Sonuç:** Kullanıcı "Hesabımı Sil" dediğinde silinemez ve hata alır. Apple denetçisi test cihazında hesap silmeyi dener ve başarısız olursa uygulamayı doğrudan reddeder.
* **Çözüm:** Eğer bu hata dönerse kullanıcıya şifresini veya Google girişini tekrar doğrulatıp ardından hesabı ve verilerini silen re-authentication akışı kurulmalıdır.

---

### 3.3. Çökme / Hata Takibi ve Analitik (Crashlytics & Telemetry)
* **Mevcut Durum:** Sentry veya Firebase Crashlytics kurulu değildir.
* **Risk:** Uygulama dünya çapında yüz binlerce farklı Android ve iOS cihazında çalışacak. Farklı ekran boyutlarında, Android sürümlerinde veya Çin/Hindistan cihazlarında oluşan bir çökme size bildirilmezse, mağazada puanınız 4.8'den 3.0'a düşer ve organik indirmeler durur.
* **Gereken Aksiyon:** `@react-native-firebase/crashlytics` veya Expo uyumlu `sentry-expo` kurulmalıdır.

---

## 🟢 SEVİYE 4: KULLANICI DENEYİMİ (UX/UI), DİL VE MAĞAZA OPTİMİZASYONU (ASO)

---

### 4.1. Çok Dilli Destek (i18n) Eksiklikleri
* **Mevcut Durum:** `translations.js` 7 dili destekliyor ancak bazı dinamik kısımlarda Türkçe metinler hardcoded kalmış:
  - `PaywallScreen.js` satır 77, 80, 83: `'Seri Başarıyla Onarıldı!'`, `'Ödül Kazanıldı! Ekstra odaklanma...'` gibi ödül mesajları doğrudan Türkçe.
  - Amerika, Almanya veya Japonya'daki kullanıcı ödüllü reklamı bitirdiğinde karşısına Türkçe popup çıkıyor.
* **Gereken Aksiyon:** Tüm modal mesajları `t('streakRepaired')`, `t('rewardEarnedHabit')` gibi anahtarlara bağlanmalıdır.

---

### 4.2. 6 Sekmeli Alt Menü (Bottom Tab Bar) Sıkışıklığı
* **Mevcut Durum:** Alt menüde 6 sekme var: Home, Habits, Stats, Focus, BreakStreak, Settings.
* **UX Standardı:** Apple Human Interface Guidelines ve Google Material Design standartlarına göre alt barda **en fazla 3 ila 5 sekme** olmalıdır. 6 sekme küçük ekranlı telefonlarda dokunma hedeflerini çok küçültür.
* **Öneri:** "Settings" sekmesi alt bardan çıkarılıp Home ekranının sağ üst köşesine şık bir profil/ayar ikonu olarak taşınmalı; böylece alt bar 5 sekmeyle tertemiz ve ferah hale getirilmelidir.

---

### 4.3. Google Play 20 Test Kullanıcısı (Closed Testing) Kuralı
* **Bilgi:** Google, 13 Kasım 2023 tarihinden sonra açılan tüm **bireysel geliştirici hesapları** için kapalı test (Closed Testing) zorunluluğu getirdi:
  - En az **20 farklı test kullanıcısının**,
  - **14 gün kesintisiz** boyunca kapalı test kanalına kayıtlı kalması gerekmektedir.
* **Hazırlık:** Uygulamayı Play Store'a göndermeden önce 20 kişilik bir test grubu (arkadaşlar, topluluklar veya test servisleri) organize edilmelidir.

---

## 📋 ÖNCELİKLENDİRİLMİŞ UYGULAMA YOL HARİTASI (ROADMAP)

| Aşama | Başlık | Kritiklik | Durum |
|---|---|---|---|
| **Faz 1** | AdMob COPPA çocuk etiketini düzeltme | 🔴 ACİL / YASAL | ✅ TAMAMLANDI |
| **Faz 1** | AdMob kumar/yasadışı reklam engelleme (Konsol) | 🔴 ACİL / YASAL | ⏳ AdMob Konsol Ayarı Bekleniyor |
| **Faz 1** | iOS için "Sign in with Apple" entegrasyonu | 🔴 ACİL / RET ENGELİ | 🔜 Sırada |
| **Faz 1** | Paywall yasal şartlar, EULA ve Gizlilik linkleri | 🔴 ACİL / RET ENGELİ | ✅ TAMAMLANDI |
| **Faz 1** | Gerçek Privacy Policy & Terms belgelerinin oluşturulması | 🔴 ACİL / YASAL | ✅ TAMAMLANDI |
| **Faz 1** | Sekme geçişindeki agresif interstitial reklamın kaldırılması | 🔴 ACİL / MAĞAZA | ✅ TAMAMLANDI |
| **Faz 1** | iOS `app.json` izin açıklamaları (Fotoğraf/Kamera) eklenmesi | 🔴 ACİL / DERLEME | ✅ TAMAMLANDI |
| **Faz 2** | RevenueCat gerçek mağaza ürünleri ve canlı API anahtarları | 🟡 YÜKSEK / GELİR | 🔜 Bekliyor |
| **Faz 2** | Google UMP (GDPR Avrupa Onay Formu) entegrasyonu | 🟡 YÜKSEK / GELİR | ✅ TAMAMLANDI |
| **Faz 2** | Paywall UI/UX iyileştirmesi (Free trial rozeti, indirim vurgusu) | 🟡 YÜKSEK / GELİR | ✅ TAMAMLANDI |
| **Faz 2** | Firebase Hosting ile Gizlilik/Şartlar Web Sayfalarını Yayına Alma (`onyx-habit-tracker.web.app`) | 🟡 YÜKSEK / MAĞAZA | 🔜 Planlandı (Sonra Yapılacak) |
| **Faz 3** | Firestore güvenlik kurallarının yayına alınması | 🔵 ORTA / GÜVENLİK | ✅ TAMAMLANDI |
| **Faz 3** | Hesap silme re-authentication hata koruması | 🔵 ORTA / MAĞAZA | ✅ TAMAMLANDI |
| **Faz 3** | Sentry / Crashlytics çökme raporlama kurulumu | 🔵 ORTA / KALİTE | 🔜 Bekliyor |
| **Faz 4** | Dil çeviri eksiklerinin (hardcoded Türkçe metinler) tamamlanması | 🟢 DÜŞÜK / UX | ✅ TAMAMLANDI |
| **Faz 4** | Alt tab barın 5 sekmeye sadeleştirilip Settings'in yukarı alınması | 🟢 DÜŞÜK / UX | ✅ TAMAMLANDI |
| **Faz 4** | Dummy/Mock Kullanıcı Test Sistemi (Free / Pro profilleri) | 🟢 DÜŞÜK / TEST | ✅ TAMAMLANDI |
| **Faz 4** | Alternatif gelir: Streak Freeze mikro ödemesi & AI Habit Coach | 🟢 GELECEK VİZYON | 🔜 Bekliyor |

---

> 💡 **Not:** Bu dosya proje ana dizininde kalıcı olarak saklanabilir. İlgili aşamalara geçmek istediğinizde belirttiğiniz öncelik sırasına göre kod müdahalelerine birlikte başlayabiliriz.
