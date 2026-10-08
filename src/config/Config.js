// configuration for API keys and Ad mobility IDs
const Config = {
    // RevenueCat Configuration
    REVENUECAT_API_KEY_ANDROID: 'goog_ChTODdIPJptCkDcijJNjgikKfZd',
    REVENUECAT_API_KEY_IOS: 'test_akWXroIJFQOanamcckwTtuGpqyg',     // Keeping test key for iOS for now
    PRO_ENTITLEMENT_ID: 'appd32a585f83',                      // Replace with your entitlement ID

    // AdMob Configuration
    ADMOB_APP_ID_ANDROID: 'ca-app-pub-9005956424727190~4380402516',
    ADMOB_REWARDED_ID: 'ca-app-pub-9005956424727190/2074459914',     // Normal Ödüllü Reklam
    ADMOB_REWARDED_INTERSTITIAL_ID: 'ca-app-pub-9005956424727190/9058014129', // Ödüllü Geçiş Reklamı
    ADMOB_BANNER_ID: 'ca-app-pub-9005956424727190/6614849461',       // Banner Reklam
    ADMOB_INTERSTITIAL_ID: 'ca-app-pub-9005956424727190/3997259137', // Geçiş Reklamı
    ADMOB_APP_OPEN_ID: 'ca-app-pub-3940256099942544/9257395915',     // Test ID for now

    // Firebase Configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyCg7plgXni-Cxrnu6Ako07ezQu8ATdJr10",
        authDomain: "onyx-habit-tracker.firebaseapp.com",
        projectId: "onyx-habit-tracker",
        storageBucket: "onyx-habit-tracker.firebasestorage.app",
        messagingSenderId: "405005586790",
        appId: "1:405005586790:android:56a9562c3144dd16acf8a7",
        measurementId: "G-97ZXTXE77Y"
    },
    GOOGLE_CLIENT_ID_IOS: '405005586790-nl62ie6gp693d82t4s32qsktfq7ppcn4.apps.googleusercontent.com',
    GOOGLE_CLIENT_ID_ANDROID: '405005586790-nl62ie6gp693d82t4s32qsktfq7ppcn4.apps.googleusercontent.com',
    GOOGLE_WEB_CLIENT_ID: '405005586790-d9ccn5oeriqbvee15beth3rms8lq34ns.apps.googleusercontent.com',

    // Legal & Policy URLs
    PRIVACY_POLICY_URL: 'https://github.com/salihUnal/onyx-habit-tracker/blob/main/PRIVACY_POLICY.md',
    TERMS_OF_SERVICE_URL: 'https://github.com/salihUnal/onyx-habit-tracker/blob/main/TERMS_OF_SERVICE.md',
    APPLE_EULA_URL: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
};

export default Config;
