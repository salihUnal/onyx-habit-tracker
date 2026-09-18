// src/constants/dummyData.js
// Onyx Habit Tracker - Comprehensive Dummy / Mock Data for Testing

const getPastDateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = getPastDateStr(1);
const twoDaysAgoStr = getPastDateStr(2);
const threeDaysAgoStr = getPastDateStr(3);
const fourDaysAgoStr = getPastDateStr(4);

export const DUMMY_USERS = {
  FREE: {
    id: 'dummy_free',
    name: 'Alex Rivera (Free Tester)',
    email: 'alex.free@onyx-test.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isPro: false,
    isDummy: true,
  },
  PRO: {
    id: 'dummy_pro',
    name: 'Sarah Connor (Pro Tester)',
    email: 'sarah.pro@onyx-test.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isPro: true,
    isDummy: true,
  },
  CLEAN: {
    id: 'dummy_clean',
    name: 'Deniz Kaya (New User)',
    email: 'deniz.clean@onyx-test.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    isPro: false,
    isDummy: true,
  },
};

export const DUMMY_HABITS_FREE = [
  {
    id: 'dummy_h1',
    name: '30 Dk Kitap Oku',
    category: 'study',
    reminderTime: '21:00',
    streak: 4,
    completedDates: [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'dummy_h2',
    name: '2.5 Litre Su İç',
    category: 'health',
    reminderTime: '12:00',
    streak: 7,
    completedDates: [
      todayStr,
      yesterdayStr,
      twoDaysAgoStr,
      threeDaysAgoStr,
      fourDaysAgoStr,
      getPastDateStr(5),
      getPastDateStr(6),
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'dummy_h3',
    name: 'Sabah Meditasyonu',
    category: 'mindfulness',
    reminderTime: '08:00',
    streak: 2,
    completedDates: [twoDaysAgoStr, threeDaysAgoStr], // missed yesterday -> triggers Streak Rescue!
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const DUMMY_BREAK_HABITS_FREE = [
  {
    id: 'dummy_bh1',
    name: 'Gece Geç Saat Fast-Food',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    lastBreakDate: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const DUMMY_HABITS_PRO = [
  {
    id: 'dummy_pro_h1',
    name: 'Sabah Koşusu (5K)',
    category: 'fitness',
    reminderTime: '07:00',
    streak: 42,
    completedDates: [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr, fourDaysAgoStr],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_h2',
    name: 'Derin Odaklanma (Deep Work)',
    category: 'work',
    reminderTime: '10:00',
    streak: 21,
    completedDates: [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_h3',
    name: 'Günlük Kodlama / Proje',
    category: 'study',
    reminderTime: '14:00',
    streak: 30,
    completedDates: [todayStr, yesterdayStr, twoDaysAgoStr],
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_h4',
    name: 'Soğuk Duş',
    category: 'health',
    reminderTime: '07:30',
    streak: 15,
    completedDates: [twoDaysAgoStr, threeDaysAgoStr, getPastDateStr(4)], // missed yesterday -> triggers Streak Rescue for Pro!
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_h5',
    name: 'İngilizce Makale & Podcast',
    category: 'study',
    reminderTime: '19:00',
    streak: 12,
    completedDates: [todayStr, yesterdayStr, twoDaysAgoStr],
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_h6',
    name: 'Akşam Esneme & Yoga',
    category: 'fitness',
    reminderTime: '22:00',
    streak: 9,
    completedDates: [yesterdayStr, twoDaysAgoStr], // incomplete today
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const DUMMY_BREAK_HABITS_PRO = [
  {
    id: 'dummy_pro_bh1',
    name: 'Sosyal Medyada Boş Kaydırma',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    lastBreakDate: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_bh2',
    name: 'Şekerli & Gazlı İçecek',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    lastBreakDate: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'dummy_pro_bh3',
    name: 'Tırnak Yeme',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastBreakDate: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
];

export const DUMMY_FOCUS_DATA_PRO = {
  focusSessionsToday: 3,
  lastFocusDate: todayStr,
  focusHistory: {
    [todayStr]: 75,
    [yesterdayStr]: 100,
    [twoDaysAgoStr]: 50,
    [threeDaysAgoStr]: 125,
    [fourDaysAgoStr]: 75,
  },
};
