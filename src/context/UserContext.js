import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultUserContext = {
  user: null,
  isPro: false,
  loading: true,
  login: () => { },
  logout: () => { },
  upgradeToPro: () => { },
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
    setUser(mockUserData);
    await AsyncStorage.setItem('user', JSON.stringify(mockUserData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const upgradeToPro = async () => {
    setIsPro(true);
    await AsyncStorage.setItem('isPro', 'true');
  };

  return (
    <UserContext.Provider value={{ user, isPro, login, logout, upgradeToPro, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
