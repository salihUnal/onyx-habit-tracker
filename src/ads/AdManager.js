import { Platform } from 'react-native';
import Config from '../config/Config';

let MobileAds, MaxAdContentRating, TestIds, RewardedAd, RewardedAdEventType, InterstitialAd, AdEventType, AppOpenAd;
try {
    const AdMob = require('react-native-google-mobile-ads');
    MobileAds = AdMob.default || AdMob;
    MaxAdContentRating = AdMob.MaxAdContentRating;
    TestIds = AdMob.TestIds;
    RewardedAd = AdMob.RewardedAd;
    RewardedAdEventType = AdMob.RewardedAdEventType;
    InterstitialAd = AdMob.InterstitialAd;
    AdEventType = AdMob.AdEventType;
    AppOpenAd = AdMob.AppOpenAd;
} catch (e) {
    console.log('AdMob binary modules not found');
}

class AdManager {
    static instance = null;
    isInitialized = false;

    static getInstance() {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

    async init() {
        if (this.isInitialized || !MobileAds) return;

        try {
            await MobileAds().initialize();
            await MobileAds().setRequestConfiguration({
                maxAdContentRating: MaxAdContentRating.G,
                tagForChildDirectedTreatment: true,
                tagForUnderAgeOfConsent: true,
            });
            this.isInitialized = true;
            console.log('AdMob Initialized');

            // Pre-load App Open Ad
            this.loadAppOpenAd();
        } catch (error) {
            console.error('AdMob Initialization Error:', error);
        }
    }

    // Rewarded Ad
    loadRewardedAd(onEarnedReward, onClosed) {
        if (!RewardedAd) return;
        const adUnitId = __DEV__ ? TestIds.REWARDED : Config.ADMOB_REWARDED_ID;

        const rewarded = RewardedAd.createForAdUnitId(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });

        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            onEarnedReward(reward);
        });

        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            rewarded.show();
        });

        rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
            if (onClosed) onClosed();
        });

        rewarded.load();
    }

    // Interstitial Ad (Geçiş Reklamı)
    loadInterstitialAd(onClosed) {
        if (!InterstitialAd) return;
        const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Config.ADMOB_INTERSTITIAL_ID;

        const interstitial = InterstitialAd.createForAdUnitId(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });

        interstitial.addAdEventListener(AdEventType.LOADED, () => {
            interstitial.show();
        });

        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            if (onClosed) onClosed();
        });

        interstitial.load();
    }

    // App Open Ad (Uygulama Açılırken)
    loadAppOpenAd() {
        if (!AppOpenAd) return;
        const adUnitId = __DEV__ ? TestIds.APP_OPEN : Config.ADMOB_APP_OPEN_ID;

        const appOpenAd = AppOpenAd.createForAdUnitId(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });

        appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
            appOpenAd.show();
        });

        appOpenAd.load();
    }
}

export default AdManager.getInstance();
