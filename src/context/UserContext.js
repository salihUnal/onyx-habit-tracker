import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultUserContext = {
  user: null,
  isPro: false,
  loading: true,
  login: () => { },
  logout: () => { },
  upgradeToPro: () => { },
  updateUser: () => { },
};

const UserContext = createContext(defaultUserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

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
    try {
      // Check if we have a saved profile for this user
      const savedProfileJson = await AsyncStorage.getItem('userProfile');
      let userToSet = mockUserData;

      if (savedProfileJson) {
        const savedProfile = JSON.parse(savedProfileJson);
        // Merge saved profile (name, avatar) with login data (id, email method)
        userToSet = {
          ...mockUserData,
          name: savedProfile.name || mockUserData.name,
          avatar: savedProfile.avatar || mockUserData.avatar,
          // Keep the email from login if provided, otherwise fallback to saved
          email: mockUserData.email || savedProfile.email
        };
      }

      setUser(userToSet);
      await AsyncStorage.setItem('user', JSON.stringify(userToSet));

      // Also save/update the profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(userToSet));
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    // Only remove the active session 'user', keep 'userProfile' for next login
    await AsyncStorage.removeItem('user');
  };

  const upgradeToPro = async () => {
    setIsPro(true);
    await AsyncStorage.setItem('isPro', 'true');
  };

  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    // Update the persistent profile as well
    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, isPro, login, logout, upgradeToPro, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
