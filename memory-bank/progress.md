# Progress: Onyx

## What Works

- **Core UI Structure:** Most screens from the prompt are implemented (Dashboard, Focus, Settings, etc.).
- **Base Habit Tracking:** Users can add and view habits (stored in AsyncStorage).
- **Localization Infrastructure:** Support for 7 languages is in place.
- **Theme Switching:** Dark and Light modes supported.
- **Partial Monetization:** Integration with `react-native-purchases` and `react-native-google-mobile-ads` is started.

## Current Status

The project is in the "Transition from Demo to Production" phase. While the visual and basic functionality exists, several critical systems need to be made production-ready.

## Known Issues

- **Google Login Bug:** Error 400: invalid_request in Android APK builds.
- **Mock Features:** Some features like "Pro" upgrade and "Ads" are still using mock logic instead of production endpoints.

## What's Left to Build

### High Priority

- [x] Fix Google Login logging (added detailed error logs).
- [x] Implement Email Login and Signup.
- [x] Implement robust Phone Authentication.
- [ ] Fully integrate RevenueCat for real In-App Purchases (Restore Purchase feature needed).
- [ ] Implement real AdMob ads (Rewarded/Banner).
- [ ] Add Cloud Sync via Firebase for data persistence across devices.

### Medium Priority

- [ ] Add Account Deletion feature (Play Store requirement).
- [ ] Add Privacy Policy and Terms of Service links.
- [ ] Improve Onboarding flow with a dedicated multi-page slider.

### Low Priority

- [ ] Implement real Home Screen Widgets (using Expo Config Plugins).
- [ ] Add Analytics (Firebase/Mixpanel).
