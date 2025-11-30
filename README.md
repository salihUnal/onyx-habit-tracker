# Onyx: Habit Tracker & Focus

Onyx is a premium, gamified habit tracker and focus timer app designed with a "Dark Mode / Neon" aesthetic. It focuses on building streaks, social sharing, and deep work sessions.

## 📱 Features

### ✅ Completed
- **Authentication & Onboarding:**
  - Modern, animated landing screen.
  - Mock login options (Google, Email, Phone).
  - "Cool" UI with gradients and blur effects.
- **Dashboard (Home):**
  - Daily progress tracking with visual bars.
  - Habit management (Add, Edit, Delete, Complete).
  - **Monetization:** Free users limited to 5 habits (expandable via Ads).
  - Confetti and animations for task completion.
- **Focus Mode:**
  - Pomodoro timer (customizable).
  - Distraction-free experience for Pro users.
  - Banner ads for free users.
- **Social "Flex" Mode:**
  - Share habits to Instagram Stories (9:16 format).
  - Dynamic backgrounds based on habit color.
  - **Watermark:** Free users have a watermark, removable via Paywall.
- **Settings & Customization:**
  - Language support (English, Turkish, Spanish, German, Italian, Russian, Chinese).
  - Dark/Light mode toggle.
  - Profile management.
- **Paywall & Monetization:**
  - Premium subscription screen.
  - **Rewarded Ads:** Watch ads to earn extra habit slots.
  - Mock Ad system with random duration timers.

### 🚧 Roadmap / To-Do
The following features from the original requirements are pending or can be improved:

1.  **Streak Repair (Rewarded Ad):**
    - **Requirement:** Allow users to "repair" a broken streak by watching an ad.
    - **Current Status:** Not implemented. Logic needs to be added to `HabitContext` to handle streak restoration and UI in `HomeScreen` to show the option when a streak is lost.

2.  **Widget Customization Store:**
    - **Requirement:** A dedicated screen to customize Home Screen Widgets (Free vs Pro).
    - **Current Status:** `WidgetStoreScreen.js` exists but needs verification of full functionality (Free vs Neon Cyberpunk styles).

3.  **Real Backend & Monetization Integration:**
    - **Requirement:** RevenueCat (IAP) and AdMob.
    - **Current Status:** Currently using Mock implementations for demonstration purposes. Needs replacement with real SDKs for production.

4.  **Push Notifications:**
    - **Requirement:** Daily reminders.
    - **Current Status:** Basic scheduling is implemented, but more granular control (per habit reminders) could be enhanced.

## 🛠 Setup & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the App:**
    ```bash
    npx expo start
    ```

3.  **Run on Device/Simulator:**
    - Scan the QR code with Expo Go (Android/iOS).
    - Press `a` for Android Emulator or `i` for iOS Simulator.

## 🌍 Localization
The app supports 7 languages. Translations are managed in `src/i18n/translations.js`.

## 🎨 Design System
- **Colors:** Defined in `src/context/ThemeContext.js`.
- **Icons:** Using `lucide-react-native`.
- **Fonts:** System fonts with bold/modern styling.
