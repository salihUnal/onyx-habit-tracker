# Onyx: Habit Tracker & Focus - Project Prompt

**Act as a Lead React Native Developer & Product Designer.**

I need you to build a production-ready, high-revenue mobile application called **"Onyx: Habit Tracker & Focus"**.
The app targets Gen Z students with a "Dark Mode / Neon" aesthetic and focuses on building streaks.

**Tech Stack:**
- Framework: React Native (Expo SDK latest).
- Navigation: React Navigation (Stack & Bottom Tabs).
- State Management: React Context API (User, Habits, Theme).
- Storage: AsyncStorage (Offline-first data persistence).
- Monetization: Structure for RevenueCat (IAP) and AdMob.
- Icons: Lucide-React-Native.

**Global Design System:**
- **Theme:** Support Light and Dark modes (Default to Dark).
- **Typography:** Clean, bold, modern sans-serif.
- **Localization:** The app must support 7 languages: English (default), Turkish, Spanish, German, Italian, Russian, Chinese.

**Feature Requirements (Implement All):**

1.  **Authentication & Onboarding (Entry Point):**
    - A visually striking Landing Screen with the "Onyx" branding.
    - **Mock Login Options:** "Continue with Google", "Continue with Email", "Continue with Phone".
    - After "logging in" (mock action), navigate to the Main App.

2.  **Dashboard (Home Screen):**
    - **Header:** Greeting, Date, and "Pro" badge (if free user).
    - **Progress:** A visual daily progress bar (Linear gradient).
    - **Habit List:** Cards with "Zap" icon, habit name, streak count, and a checkbox.
    - **Monetization Trigger:** Free users are strictly limited to **3 habits**. Attempting to add a 4th opens the Paywall.

3.  **Social "Flex" Mode (Instagram Story):**
    - Add a "Share" button to every habit card.
    - **The Canvas:** A 9:16 vertical modal designed for Instagram Stories.
    - **Content:** Dynamic background color based on the habit, huge streak number, "Onyx" branding.
    - **Monetization Trigger:** Free users see a "Watermark" (App Logo/Download Link) on the image. Include a button "Remove Watermark" that triggers the Paywall.

4.  **Widget Customization Store:**
    - A dedicated screen in Settings to customize Home Screen Widgets.
    - **Free Widget:** Simple list style (Basic).
    - **Pro Widget:** "Neon Cyberpunk" style with glow effects. Selecting this opens the Paywall.

5.  **Focus Mode (Pomodoro):**
    - A full-screen focus timer (Default 25 min).
    - **Monetization Trigger:** Free users see a banner ad at the bottom of the timer. Pro users get a distraction-free experience.

6.  **Settings & Menu:**
    - **Language Selector:** A modern popup to switch between the 7 supported languages.
    - **Theme Selector:** Toggle between Light/Dark mode.
    - **Account:** Logout button (returns to Auth screen).

7.  **Monetization Logic (Crucial):**
    - **Paywall Screen:** A high-converting modal listing benefits: "Unlimited Habits", "Dark Mode", "Pro Widgets", "No Ads".
    - **Ad Components (Mock):**
        - BannerAd: Bottom of Dashboard & Focus Timer (Free users only).
        - RewardedAd: Button to "Repair Broken Streak" by watching an ad.

**Deliverable:**
Provide the complete, functional source code. You can use a single-file structure for the prototype or suggest a folder structure, but ensure all features above are implemented in the code logic.
