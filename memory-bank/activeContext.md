# Active Context: Onyx

## Current Work Focus

The primary focus is initializing the project documentation (Memory Bank) and preparing for production-level fixes and features.

## Recent Changes

- Implemented Email Login and Signup functionality.
- Implemented Phone Authentication structure (Send Code/Verify Code) in `UserContext.js` and `AuthScreen.js`.
- Multi-Agent Otonom QA ve Geliştirme Döngüsü kuruldu (`standard-tester`, `pro-tester`, `developer-agent`).
- Arka planda her 2 günde bir otomatik çalışan daemon cron zamanlayıcısı (`0 0 */2 * *`) devreye alındı.
- Test raporları ve dev günlüğü kalıcı olarak `for AI/` klasörüne taşındı (`for AI/STANDARD_TEST_REPORT.md`, `for AI/PRO_QA_MASTER_REPORT.md`, `for AI/DEV_CHANGELOG.md`).
- 7 dildeki (DE, ES, IT, RU, ZH) 813 eksik çeviri anahtarı tamamlandı (`src/i18n/translations.js`).
- `FocusScreen.js` için `KeyboardAvoidingView` ve `useSafeAreaInsets` ile dar ekran ve klavye koruması eklendi.
- Created `npm run android-win` as a permanent fix for local development build issues, and updated it to use Android Studio's JDK (JBR) to resolve Java 25 SSL certificate validation errors.
- Fixed AdMob initialization crash by migrating `AdManager.js` to ES6 imports for `react-native-google-mobile-ads`.
- Improved Google Login error logging and robustness.

## Next Steps

1. **Fix Google Login (Android APK):** Update Android Client ID in `Config.js` and verify SHA-1 in Firebase.
2. **Production SHA-1:** Add SHA-1 certificates (Debug and Play Store) to Firebase/Google Console.
3. **Phone Auth Verification:** Install `expo-firebase-recaptcha` to make Phone Auth functional.
4. **Legal Compliance:** Add Privacy Policy and Account Deletion features.

## Active Decisions and Considerations

- **Firebase Auth:** Deciding whether to keep only Google or add more providers. (User explicitly asked for more).
- **Data Persistence:** Migration from local-only AsyncStorage to Firebase Firestore for Cloud Sync.
- **Compliance:** Ensuring "Delete Account" and legal links are present before Play Store submission.
