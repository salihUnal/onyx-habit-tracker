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
  const { isPro } = useUser();

  useEffect(() => {
    loadHabits();
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

  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  };

  const addHabit = (name, category = 'other', reminderTime = null) => {
    if (!isPro && habits.length >= 3) {
      return { success: false, error: 'limit_reached' };
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

  const toggleHabit = (id) => {
    const today = new Date().toISOString().split('T')[0];

    const newHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCompletedToday = habit.completedDates.includes(today);
        let newStreak = habit.streak;
        let newCompletedDates = [...habit.completedDates];

        if (isCompletedToday) {
          newCompletedDates = newCompletedDates.filter(date => date !== today);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          newCompletedDates.push(today);
          newStreak += 1;
        }

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
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

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, toggleHabit, deleteHabit }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
