import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

const defaultHabitContext = {
  habits: [],
  addHabit: () => ({ success: false }),
  toggleHabit: () => { },
  deleteHabit: () => { },
};

const HabitContext = createContext(defaultHabitContext);

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [breakHabits, setBreakHabits] = useState([]);
  const [extraHabits, setExtraHabits] = useState(0);
  const [adRewardExpiry, setAdRewardExpiry] = useState(null);
  const { isPro } = useUser();

  useEffect(() => {
    loadHabits();
    loadBreakHabits();
    loadExtraHabits();
  }, []);

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

  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  };

  const saveBreakHabits = async (newBreakHabits) => {
    setBreakHabits(newBreakHabits);
    try {
      await AsyncStorage.setItem('breakHabits', JSON.stringify(newBreakHabits));
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

  const rewardExtraHabit = async () => {
    const newValue = extraHabits + 1;
    // Set expiry to 1 hour from now (3600000 ms)
    const newExpiry = Date.now() + 3600000;

    console.log('🎁 rewardExtraHabit called:', {
      oldValue: extraHabits,
      newValue,
      newExpiry,
      expiresIn: '1 hour'
    });

    setExtraHabits(newValue);
    setAdRewardExpiry(newExpiry);

    try {
      await AsyncStorage.setItem('extraHabits', newValue.toString());
      await AsyncStorage.setItem('adRewardExpiry', newExpiry.toString());
      console.log('✅ Reward saved to AsyncStorage');
    } catch (e) {
      console.error('Failed to save extra habits', e);
    }
  };

  const addHabit = (name, category = 'other', reminderTime = null) => {
    // Check if user needs to use an extra slot
    if (!isPro && habits.length >= 5) {
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
    return { success: true };
  };

  const updateHabit = (id, updates) => {
    const newHabits = habits.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    );
    saveHabits(newHabits);
    return { success: true };
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
      breakHabits,
      addBreakHabit,
      toggleBreakHabit,
      deleteBreakHabit
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
