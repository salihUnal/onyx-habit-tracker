import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/Config';
import { auth, db } from '../config/firebase';
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  deleteUser as firebaseDeleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';
import {
  DUMMY_USERS,
  DUMMY_HABITS_FREE,
  DUMMY_BREAK_HABITS_FREE,
  DUMMY_HABITS_PRO,
  DUMMY_BREAK_HABITS_PRO,
  DUMMY_FOCUS_DATA_PRO
} from '../constants/dummyData';

WebBrowser.maybeCompleteAuthSession();

let Purchases;
try {
  // Check if native module exists
  if (NativeModules.RNPurchases) {
    Purchases = require('react-native-purchases').default;
  } else {
    console.log('RevenueCat native module (RNPurchases) not found');
  }
} catch (e) {
  console.log('Purchases library not available');
}

let GoogleSignin, statusCodes;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
    console.log('✅ Native GoogleSignin configured successfully');
  }
} catch (e) {
  console.log('Native GoogleSignin module not available in this environment');
}

// Çıkış / hesap silme sırasında temizlenen kullanıcıya özel yerel veriler.
// Eksik anahtar kalırsa aynı cihazda giriş yapan sonraki hesaba veri sızar.
const USER_DATA_KEYS = [
  'user',
  'userProfile',
  'isPro',
  'habits',
  'breakHabits',
  'extraHabits',
  'focusHistory',
  'focusSessionsToday',
  'lastFocusDate',
  'adRewardExpiry',
  'streakFreezes',
];

// Firebase hassas işlemler (hesap silme) için ~5 dk içinde giriş yapılmış olmasını ister.
const RECENT_LOGIN_WINDOW_MS = 5 * 60 * 1000;

// Yalnızca RevenueCat'teki `pro` entitlement'ı Pro açar
const hasProEntitlement = (customerInfo) =>
  Boolean(customerInfo?.entitlements?.active?.[Config.PRO_ENTITLEMENT_ID]);

const defaultUserContext = {
  user: null,
  isPro: false,
  loading: true,
  login: () => { },
  loginWithDummyUser: () => { },
  googleLogin: () => { },
  emailLogin: () => { },
  emailSignup: () => { },
  logout: () => { },
  upgradeToPro: () => { },
  restorePurchases: () => { },
  resetToFree: () => { },
  updateUser: () => { },
  deleteAccount: () => { },
};

const UserContext = createContext(defaultUserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const isExpoGo = Constants.appOwnership === 'expo';
  const redirectUri = isExpoGo
    ? 'https://auth.expo.io/@melezprens1989/onyx-habit-tracker'
    : makeRedirectUri({ scheme: 'onyx-habit-tracker' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Config.GOOGLE_WEB_CLIENT_ID,
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    androidClientId: isExpoGo ? undefined : Config.GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: isExpoGo ? undefined : Config.GOOGLE_CLIENT_ID_IOS,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (request && __DEV__) {
      console.log('🛠 Auth Environment isExpoGo:', isExpoGo);
      console.log('🔗 Forcing Redirect URI:', redirectUri);
    }
  }, [request]);

  // Pro durumunu hem state'e hem çevrimdışı açılış için yerel önbelleğe yazar
  const applyProStatus = async (customerInfo) => {
    const pro = hasProEntitlement(customerInfo);
    setIsPro(pro);
    try {
      await AsyncStorage.setItem('isPro', JSON.stringify(pro));
    } catch (e) {
      console.error('Failed to cache pro status', e);
    }
    return pro;
  };

  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
          };
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc && userDoc.exists()) {
              userData = { ...userData, ...userDoc.data() };
            }
          } catch (docErr) {
            console.warn('⚠️ User profile Firestore read error (check rules):', docErr?.message);
          }
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          if (Purchases) {
            try {
              // Başka cihazda satın alınmış abonelik uid'ye bağlıdır; logIn sonucundaki bilgiyle Pro'yu güncelle
              const { customerInfo } = await Purchases.logIn(firebaseUser.uid);
              await applyProStatus(customerInfo);
            } catch (pErr) {
              console.log('RevenueCat logIn error:', pErr?.message || pErr);
            }
          }
        } else {
          // Check if there is an active local dummy user before clearing session
          const localUserStr = await AsyncStorage.getItem('user');
          if (localUserStr) {
            try {
              const parsed = JSON.parse(localUserStr);
              if (parsed?.isDummy) {
                setUser(parsed);
                setLoading(false);
                return;
              }
            } catch (pErr) {
              // Ignore parse error and proceed with clearing
            }
          }

          // User logged out / not logged in
          setUser(null);
          setIsPro(false);
          await AsyncStorage.removeItem('user');
          if (Purchases) {
            try {
              const isAnonymous = await Purchases.isAnonymous();
              if (!isAnonymous) {
                await Purchases.logOut();
              }
            } catch (pErr) {
              // Ignore logout errors when already anonymous or not configured
              console.log('RevenueCat logOut ignored:', pErr?.message || pErr);
            }
          }
        }
      } catch (err) {
        console.error('onAuthStateChanged error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    checkUser();
    if (!Purchases) return undefined;
    initPurchases();
    // Abonelik yenilendiğinde, iptal edildiğinde veya süresi dolduğunda Pro durumunu güncel tut
    const listener = (customerInfo) => { applyProStatus(customerInfo); };
    try {
      Purchases.addCustomerInfoUpdateListener(listener);
    } catch (e) {
      console.log('RevenueCat listener not registered:', e?.message || e);
    }
    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(listener);
      } catch (e) {
        // Purchases yapılandırılmadıysa kaldırılacak dinleyici yoktur
      }
    };
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      // Use id_token if available (better for Firebase), fallback to access_token
      const credential = GoogleAuthProvider.credential(id_token || access_token);
      signInWithCredential(auth, credential).catch(err => {
        console.error('Firebase Google Auth Error:', err);
      });
    } else if (response?.type === 'error') {
      console.error('Google Login Error:', response.error);
      console.error('Response Details:', response);
    }
  }, [response]);

  const initPurchases = async () => {
    if (!Purchases) return;
    try {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: Config.REVENUECAT_API_KEY_ANDROID });
      } else if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: Config.REVENUECAT_API_KEY_IOS });
      }

      // Kullanıcı tanımlama onAuthStateChanged içinde yapılır (bu noktada user state'i henüz dolmamıştır)
      const customerInfo = await Purchases.getCustomerInfo();
      await applyProStatus(customerInfo);
    } catch (e) {
      console.error('RevenueCat Customer Info Error:', e);
    }
  };

  const checkUser = async () => {
    try {
      // Check for active session
      const savedUser = await AsyncStorage.getItem('user');
      const savedProStatus = await AsyncStorage.getItem('isPro');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedProStatus) {
        setIsPro(JSON.parse(savedProStatus));
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (mockUserData) => {
    // Legacy support or fallback
    setUser(mockUserData);
    await AsyncStorage.setItem('user', JSON.stringify(mockUserData));
  };

  const loginWithDummyUser = async (type = 'FREE') => {
    try {
      const selectedType = (type || 'FREE').toUpperCase();
      const dummyProfile = DUMMY_USERS[selectedType] || DUMMY_USERS.FREE;

      const today = new Date().toISOString().split('T')[0];
      let habitsToSet = [];
      let breakHabitsToSet = [];
      let extraHabitsToSet = '0';
      let focusHistoryToSet = '{}';
      let focusSessionsToSet = '0';
      let lastFocusDateToSet = today;

      if (selectedType === 'FREE') {
        habitsToSet = DUMMY_HABITS_FREE;
        breakHabitsToSet = DUMMY_BREAK_HABITS_FREE;
        focusSessionsToSet = '1';
        focusHistoryToSet = JSON.stringify({ [today]: 25 });
      } else if (selectedType === 'PRO') {
        habitsToSet = DUMMY_HABITS_PRO;
        breakHabitsToSet = DUMMY_BREAK_HABITS_PRO;
        focusSessionsToSet = DUMMY_FOCUS_DATA_PRO.focusSessionsToday.toString();
        lastFocusDateToSet = DUMMY_FOCUS_DATA_PRO.lastFocusDate;
        focusHistoryToSet = JSON.stringify(DUMMY_FOCUS_DATA_PRO.focusHistory);
      }

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(dummyProfile)],
        ['userProfile', JSON.stringify(dummyProfile)],
        ['isPro', JSON.stringify(dummyProfile.isPro)],
        ['habits', JSON.stringify(habitsToSet)],
        ['breakHabits', JSON.stringify(breakHabitsToSet)],
        ['extraHabits', extraHabitsToSet],
        ['focusHistory', focusHistoryToSet],
        ['focusSessionsToday', focusSessionsToSet],
        ['lastFocusDate', lastFocusDateToSet],
        ['streakFreezes', selectedType === 'PRO' ? '5' : '1'],
      ]);

      setUser(dummyProfile);
      setIsPro(dummyProfile.isPro);
      return { success: true, user: dummyProfile };
    } catch (e) {
      console.error('Error logging in with dummy user:', e);
      return { success: false, error: e.message };
    }
  };

  const googleLogin = async () => {
    try {
      if (GoogleSignin) {
        console.log('🚀 Initiating Native Google Sign-In...');
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();
        // google-signin v13+: iptal hata fırlatmaz, { type: 'cancelled' } döner
        if (userInfo?.type === 'cancelled') {
          return { success: false, cancelled: true };
        }
        const idToken = userInfo.data?.idToken;
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          return { success: true };
        } else {
          console.warn('⚠️ Google Sign-In succeeded but no idToken was returned');
        }
      } else {
        console.log('🌐 GoogleSignin native module not available, falling back to WebAuthSession...');
        if (!request) {
          console.warn('⚠️ Google Auth request not ready yet');
        }
        await promptAsync();
      }
    } catch (e) {
      if (statusCodes && e.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ Google Sign-In cancelled by user');
      } else if (statusCodes && e.code === statusCodes.IN_PROGRESS) {
        console.log('ℹ️ Google Sign-In is already in progress');
      } else if (statusCodes && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('❌ Play Services not available or outdated');
      } else {
        console.error('❌ Google Login Error:', e);
      }
      return { success: false, error: e.message };
    }
  };

  const emailLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  };

  const emailSignup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const userData = {
        name,
        email,
        id: userCredential.user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  };



  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      console.error('Reset Password Error:', e);
      return { success: false, error: e.message, code: e.code };
    }
  };

  const setPasswordForCurrentUser = async (newPassword) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        return { success: false, error: 'User not authenticated' };
      }
      const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword);
      try {
        await linkWithCredential(auth.currentUser, credential);
      } catch (linkErr) {
        if (linkErr.code === 'auth/provider-already-linked') {
          await updatePassword(auth.currentUser, newPassword);
        } else {
          throw linkErr;
        }
      }
      return { success: true };
    } catch (e) {
      console.error('Set Password Error:', e);
      return { success: false, error: e.message, code: e.code };
    }
  };

  const logout = async () => {
    try {
      if (GoogleSignin) {
        try {
          await GoogleSignin.signOut();
        } catch (gErr) {
          console.log('GoogleSignin signOut ignored:', gErr?.message || gErr);
        }
      }
      // Yerel veriyi state'i sıfırlamadan ÖNCE sil: user değişince HabitContext diski yeniden okur
      await AsyncStorage.multiRemove(USER_DATA_KEYS);
      await signOut(auth);
      setUser(null);
      // Pro state'i sıfırlanmazsa aynı cihazda giriş yapan sonraki hesap Pro görünür
      setIsPro(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Dönüş: { success, cancelled } — ekran iptal ile hatayı ayırt edip kullanıcıya uyarı gösterebilsin
  const upgradeToPro = async (rcPackage) => {
    if (!Purchases) {
      // DEV fallback
      if (__DEV__) {
        setIsPro(true);
        await AsyncStorage.setItem('isPro', 'true');
        return { success: true, cancelled: false };
      }
      return { success: false, cancelled: false };
    }
    if (!rcPackage) return { success: false, cancelled: false };
    try {
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      return { success: await applyProStatus(customerInfo), cancelled: false };
    } catch (e) {
      if (e.userCancelled) return { success: false, cancelled: true };
      console.error('Purchase Error:', e);
      return { success: false, cancelled: false };
    }
  };

  const restorePurchases = async () => {
    if (!Purchases) return false;
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (await applyProStatus(customerInfo)) {
        return true;
      }
    } catch (e) {
      console.error('Restore Error:', e);
    }
    return false;
  };

  const resetToFree = async () => {
    setIsPro(false);
    await AsyncStorage.setItem('isPro', 'false');
  };

  const deleteAccount = async () => {
    try {
      if (user?.isDummy) {
        await AsyncStorage.multiRemove(USER_DATA_KEYS);
        setUser(null);
        setIsPro(false);
        return { success: true };
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        // Önce oturum tazeliğini kontrol et: aksi halde Firestore verisi silinir ama
        // deleteUser 'requires-recent-login' ile düşer ve hesap verisiz kalır.
        const lastSignIn = Date.parse(currentUser.metadata?.lastSignInTime || '');
        if (!lastSignIn || Date.now() - lastSignIn > RECENT_LOGIN_WINDOW_MS) {
          return { success: false, code: 'auth/requires-recent-login', error: 'requires-recent-login' };
        }
        // Alışkanlıklar bulut verisini de sil
        try {
          await deleteDoc(doc(db, 'habits', currentUser.uid));
        } catch (hErr) {
          console.warn('⚠️ Firestore habits deleteDoc error:', hErr?.message);
        }
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid));
        } catch (uErr) {
          console.warn('⚠️ Firestore users deleteDoc error:', uErr?.message);
        }
        await firebaseDeleteUser(currentUser);
      }
      await AsyncStorage.multiRemove(USER_DATA_KEYS);
      setUser(null);
      setIsPro(false);
      return { success: true };
    } catch (e) {
      console.error('Delete account error:', e);
      return {
        success: false,
        error: e.message,
        code: e.code
      };
    }
  };

  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    // Sync to Firestore if logged in
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedData, { merge: true });
      } catch (fErr) {
        console.warn('⚠️ Firestore updateUser skipped (check rules):', fErr?.message);
      }
    }

    // Update the persistent profile as well
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{
      user,
      isPro,
      login,
      loginWithDummyUser,
      googleLogin,
      emailLogin,
      emailSignup,
      resetPassword,
      setPasswordForCurrentUser,
      logout,
      upgradeToPro,
      restorePurchases,
      resetToFree,
      updateUser,
      deleteAccount,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
