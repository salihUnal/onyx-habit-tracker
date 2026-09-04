# 💎 ONYX HABIT TRACKER - KÜRESEL MAĞAZA VE GELİR DENETİM RAPORU

**Hedef:** App Store (iOS) & Google Play Store (Android) Üzerinde Küresel Yayın, Yasal Koruma, Güvenlik ve Maksimum Aktif/Pasif Gelir Elde Etme  
**Proje Temeli:** React Native (Expo SDK 51, Firebase, RevenueCat, AdMob)  

---

## 📌 Giriş ve Yönetici Özeti

Onyx projenizi derinlemesine ve satır satır inceledim. Amacınız olan **küresel çapta indirilme, aktif/pasif gelir elde etme, yasal ve cezai güvenceye sahip olma ve profesyonel mağaza standartlarını yakalama** hedefleriniz doğrultusunda kapsamlı bir denetim gerçekleştirdim.

Şu anki projeniz tasarım ve ana akışlar açısından güçlü bir temele sahip olsa da, **mağazalara bu haliyle gönderildiği takdirde kesinlikle ret alacak kritik teknik/yasal eksikler**, **reklam ve veri gizliliği kaynaklı yasal/cezai riskler** ve **gelir potansiyelini kısıtlayan monetization açıkları** bulunmaktadır.

Tüm bu tespitler öncelik ve kritiklik derecelerine göre aşağıda sınıflandırılmıştır.

---

## 🔴 SEVİYE 1: KRİTİK - YASAL RİSKLER, CEZAİ SORUMLULUK VE KESİN MAĞAZA RETLERİ (BLOCKER)

Bu gruptaki maddeler, hem geliştirici olarak şahsınızın hukuki/cezai güvenliği hem de uygulamanın App Store ve Play Store tarafından onaylanması için **birinci öncelikli olarak çözülmesi gereken** konulardır.

### 1.1. Yasal/Cezai Güvence: Kumar, Bahis ve Yasadışı Reklamların Engellenmesi
> [!CAUTION]
> **Hukuki Ceza Riski:** Türkiye'de **7258 Sayılı Kanun** kapsamında yasadışı bahis, kumar veya şans oyunlarının reklamını yapmak veya buna aracılık etmek **1 yıldan 3 yıla kadar hapis cezası ve adli para cezası** ile yaptırıma bağlanmıştır. Benzer şekilde BAE, Suudi Arabistan, Singapur gibi ülkelerde kumar reklamı doğrudan uygulamanın yasaklanması ve hukuki yaptırım sebebidir.

* **Durum:** Reklam ağları (AdMob) varsayılan olarak kumarhane, bahis ve yüksek riskli finans reklamlarını hedef kitleye göre sunabilir. Kod içerisinden bu reklam türlerini doğrudan engelleyemezsiniz.
* **Yapılması Gereken Kesin İşlemler:**
  1. **Google AdMob Web Konsolu -> Engelleme Kontrolleri (Blocking Controls) -> Hassas Kategoriler (Sensitive Categories):**
     - ❌ **Kumar ve Bahis (18+) (Gambling & Betting)** -> Kesinlikle BLOKLANMALI.
     - ❌ **Sosyal Kumarhane Oyunları (Social Casino Games)** -> BLOKLANMALI.
     - ❌ **Alkol ve Tütün Ürünleri** -> BLOKLANMALI.
     - ❌ **Yetişkin & Cinsellik İçeren İçerikler** -> BLOKLANMALI.
     - ❌ **Kripto Spekülasyonu, Hızlı Zengin Olma & Şüpheli Kredi/Finans** -> BLOKLANMALI.
     - ❌ **Siyaset ve Din** -> BLOKLANMALI.
  2. **Kod Tarafında:** `AdManager.js` içinde `setRequestConfiguration` ayarında içerik seviyesi `MaxAdContentRating.T` (Gençler/Teen) veya `MaxAdContentRating.PG` olarak sınırlandırılmalıdır.

---

### 1.2. `AdManager.js` İçindeki COPPA / Çocuk Politikası Hatası
> [!WARNING]
> **Google Play Askıya Alma & %90 Gelir Kaybı Riski:**
> `src/ads/AdManager.js` satır 37-38'de:
> ```javascript
> tagForChildDirectedTreatment: true,
> tagForUnderAgeOfConsent: true,
> ```
> Bu parametrelerin `true` yapılması AdMob'a **"Bu uygulama 13 yaş altı çocuklara yöneliktir"** demektir.

* **Zararları:**
  1. **Google Play Hesabının Kapatılma Riski:** Google Play Konsolu'nda uygulamanız "Genel Kitle" veya "13+" seçilmişken, AdMob'a "Çocuk Uygulaması" derseniz, Google Play **"Aldatıcı Beyan ve Aile Politikası İhlali"** gerekçesiyle uygulamanızı mağazadan kaldırır veya geliştirici hesabınızı banlar.
  2. **Gelir Felaketi:** Çocuk olarak işaretlenen uygulamalarda çerez, ilgi alanı takibi ve kişiselleştirilmiş reklam yapılamaz. Reklam gelirleriniz (eCPM) **%80-%90 oranında düşer**.
* **Çözüm:** Hedef kitle 13+ veya 16+ olmalı, bu COPPA çocuk etiketleri koddan kaldırılmalıdır.

---

### 1.3. Apple Kuralı 4.8: "Sign in with Apple" Zorunluluğu (Kesin Ret Nedeni)
> [!IMPORTANT]
> **Apple App Store Review Guideline 4.8:**
> *"Uygulamanız Google veya herhangi bir üçüncü taraf sosyal giriş sunuyorsa, eşdeğer bir seçenek olarak **Sign in with Apple** sunmak ZORUNDADIR."*

* **Durum:** Uygulamanızda Google ile giriş var, fakat Apple ile Giriş (`expo-apple-authentication`) yoktur.
* **Sonuç:** App Store'a yüklendiğinde Apple denetçisi tarafından **ilk incelemede istisnasız reddedilir**.
* **Çözüm:** `expo-apple-authentication` entegre edilmeli ve iOS cihazlarda `AuthScreen.js` ekranında Apple butonu gösterilmelidir.

---

### 1.4. Apple Kuralı 3.1.2 & Google Play: Paywall Yasal Eksikleri
> [!IMPORTANT]
> Apple denetçileri Paywall ekranlarını kelimesi kelimesine inceler.

* **Eksikler (`PaywallScreen.js`):**
  1. Tıklanabilir **Kullanım Koşulları (Terms of Use / EULA)** linki yok.
  2. Tıklanabilir **Gizlilik Politikası (Privacy Policy)** linki yok.
  3. Aboneliğin otomatik yenilendiğini, istenildiği zaman Apple ID / Google Play abonelik ayarlarından iptal edilebileceğini belirten yasal bilgilendirme metni yok.
* **Sonuç:** Guideline 3.1.2 ihlali sebebiyle doğrudan ret.
* **Çözüm:** `PaywallScreen.js` altına hem EULA hem Gizlilik Politikası linkleri ve standart abonelik feragatnamesi eklenmelidir.

---

### 1.5. Gizlilik Sözleşmesi (Privacy Policy) & Şartların Geçersiz Link Olması
* **Durum (`SettingsScreen.js` satır 287-288):**
  - `https://onyxhabittracker.com/privacy`
  - `https://onyxhabittracker.com/terms`
* **Risk:** Bu site aktif bir domain değildir (veya generic boş sayfadır). Apple ve Google mağaza inceleyicileri bu linklere tıklar; sayfa açılmazsa veya sahte/taslak ise uygulama reddedilir.
* **KVKK & GDPR Riski:** Kullanıcıların e-postalarını, profil bilgilerini ve alışkanlık kayıtlarını toplarken geçerli bir Gizlilik Politikası sunmamak AB (GDPR) ve Türkiye (KVKK) nezdinde doğrudan yasal cezai sorumluluk doğurur.
* **Çözüm:** Gerçek ve geçerli bir Gizlilik Politikası metni hazırlanıp ücretsiz olarak barındırılmalı (örn: GitHub Pages, Notion, Vercel veya Firebase Hosting) ve gerçek URL uygulamaya bağlanmalıdır.

---

### 1.6. Google Play Disruptive Ads (Rahatsız Edici Reklam) İhlali
> [!WARNING]
> `src/navigation/AppNavigator.js` satır 39-46'da her **5 sekme değişiminde araya tam ekran geçiş reklamı (interstitial)** açılmaktadır!

* **Risk:**
  1. **Google Play Politikası:** "Unexpected interstitial ads" (Beklenmedik tam ekran reklamlar) Google Play'in Daha İyi Reklam Deneyimleri politikasını doğrudan ihlal eder.
  2. **Kullanıcı Reaksiyonu:** Kullanıcı sekmeler arasında gezinirken aniden patlayan reklamlar %95 oranında uygulamanın aynı gün silinmesine ve mağazada 1 yıldızlı linç yorumlarına sebep olur.
* **Çözüm:** Sekme geçişindeki reklam derhal kaldırılmalı; reklamlar yalnızca doğal duraklama anlarına (örn: Pomodoro odaklanma seansı başarıyla tamamlandığında veya günün tüm hedefleri bitirildiğinde) konulmalıdır.

---

### 1.7. iOS İzin Bildirimleri Eksikliği (`app.json` - Binary Derleme/Yükleme Reddi)
* Projede `expo-image-picker` (profil fotoğrafı seçme) mevcut.
* `app.json` içinde iOS için `NSPhotoLibraryUsageDescription` ve `NSCameraUsageDescription` açıklamaları eksiktir.
* Bu açıklamalar olmadan App Store Connect'e binary (.ipa) gönderildiğinde Apple yüklemeyi otomatik olarak iptal eder ("Missing Purpose String").

---

### 1.8. Google UMP (Avrupa ve Birleşik Krallık GDPR Reklam Rıza Formu)
* 16 Ocak 2024'ten beri Google, Avrupa Ekonomik Alanı (EEA) ve Birleşik Krallık'ta **Google sertifikalı CMP (Consent Management Platform - UMP)** kullanmayan uygulamalarda reklam gösterimini durdurmaktadır.
* Uygulama ilk açıldığında UMP rıza formu gösterilmezse, Avrupa'daki kullanıcılardan sıfır reklam geliri elde edilir.

---

## 🟡 SEVİYE 2: YÜKSEK - GELİR MODELİ VE MONETİZASYON OPTİMİZASYONU

Bir alışkanlık takip uygulamasında **reklam gelirleri (AdMob)** tek başına yüksek gelir sağlamaz (Örn: Türkiye'de 1000 gösterim başı $0.50 - $1.50 kazanılırken, ABD'de bu $8 - $20 arasındadır). 

Küresel pazarda ayda $2.000 - $10.000+ gibi ciddi pasif gelir üreten uygulamaların gelirinin **%85-%90'ı Uygulama İçi Aboneliklerden (In-App Subscriptions)** gelir.

---

### 2.1. RevenueCat Altyapısı Eksiklikleri
* `src/config/Config.js` dosyasında iOS için test anahtarı (`test_akWX...`) ve rastgele bir Entitlement ID (`appd32a585f83`) bulunuyor.
* Canlıya çıkmadan önce:
  1. Google Play Console ve App Store Connect'te 3 paket oluşturulmalıdır:
     - `onyx_pro_monthly` (Örn: $3.99 / ay)
     - `onyx_pro_annual` (Örn: $24.99 / yıl — 3 gün ücretsiz deneme ile)
     - `onyx_pro_lifetime` (Örn: $49.99 tek seferlik)
  2. RevenueCat dashboard'unda Entitlement adı belirlenmeli (Örn: `pro_access`) ve canlı iOS/Android API anahtarları girilmelidir.

---

### 2.2. Paywall Dönüşüm Oranı (Conversion Rate) Eksikleri
* **Eksik:** `PaywallScreen.js` ekranında paketler yüklenemediğinde ($2.99, $19.99) simüle butonlar görünüyor ancak tıklanınca satın alma çalışmıyor.
* **Yanıltıcı Özellik İfadesi:** Paywall'da *"Pro Widgetlar: Ana ekranını özelleştir"* vaat ediliyor; ancak uygulamada yerel iOS/Android ana ekran widget'ı bulunmuyor (sadece uygulama içi bir tema ayarı var). Apple denetçisi "vaat edilen ama var olmayan özellik" gerekçesiyle ret verebilir. Bunun yerine *"Özel Neon Temalar ve Rozetler"* olarak güncellenmelidir.
* **İkna Edici Unsurlar:**
  - Yıllık paketin üzerine *"EN POPÜLER - %50 TASARRUF"* rozeti.
  - 3 Günlük Ücretsiz Deneme (3-Day Free Trial) vurgusu (kullanıcıların satın alma bariyerini yıkar).

---

### 2.3. Alternatif Gelir Modelleri (Öneriler)
1. **Mikro Ödemeler (Consumable IAP - Tüketilebilir Ürün):**
   - **Seri Kurtarma / Dondurma (Streak Freeze):** Kullanıcı bir gün alışkanlığını unuttuğunda 15 günlük serisi sıfırlanır.
   - Bu durum kullanıcıda büyük bir kayıp hissiyatı yaratır. Kullanıcıya serisini kurtarmak için iki opsiyon sunulur:
     - 1 Adet Ödüllü Reklam izlemek (Reklam geliri)
     - Veya 5'li "Seri Kalkanı Paketi" satın almak ($0.99 - $1.99 IAP)
2. **Yapay Zeka Destekli Kişisel Alışkanlık Koçu (AI Habit Coach):**
   - 2025-2026 trendi! Gemini API entegrasyonu ile kullanıcının haftalık/aylık performansını analiz edip kişiselleştirilmiş motivasyon ve başarı raporu hazırlama (Sadece Pro üyelere özel özellik olarak konumlandırıldığında abonelik satışını katlar).
3. **Detaylı Rapor Dışa Aktarma (Export to PDF/CSV):**
   - Kullanıcının alışkanlık ve odaklanma verilerini doktoruna, koçuna veya kendine sunmak için şık bir PDF karnesi olarak dışa aktarması (Pro özellik).
4. **Özel Uygulama İkonları (App Icons):**
   - Pro kullanıcılar telefon ana ekranındaki Onyx logosunu altın, neon mor, siyah minimalist gibi alternatif ikonlarla değiştirebilsin. (Gen-Z kullanıcıların en çok talep ettiği kozmetik özellik).

---

## 🔵 SEVİYE 3: ORTA - GÜVENLİK, VERİ BÜTÜNLÜĞÜ VE ALTYAPI

### 3.1. Firebase Firestore Güvenlik Kuralları (Security Rules)
* Firebase projeleri ilk açıldığında Firestore kuralları varsayılan 30 günlük test modunda gelir ve süre dolunca tüm bulut kaydı kilitlenir.
* Kodda yetki hatalarını yakalayan try-catch blokları mevcut. Veritabanının herkese açık kalmaması ve süresi dolunca uygulamanın kilitlenmemesi için **sadece oturum açan kullanıcının kendi UID'sine ait veriyi okuyup yazabileceği** sıkı güvenlik kuralları Firebase Console'a girilmelidir:
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

### 3.2. Firebase Hesap Silme (`deleteAccount`) Yetki Hatası (Requires Recent Login)
* Firebase Auth güvenliği gereği, uzun süre önce oturum açmış bir kullanıcı `deleteUser()` çağırdığında Firebase `auth/requires-recent-login` hatası fırlatır.
* Bu durumda kullanıcı hesabını silemez. Apple denetçisi test cihazında hesap silmeyi dener ve başarısız olursa uygulamayı doğrudan reddeder.
* Çözüm: Bu hata yakalandığında kullanıcıya şifresini veya Google girişini tekrar doğrulatıp ardından silme işlemini tamamlayan re-authentication akışı kurulmalıdır.

### 3.3. Çökme Takibi ve Analitik (Crashlytics & Telemetry)
* Uygulama küresel çapta yüzlerce farklı marka/model telefonda çalışacak. Sentry veya Firebase Crashlytics kurulu olmazsa oluşan çökmelerden haberiniz olamaz ve mağaza puanınız 3.0'lara düşebilir.

---

## 🟢 SEVİYE 4: KULLANICI DENEYİMİ (UX/UI), DİL VE MAĞAZA OPTİMİZASYONU (ASO)

### 4.1. Çok Dilli Destek (i18n) Eksiklikleri
* `translations.js` 7 dili destekliyor ancak bazı modal bildirimlerinde Türkçe metinler hardcoded kalmış:
  - `PaywallScreen.js` satır 77, 80, 83: `'Seri Başarıyla Onarıldı!'`, `'Ödül Kazanıldı! Ekstra odaklanma...'` gibi bildirimler doğrudan Türkçe yazılmış.
  - Amerika veya Almanya'daki bir kullanıcı ödüllü reklamı bitirdiğinde karşısına Türkçe popup çıkıyor.
* Bunlar `t(...)` çeviri sistemine bağlanmalıdır.

### 4.2. 6 Sekmeli Alt Menü (Bottom Tab Bar) Sıkışıklığı
* Alt menüde 6 sekme var: Home, Habits, Stats, Focus, BreakStreak, Settings.
* Mobil UX standartlarına göre alt barda **en fazla 3 ila 5 sekme** olmalıdır. 6 sekme küçük ekranlı telefonlarda dokunma hedeflerini çok daraltır.
* "Settings" sekmesi alt bardan çıkarılıp Home ekranının sağ üst köşesine şık bir profil/ayar ikonu olarak taşınabilir; böylece alt bar 5 sekmeyle ferah hale gelir.

### 4.3. Google Play 20 Test Kullanıcısı (Closed Testing) Kuralı
* Google, 13 Kasım 2023 tarihinden sonra açılan tüm **bireysel geliştirici hesapları** için kapalı test (Closed Testing) zorunluluğu getirdi:
  - En az **20 farklı test kullanıcısının**,
  - **14 gün kesintisiz** boyunca kapalı test kanalına kayıtlı kalması gerekmektedir.
* Uygulama hazır olduğunda 20 kişilik bir test grubu organize edilmelidir.

---

## 📋 ÖNCELİKLENDİRİLMİŞ UYGULAMA YOL HARİTASI (ROADMAP)

| Faz | Konu | Neden Gerekli? | Öncelik |
|---|---|---|---|
| **Faz 1** | AdMob Kumar & Bahis Reklamlarını Engelleme | Yasal ve cezai koruma (7258 sayılı kanun) | 🔴 ACİL / YASAL |
| **Faz 1** | `AdManager.js` COPPA (Çocuk) Etiketlerini Düzeltme | Google Play hesap askıya alma riski ve %90 gelir kaybını önleme | 🔴 ACİL / YASAL |
| **Faz 1** | iOS için "Sign in with Apple" Entegrasyonu | Apple Guideline 4.8 mağaza onay şartı | 🔴 ACİL / RET ENGELİ |
| **Faz 1** | Paywall Ekranına EULA, Şartlar ve Gizlilik Linkleri | Apple Guideline 3.1.2 mağaza onay şartı | 🔴 ACİL / RET ENGELİ |
| **Faz 1** | Gerçek Privacy Policy & Terms Sayfasının Açılması | KVKK, GDPR ve Mağaza kabul şartı | 🔴 ACİL / YASAL |
| **Faz 1** | Sekme Geçişindeki Agresif Interstitial Reklamı Kaldırma | Google Play Disruptive Ads politikası ve 1 yıldızlı yorumları önleme | 🔴 ACİL / MAĞAZA |
| **Faz 1** | iOS `app.json` Fotoğraf İzin Açıklamaları | App Store binary yükleme reddini önleme | 🔴 ACİL / DERLEME |
| **Faz 2** | RevenueCat Canlı Ürünleri ve Canlı API Anahtarları | Gerçek abonelik geliri elde edebilme | 🟡 YÜKSEK / GELİR |
| **Faz 2** | Google UMP (Avrupa GDPR Reklam Rızası) | Avrupa trafiğinden reklam geliri elde edebilme | 🟡 YÜKSEK / GELİR |
| **Faz 2** | Paywall UI/UX Optimizasyonu (Free trial, indirim rozeti) | Abonelik dönüşüm oranını 2-3 katına çıkarma | 🟡 YÜKSEK / GELİR |
| **Faz 3** | Firestore Güvenlik Kurallarının Canlıya Alınması | Veritabanı güvenliği ve 30 gün sonra kilitlenmeyi önleme | 🔵 ORTA / GÜVENLİK |
| **Faz 3** | Hesap Silme Re-Authentication Koruması | Apple Guideline 5.1.1(v) testinin başarıyla geçmesi | 🔵 ORTA / MAĞAZA |
| **Faz 3** | Sentry / Crashlytics Hata Takip Kurulumu | Küresel çökmeleri anında tespit edip puan kaybını önleme | 🔵 ORTA / KALİTE |
| **Faz 4** | Hardcoded Türkçe Metinlerin Çeviriye Bağlanması | Global kullanıcı deneyimi | 🟢 DÜŞÜK / UX |
| **Faz 4** | Alt Tab Barın 5 Sekmeye Sadeleştirilmesi | Ergonomik ve modern arayüz | 🟢 DÜŞÜK / UX |
| **Faz 4** | Alternatif Gelir: Seri Dondurma (Streak Freeze) & AI Koç | Ekstra aktif/pasif mikro gelir akışı | 🟢 GELECEK VİZYON |

---

> 💡 **Tavsiye:** Kodlarınıza ve dosyalarınıza kuralınız gereği hiçbir müdahale yapılmamıştır. Rapor hem proje kök dizinine ([PROJECT_AUDIT_AND_ROADMAP.md](file:///d:/Github/onyx-habit-tracker/PROJECT_AUDIT_AND_ROADMAP.md)) kaydedilmiş hem de bu inceleme raporu olarak sunulmuştur. Hazır olduğunuzda hangi fazdan başlamak istediğinizi belirtmeniz yeterlidir.
