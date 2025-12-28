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
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';

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

const defaultUserContext = {
  user: null,
  isPro: false,
  loading: true,
  login: () => { },
  googleLogin: () => { },
  emailLogin: () => { },
  emailSignup: () => { },
  phoneLogin: () => { },
  verifyPhoneCode: () => { },
  logout: () => { },
  upgradeToPro: () => { },
  restorePurchases: () => { },
  updateUser: () => { },
};

const UserContext = createContext(defaultUserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  // Expo Go ve APK ayrımını yaparak Google'a giden redirect_uri'yi manuel olarak yönetiyoruz
  const isExpoGo = Constants.appOwnership === 'expo';
  const redirectUri = isExpoGo
    ? 'https://auth.expo.io/@melezprens1989/onyx-habit-tracker'
    : makeRedirectUri({ scheme: 'onyx-habit-tracker' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: Config.GOOGLE_CLIENT_ID_IOS,
    androidClientId: Config.GOOGLE_CLIENT_ID_ANDROID,
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    responseType: 'id_token',
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (isExpoGo) {
      console.log('🛠 Auth Environment: Expo Go');
      console.log('🔗 Forcing Redirect URI:', redirectUri);
    }
  }, []);

  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User logged in via Firebase
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          ...(userDoc.exists() ? userDoc.data() : {})
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        if (Purchases) await Purchases.logIn(firebaseUser.uid);
      } else {
        // User logged out
        setUser(null);
        await AsyncStorage.removeItem('user');
        if (Purchases) await Purchases.logOut();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    checkUser();
    if (Purchases) initPurchases();
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

      // Identify user if logged in
      if (user?.id) {
        await Purchases.logIn(user.id);
      }

      // Check customer info
      const customerInfo = await Purchases.getCustomerInfo();
      if (customerInfo.entitlements.active[Config.PRO_ENTITLEMENT_ID]) {
        setIsPro(true);
      } else {
        setIsPro(false);
      }
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

  const googleLogin = () => {
    promptAsync();
  };

  const emailLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
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
      return { success: false, error: e.message };
    }
  };

  const phoneLogin = async (phoneNumber, recaptchaVerifier) => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirm(confirmation);
      return { success: true };
    } catch (e) {
      console.error('Phone Login Error:', e);
      return { success: false, error: e.message };
    }
  };

  const verifyPhoneCode = async (code) => {
    try {
      if (!confirm) throw new Error('No confirmation object');
      await confirm.confirm(code);
      return { success: true };
    } catch (e) {
      console.error('Verify Code Error:', e);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const upgradeToPro = async (rcPackage) => {
    if (!Purchases) {
      // DEV fallback
      if (__DEV__) {
        setIsPro(true);
        await AsyncStorage.setItem('isPro', 'true');
        return true;
      }
      return false;
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      if (customerInfo.entitlements.active[Config.PRO_ENTITLEMENT_ID]) {
        setIsPro(true);
        await AsyncStorage.setItem('isPro', 'true');
        return true;
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.error('Purchase Error:', e);
      }
    }
    return false;
  };

  const restorePurchases = async () => {
    if (!Purchases) return false;
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active[Config.PRO_ENTITLEMENT_ID]) {
        setIsPro(true);
        await AsyncStorage.setItem('isPro', 'true');
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
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, 'users', currentUser.uid));
        await firebaseDeleteUser(currentUser);
      }
      await AsyncStorage.multiRemove(['user', 'userProfile', 'isPro', 'habits', 'breakHabits', 'extraHabits']);
      setUser(null);
      setIsPro(false);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    // Sync to Firestore if logged in
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedData, { merge: true });
    }

    // Update the persistent profile as well
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{
      user,
      isPro,
      login,
      googleLogin,
      emailLogin,
      emailSignup,
      phoneLogin,
      verifyPhoneCode,
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
