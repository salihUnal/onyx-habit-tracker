import { Platform } from 'react-native';
import Config from '../config/Config';

import mobileAds, {
    MaxAdContentRating,
    TestIds,
    RewardedAd,
    RewardedAdEventType,
    InterstitialAd,
    AdEventType,
    AppOpenAd,
    AdsConsent
} from 'react-native-google-mobile-ads';

const MobileAds = mobileAds;


class AdManager {
    static instance = null;
    isInitialized = false;
    interstitialAd = null;
    rewardedAd = null;

    static getInstance() {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

    async init() {
        if (this.isInitialized || !MobileAds) return;
        try {
            // 1. Google UMP (GDPR / Consent Management Platform for EEA & UK)
            if (AdsConsent) {
                try {
                    await AdsConsent.requestInfoUpdate();
                    await AdsConsent.loadAndShowConsentFormIfRequired();
                } catch (consentErr) {
                    console.log('UMP Consent notice:', consentErr?.message || consentErr);
                }
            }

            // 2. Initialize AdMob SDK
            await MobileAds().initialize();

            // 3. Request Configuration (General Audience / Teen rating, NOT child-directed COPPA)
            if (MaxAdContentRating) {
                await MobileAds().setRequestConfiguration({
                    maxAdContentRating: MaxAdContentRating.T,
                    tagForChildDirectedTreatment: false,
                    tagForUnderAgeOfConsent: false,
                });
            }
            this.isInitialized = true;
            this.preloadInterstitial();
            this.preloadRewarded();
        } catch (e) {
            console.error('AdMob Init Error:', e);
        }
    }

    preloadInterstitial() {
        if (!InterstitialAd) return;
        const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Config.ADMOB_INTERSTITIAL_ID;
        this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            console.log('Interstitial Loaded');
        });
        this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            this.preloadInterstitial(); // Bir sonraki geçiş için tekrar yükle
        });
        this.interstitialAd.load();
    }

    showInterstitial(onClosed) {
        if (this.interstitialAd && this.interstitialAd.loaded) {
            if (onClosed) {
                const sub = this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
                    sub.remove();
                    onClosed();
                });
            }
            this.interstitialAd.show();
        } else {
            console.log('Interstitial not ready');
            if (onClosed) onClosed();
            this.preloadInterstitial();
        }
    }

    preloadRewarded() {
        if (!RewardedAd) return;
        const adUnitId = __DEV__ ? TestIds.REWARDED : Config.ADMOB_REWARDED_ID;
        this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
        this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            console.log('Rewarded Loaded');
        });
        this.rewardedAd.load();
    }

    showRewarded(onEarnedReward, onClosed) {
        if (this.rewardedAd && this.rewardedAd.loaded) {
            const earnedSub = this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
                onEarnedReward(reward);
            });
            const closeSub = this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
                earnedSub.remove();
                closeSub.remove();
                this.preloadRewarded(); // Yeniden yükle
                if (onClosed) onClosed();
            });
            this.rewardedAd.show();
        } else {
            console.log('Rewarded ad not ready');
            if (onClosed) onClosed();
            this.preloadRewarded();
        }
    }
}

export default AdManager.getInstance();
