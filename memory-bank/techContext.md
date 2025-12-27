# Tech Context: Onyx

## Technologies Used

- **Frontend Framework:** React Native with Expo SDK 51.
- **Navigation:** React Navigation (Stack & Bottom Tabs).
- **Icons:** Lucide-react-native.
- **State Management:** React Context API.
- **Data Persistence:** AsyncStorage (offline-first).
- **Monetization:**
  - RevenueCat (`react-native-purchases`) for In-App Purchases.
  - Google AdMob (`react-native-google-mobile-ads`) for Rewarded and Banner Ads.
- **Backend/Auth:** Firebase (for Google Login and future cloud sync).
- **Visuals:** Expo Linear Gradient, Expo Blur, React Native View Shot (for social sharing).

## Development Setup

- **Package Manager:** npm
- **Environment:** Expo managed workflow.
- **Target Platforms:** Android (Primary), iOS (Planned).

## Technical Constraints & Decisions

- **Offline First:** Data is stored locally via AsyncStorage to ensure responsiveness without an internet connection.
- **Localization:** Support for 7 languages built using `expo-localization`.
- **Security:** Account deletion and privacy policies are required for Play Store compliance.
- **Auth:** Currently encountering Error 400 with Google Login on Android APKs.

## Dependencies (Key)

- `expo`: ~51.0.0
- `react-native`: 0.74.5
- `firebase`: ^10.8.0
- `react-native-purchases`: 8.2.0
- `react-native-google-mobile-ads`: 14.2.2
