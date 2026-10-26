# Kararlar ve build ortamı

## 2026-10-26 · Expo SDK 51 → 54
- **Neden:** Google Play 31 Ağustos 2026'dan beri yeni uygulamalarda `targetSdk 36` ve 16 KB sayfa boyutu desteği istiyor. SDK 51 (RN 0.74) ikisini de karşılamıyordu.
- **Neden 54, 55 değil:** API 36'yı hedefleyen en küçük adım. Yeni mimari (New Architecture) açıldı; SDK 55 zaten yalnızca yeni mimariyi destekliyor.
- `react-native-google-mobile-ads` **16.3.4'e sabit**: 16.4+ AdMob SDK 25.4 getiriyor, o da Kotlin 2.3 ile derlenmiş; SDK 54'ün Kotlin 2.1 derleyicisi okuyamıyor. Expo Kotlin'i yükseltince bu sabitleme kaldırılabilir.
- `metro.config.js` içinde `unstable_enablePackageExports = false`: Firebase JS SDK bu olmadan açılışta "Component auth has not been registered yet" ile çöküyor.
- Doğrulama: release AAB `targetSdk 36`, 38 native kütüphanenin hepsi 16 KB hizalı, 16 KB sayfa boyutlu Android 17 emülatöründe açılıyor.

## İmzalama (release signing)
- `android/` git'te değil ve `expo prebuild` ile yeniden üretiliyor. İmza ayarı bu yüzden `plugins/withReleaseSigning.js` ile ekleniyor.
- Upload keystore repo dışında: `D:\onyx-signing\onyx-upload-2026.jks` (alias `onyx-upload`). Şifre ve yol `D:\gradle_cache\.gradle\gradle.properties` içinde (`MYAPP_UPLOAD_*`).
- Eski keystore'un şifresi public repoya sızdığı için kullanılmıyor. Yedeği: `D:\onyx-signing\old-compromised-2026-10-26\`.
- **Keystore dosyasını ve şifresini bu PC dışında da yedekle** (şifre yöneticisi + harici disk). Kaybedilirse Play Console'dan upload key sıfırlama talebi gerekir.

## Windows build ortamı
Kullanıcı klasöründeki "Ü" harfi CMake/ninja'yı bozuyor. Java 8.3 kısa adları (`SALIHN~1`) uzun ada çözdüğü için kısa ad da yetmiyor. Çözüm:
- `D:\AndroidSdk` → Android SDK'ya junction.
- `D:\cmake-3.22.1` → SDK'daki CMake'in kopyası (junction yetmiyor, AGP gerçek yolu çözüyor).
- `android/local.properties` (git'te değil, `prebuild --clean` siler; yeniden yaz):
  ```
  sdk.dir=D:/AndroidSdk
  cmake.dir=D:/cmake-3.22.1
  ```
- Build: `npm run build:aab` → `android/app/build/outputs/bundle/release/app-release.aab`.
- 16 KB test emülatörü: `ANDROID_AVD_HOME=D:/android-avd`, AVD adı `onyx16k`.
