import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { db, auth } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import NotificationService from '../services/NotificationService';

const withTimeout = (promise, ms = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ]);
};

const defaultHabitContext = {
  habits: [],
  addHabit: () => ({ success: false }),
  toggleHabit: () => { },
  deleteHabit: () => { },
  streakFreezes: 1,
  useStreakFreeze: () => ({ success: false }),
  earnStreakFreezeWithAd: () => ({ success: false }),
};

const HabitContext = createContext(defaultHabitContext);

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [breakHabits, setBreakHabits] = useState([]);
  const [extraHabits, setExtraHabits] = useState(0);
  const [adRewardExpiry, setAdRewardExpiry] = useState(null);
  const [focusSessionsToday, setFocusSessionsToday] = useState(0);
  const [focusHistory, setFocusHistory] = useState({}); // { '2023-10-01': totalMinutes }
  const [lastFocusDate, setLastFocusDate] = useState(null);
  const [focusState, setFocusState] = useState({
    isActive: false,
    startTime: null,
    durationMinutes: 25,
    elapsedSeconds: 0, // Accumulated elapsed time before current active session
    sessionCompleted: false
  });
  const [streakFreezes, setStreakFreezes] = useState(1);
  const { isPro, user } = useUser();

  useEffect(() => {
    loadHabits();
    loadBreakHabits();
    loadExtraHabits();
    loadFocusStats();
    loadStreakFreezes();
    if (user?.id) {
      loadFromCloud();
    }
  }, [user?.id]);

  const mergeHabitData = (localItems, cloudItems) => {
    const merged = [...localItems];
    cloudItems.forEach(cloudItem => {
      const localIndex = merged.findIndex(item => item.id === cloudItem.id);
      if (localIndex > -1) {
        const localItem = merged[localIndex];
        const mergedCompletedDates = [...new Set([...(localItem.completedDates || []), ...(cloudItem.completedDates || [])])];
        merged[localIndex] = {
          ...localItem,
          ...cloudItem,
          completedDates: mergedCompletedDates,
          streak: calculateStreak(mergedCompletedDates)
        };
      } else {
        merged.push(cloudItem);
      }
    });
    return merged;
  };

  const mergeBreakHabitsData = (localItems, cloudItems) => {
    const merged = [...localItems];
    cloudItems.forEach(cloudItem => {
      const localIndex = merged.findIndex(item => item.id === cloudItem.id);
      if (localIndex > -1) {
        const localItem = merged[localIndex];
        const newerLastBreakDate = (localItem.lastBreakDate && cloudItem.lastBreakDate)
          ? (new Date(localItem.lastBreakDate) > new Date(cloudItem.lastBreakDate) ? localItem.lastBreakDate : cloudItem.lastBreakDate)
          : (localItem.lastBreakDate || cloudItem.lastBreakDate);
        merged[localIndex] = {
          ...localItem,
          ...cloudItem,
          lastBreakDate: newerLastBreakDate
        };
      } else {
        merged.push(cloudItem);
      }
    });
    return merged;
  };

  const loadFromCloud = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, 'habits', auth.currentUser.uid);
      const docSnap = await withTimeout(getDoc(docRef), 5000);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        
        const localHabitsRaw = await AsyncStorage.getItem('habits');
        const localBreakHabitsRaw = await AsyncStorage.getItem('breakHabits');
        
        const localHabits = localHabitsRaw ? JSON.parse(localHabitsRaw) : [];
        const localBreakHabits = localBreakHabitsRaw ? JSON.parse(localBreakHabitsRaw) : [];
        
        const cloudHabits = data.habits || [];
        const cloudBreakHabits = data.breakHabits || [];
        
        const mergedHabits = mergeHabitData(localHabits, cloudHabits);
        const mergedBreakHabits = mergeBreakHabitsData(localBreakHabits, cloudBreakHabits);
        
        await saveHabits(mergedHabits, true);
        await saveBreakHabits(mergedBreakHabits, true);
        NotificationService.syncAllHabitReminders(mergedHabits);
      } else {
        await syncWithCloud(habits, breakHabits);
      }
    } catch (e) {
      if (e?.code === 'permission-denied' || e?.message?.includes('insufficient permissions') || e?.message?.includes('Missing or insufficient permissions')) {
        console.warn('⚠️ Cloud sync: Firestore security rules need updating in Firebase Console. Using local habits.');
      } else {
        console.warn('⚠️ Cloud load skipped (offline or timeout). Preserving local storage:', e?.message || e);
      }
    }
  };

  const syncWithCloud = async (habitsToSync, breakHabitsToSync) => {
    if (!auth.currentUser) return;
    try {
      await withTimeout(
        setDoc(doc(db, 'habits', auth.currentUser.uid), {
          habits: habitsToSync || habits,
          breakHabits: breakHabitsToSync || breakHabits,
          lastUpdated: new Date().toISOString()
        }, { merge: true }),
        5000
      );
    } catch (e) {
      if (e?.code === 'permission-denied' || e?.message?.includes('insufficient permissions') || e?.message?.includes('Missing or insufficient permissions')) {
        console.warn('⚠️ Cloud sync: Firestore security rules need updating. Habits saved locally.');
      } else {
        console.warn('⚠️ Cloud sync pending (offline or timeout). Local data safely saved.');
      }
    }
  };

  const loadHabits = async () => {
    try {
      const savedHabits = await AsyncStorage.getItem('habits');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (e) {
      console.error('Failed to load habits', e);
    }
  };

  const loadBreakHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem('breakHabits');
      if (saved) {
        setBreakHabits(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load break habits', e);
    }
  };

  const saveHabits = async (newHabits, sync = true) => {
    setHabits(newHabits);
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
      if (sync) syncWithCloud(newHabits, null);
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  };

  const saveBreakHabits = async (newBreakHabits, sync = true) => {
    setBreakHabits(newBreakHabits);
    try {
      await AsyncStorage.setItem('breakHabits', JSON.stringify(newBreakHabits));
      if (sync) syncWithCloud(null, newBreakHabits);
    } catch (e) {
      console.error('Failed to save break habits', e);
    }
  };

  const loadExtraHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem('extraHabits');
      const savedExpiry = await AsyncStorage.getItem('adRewardExpiry');

      if (saved) setExtraHabits(parseInt(saved, 10));
      if (savedExpiry) setAdRewardExpiry(parseInt(savedExpiry, 10));
    } catch (e) {
      console.error('Failed to load extra habits', e);
    }
  };

  const loadStreakFreezes = async () => {
    try {
      const saved = await AsyncStorage.getItem('streakFreezes');
      if (saved !== null) {
        setStreakFreezes(parseInt(saved, 10));
      } else {
        setStreakFreezes(1);
        await AsyncStorage.setItem('streakFreezes', '1');
      }
    } catch (e) {
      console.error('Failed to load streak freezes', e);
    }
  };

  const saveStreakFreezes = async (count) => {
    setStreakFreezes(count);
    try {
      await AsyncStorage.setItem('streakFreezes', count.toString());
      if (auth.currentUser) {
        await setDoc(doc(db, 'habits', auth.currentUser.uid), {
          streakFreezes: count,
        }, { merge: true });
      }
    } catch (e) {
      console.error('Failed to save streak freezes', e);
    }
  };

  const loadFocusStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDate = await AsyncStorage.getItem('lastFocusDate');
      const storedCount = await AsyncStorage.getItem('focusSessionsToday');
      const storedHistory = await AsyncStorage.getItem('focusHistory');

      if (storedHistory) {
        setFocusHistory(JSON.parse(storedHistory));
      }

      if (storedDate === today) {
        setLastFocusDate(today);
        setFocusSessionsToday(parseInt(storedCount || '0', 10));
      } else {
        setLastFocusDate(today);
        setFocusSessionsToday(0);
        await AsyncStorage.setItem('lastFocusDate', today);
        await AsyncStorage.setItem('focusSessionsToday', '0');
      }
    } catch (e) {
      console.error('Failed to load focus stats', e);
    }
  };

  const recordFocusSession = async (durationMinutes) => {
    const today = new Date().toISOString().split('T')[0];

    // Update today's count
    let newCount = 1;
    if (lastFocusDate === today) {
      newCount = focusSessionsToday + 1;
    } else {
      setLastFocusDate(today);
      await AsyncStorage.setItem('lastFocusDate', today);
    }
    setFocusSessionsToday(newCount);
    await AsyncStorage.setItem('focusSessionsToday', newCount.toString());

    // Update history
    setFocusHistory(prev => {
      const newHistory = { ...prev };
      newHistory[today] = (newHistory[today] || 0) + durationMinutes;
      AsyncStorage.setItem('focusHistory', JSON.stringify(newHistory)).catch(e => console.error(e));

      // Sync focus history to cloud if available
      if (auth.currentUser) {
        setDoc(doc(db, 'habits', auth.currentUser.uid), {
          focusHistory: newHistory,
        }, { merge: true }).catch(e => console.error('Cloud sync focus error', e));
      }

      return newHistory;
    });
  };

  const rewardExtraHabit = async () => {
    // Set expiry to 1 hour from now (3600000 ms)
    const newExpiry = Date.now() + 3600000;

    setExtraHabits(prev => {
      const newValue = prev + 1;
      AsyncStorage.setItem('extraHabits', newValue.toString()).catch(e => console.error(e));
      return newValue;
    });

    setAdRewardExpiry(newExpiry);
    AsyncStorage.setItem('adRewardExpiry', newExpiry.toString()).catch(e => console.error(e));
  };

  const addHabit = (name, category = 'other', reminderTime = null) => {
    // Check if user needs to use an extra slot
    if (!isPro && habits.length >= 3) {
      if (extraHabits > 0) {
        // Check expiry
        if (adRewardExpiry && Date.now() > adRewardExpiry) {
          // Expired
          setExtraHabits(0);
          setAdRewardExpiry(null);
          AsyncStorage.setItem('extraHabits', '0');
          AsyncStorage.removeItem('adRewardExpiry');
          return { success: false, error: 'reward_expired' };
        }

        // Use one extra habit
        const newExtra = extraHabits - 1;
        setExtraHabits(newExtra);
        AsyncStorage.setItem('extraHabits', newExtra.toString());
        if (newExtra === 0) {
          setAdRewardExpiry(null);
          AsyncStorage.removeItem('adRewardExpiry');
        }
      } else {
        return { success: false, error: 'limit_reached' };
      }
    }

    const newHabit = {
      id: Date.now().toString(),
      name,
      category,
      reminderTime,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    const newHabits = [...habits, newHabit];
    saveHabits(newHabits);
    if (reminderTime) {
      NotificationService.scheduleHabitReminder(newHabit);
    }
    return { success: true, habit: newHabit };
  };

  const startFocus = (durationMinutes) => {
    // If resuming
    if (focusState.elapsedSeconds > 0 && focusState.durationMinutes === durationMinutes) {
      setFocusState(prev => ({ ...prev, isActive: true, startTime: Date.now() }));
      return { success: true };
    }

    // New session check
    if (!isPro && focusSessionsToday >= 2) {
      // Check for extra slots (reusing extraHabits logic or separate?)
      // User said "reklam izleme seçeneği çıksın". Use extraHabits for simplicity or return specific error
      if (extraHabits > 0) {
        // Consume one extra habit credit for this focus session
        const newExtra = extraHabits - 1;
        setExtraHabits(newExtra);
        AsyncStorage.setItem('extraHabits', newExtra.toString());
        if (newExtra === 0) {
          setAdRewardExpiry(null);
          AsyncStorage.removeItem('adRewardExpiry');
        }

        // Allow session start
        setFocusState({
          isActive: true,
          startTime: Date.now(),
          durationMinutes,
          elapsedSeconds: 0
        });
        return { success: true };
      }
      return { success: false, error: 'focus_limit_reached' };
    }

    setFocusState({
      isActive: true,
      startTime: Date.now(),
      durationMinutes,
      durationMinutes,
      elapsedSeconds: 0,
      sessionCompleted: false
    });
    return { success: true };
  };

  const pauseFocus = () => {
    if (focusState.isActive) {
      const now = Date.now();
      const sessionElapsed = (now - focusState.startTime) / 1000;
      setFocusState(prev => ({
        ...prev,
        isActive: false,
        startTime: null,
        elapsedSeconds: prev.elapsedSeconds + sessionElapsed
      }));
    }
  };

  const stopFocus = () => {
    // Calculate total elapsed
    let totalElapsed = focusState.elapsedSeconds;
    if (focusState.isActive && focusState.startTime) {
      totalElapsed += (Date.now() - focusState.startTime) / 1000;
    }

    const totalDurationSeconds = focusState.durationMinutes * 60;

    // If completed or > 50%
    let completed = false;
    if (totalElapsed >= totalDurationSeconds || totalElapsed >= (totalDurationSeconds / 2)) {
      const minutesCompleted = Math.round(totalElapsed / 60);
      recordFocusSession(minutesCompleted);
      completed = true;
    }



    setFocusState({
      isActive: false,
      startTime: null,
      durationMinutes: 25,
      elapsedSeconds: 0,
      sessionCompleted: completed
    });
  };

  const getFocusTimeLeft = () => {
    const totalDurationSeconds = focusState.durationMinutes * 60;
    let currentElapsed = focusState.elapsedSeconds;
    if (focusState.isActive && focusState.startTime) {
      currentElapsed += (Date.now() - focusState.startTime) / 1000;
    }
    return Math.max(0, totalDurationSeconds - currentElapsed);
  };

  const updateHabit = (id, updates) => {
    let updatedHabit = null;
    const newHabits = habits.map(habit => {
      if (habit.id === id) {
        updatedHabit = { ...habit, ...updates };
        if (updatedHabit.reminderTime) {
          NotificationService.scheduleHabitReminder(updatedHabit);
        } else {
          NotificationService.cancelHabitReminder(id);
        }
        return updatedHabit;
      }
      return habit;
    });
    saveHabits(newHabits);
    return { success: true, habit: updatedHabit };
  };

  const calculateStreak = (completedDates) => {
    const uniqueDates = [...new Set(completedDates)];
    const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(today);

    // Determine start point
    if (sortedDates.includes(todayStr)) {
      // Start from today
    } else if (sortedDates.includes(yesterdayStr)) {
      // Start from yesterday
      checkDate = new Date(yesterday);
    } else {
      return 0; // Streak lost
    }

    // Count backwards
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const toggleHabit = (id, date = null) => {
    const targetDate = date ? new Date(date) : new Date();
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const newHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCompletedOnTargetDate = habit.completedDates.includes(targetDateStr);
        let newCompletedDates = [...habit.completedDates];

        if (isCompletedOnTargetDate) {
          newCompletedDates = newCompletedDates.filter(d => d !== targetDateStr);
        } else {
          newCompletedDates.push(targetDateStr);
        }

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: calculateStreak(newCompletedDates),
        };
      }
      return habit;
    });

    saveHabits(newHabits);
  };

  const deleteHabit = (id) => {
    const newHabits = habits.filter(habit => habit.id !== id);
    saveHabits(newHabits);
    NotificationService.cancelHabitReminder(id);
  };

  // Break Habits (Bad Habits) Functions
  const addBreakHabit = (name) => {
    console.log('🔍 addBreakHabit called:', {
      isPro,
      breakHabitsLength: breakHabits.length,
      extraHabits,
      adRewardExpiry,
      now: Date.now(),
      expired: adRewardExpiry ? Date.now() > adRewardExpiry : null
    });

    // Check if user needs to use an extra slot (same as addHabit logic)
    if (!isPro && breakHabits.length >= 3) {
      if (extraHabits > 0) {
        // Check expiry
        if (adRewardExpiry && Date.now() > adRewardExpiry) {
          console.log('❌ Reward expired');
          // Expired
          setExtraHabits(0);
          setAdRewardExpiry(null);
          AsyncStorage.setItem('extraHabits', '0');
          AsyncStorage.removeItem('adRewardExpiry');
          return { success: false, error: 'reward_expired' };
        }

        console.log('✅ Using extra slot');
        // Use one extra habit
        const newExtra = extraHabits - 1;
        setExtraHabits(newExtra);
        AsyncStorage.setItem('extraHabits', newExtra.toString());
        if (newExtra === 0) {
          setAdRewardExpiry(null);
          AsyncStorage.removeItem('adRewardExpiry');
        }
      } else {
        console.log('❌ No extra habits available, limit reached');
        return { success: false, error: 'limit_reached' };
      }
    }

    console.log('✅ Adding break habit');
    const newBreakHabit = {
      id: Date.now().toString(),
      name,
      lastBreakDate: null,
      createdAt: new Date().toISOString(),
    };

    const newBreakHabits = [...breakHabits, newBreakHabit];
    saveBreakHabits(newBreakHabits);
    return { success: true };
  };

  const toggleBreakHabit = (id) => {
    const today = new Date().toISOString();
    const newBreakHabits = breakHabits.map(habit =>
      habit.id === id ? { ...habit, lastBreakDate: today } : habit
    );
    saveBreakHabits(newBreakHabits);
  };

  const deleteBreakHabit = (id) => {
    const newBreakHabits = breakHabits.filter(habit => habit.id !== id);
    saveBreakHabits(newBreakHabits);
  };

  const repairStreak = (id) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newHabits = habits.map(habit => {
      if (habit.id === id) {
        if (!habit.completedDates.includes(yesterdayStr)) {
          const newCompletedDates = [...habit.completedDates, yesterdayStr];
          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: calculateStreak(newCompletedDates)
          };
        }
      }
      return habit;
    });
    saveHabits(newHabits);
  };

  const useStreakFreeze = async (habitId) => {
    if (!isPro && streakFreezes <= 0) {
      return { success: false, reason: 'no_freezes' };
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completed = habit.completedDates || [];
        const frozen = habit.frozenDates || [];
        const newCompleted = completed.includes(yesterdayStr) ? completed : [...completed, yesterdayStr];
        const newFrozen = frozen.includes(yesterdayStr) ? frozen : [...frozen, yesterdayStr];
        return {
          ...habit,
          completedDates: newCompleted,
          frozenDates: newFrozen,
          streak: calculateStreak(newCompleted),
        };
      }
      return habit;
    });

    await saveHabits(newHabits);

    if (!isPro) {
      const nextFreezes = Math.max(0, streakFreezes - 1);
      await saveStreakFreezes(nextFreezes);
    }
    return { success: true };
  };

  const earnStreakFreezeWithAd = async () => {
    const nextFreezes = streakFreezes + 1;
    await saveStreakFreezes(nextFreezes);
    return { success: true, count: nextFreezes };
  };

  const reloadAllHabitData = async () => {
    await loadHabits();
    await loadBreakHabits();
    await loadExtraHabits();
    await loadFocusStats();
    await loadStreakFreezes();
  };

  return (
    <HabitContext.Provider value={{
      habits,
      addHabit,
      updateHabit,
      toggleHabit,
      deleteHabit,
      rewardExtraHabit,
      extraHabits,
      repairStreak,
      useStreakFreeze,
      earnStreakFreezeWithAd,
      streakFreezes,
      breakHabits,
      addBreakHabit,
      toggleBreakHabit,
      deleteBreakHabit,
      focusSessionsToday,
      focusHistory,
      recordFocusSession,
      focusState,
      startFocus,
      pauseFocus,
      stopFocus,
      getFocusTimeLeft,
      reloadAllHabitData
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
