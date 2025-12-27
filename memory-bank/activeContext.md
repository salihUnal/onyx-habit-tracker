# Active Context: Onyx

## Current Work Focus

The primary focus is initializing the project documentation (Memory Bank) and preparing for production-level fixes and features.

## Recent Changes

- Implemented Email Login and Signup functionality.
- Implemented Phone Authentication structure (Send Code/Verify Code) in `UserContext.js` and `AuthScreen.js`.
- Improved Google Login error logging and robustness.
- Identified potential mismatch in `Config.js` Google Client IDs.

## Next Steps

1. **Fix Google Client IDs:** Verify and update Android/iOS/Web Client IDs in `Config.js`.
2. **Production SHA-1:** ensure the production SHA-1 is added to Firebase/Google Cloud Console.
3. **Phone Auth Verification:** Install `expo-firebase-recaptcha` to make Phone Auth fully functional in production.
4. **Legal Compliance:** Add Privacy Policy and Account Deletion features.

## Active Decisions and Considerations

- **Firebase Auth:** Deciding whether to keep only Google or add more providers. (User explicitly asked for more).
- **Data Persistence:** Migration from local-only AsyncStorage to Firebase Firestore for Cloud Sync.
- **Compliance:** Ensuring "Delete Account" and legal links are present before Play Store submission.
