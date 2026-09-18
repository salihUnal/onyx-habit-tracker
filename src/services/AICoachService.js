import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/Config';

/**
 * AICoachService
 * Analyzes habit streaks, focus time, and clean streaks to provide
 * high-value, personalized coaching insights using either Google Gemini API
 * or a comprehensive local heuristic engine.
 */

const CACHE_KEY_PREFIX = '@onyx_ai_coach_report_';

export const calculateHabitMetrics = (habits = [], breakHabits = [], focusHistory = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Past 7 days date strings
  const past7Days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past7Days.push(d.toISOString().split('T')[0]);
  }

  // 1. Weekly completion metrics
  let totalCompletionsLast7Days = 0;
  const habitStats = (habits || []).map(habit => {
    const completedLast7 = (habit.completedDates || []).filter(date => past7Days.includes(date)).length;
    totalCompletionsLast7Days += completedLast7;
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category || 'other',
      streak: habit.streak || 0,
      completedLast7,
      consistencyRate: Math.round((completedLast7 / 7) * 100),
    };
  });

  const totalPossibleCompletions = Math.max(1, habits.length * 7);
  const weeklyCompletionRate = Math.round((totalCompletionsLast7Days / totalPossibleCompletions) * 100);

  // 2. Strongest / Power Habit
  const sortedByStrength = [...habitStats].sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.completedLast7 - a.completedLast7;
  });
  const powerHabit = sortedByStrength.length > 0 && sortedByStrength[0].streak > 0
    ? sortedByStrength[0]
    : sortedByStrength[0] || null;

  // 3. Vulnerable / At-Risk Habit
  const sortedByVulnerability = [...habitStats].sort((a, b) => {
    if (a.completedLast7 !== b.completedLast7) return a.completedLast7 - b.completedLast7;
    return a.streak - b.streak;
  });
  const vulnerableHabit = sortedByVulnerability.length > 1
    ? sortedByVulnerability[0]
    : (sortedByVulnerability[0] && sortedByVulnerability[0].streak === 0 ? sortedByVulnerability[0] : null);

  // 4. Focus Stats
  let totalFocusMinutesLast7Days = 0;
  past7Days.forEach(date => {
    totalFocusMinutesLast7Days += (focusHistory && focusHistory[date]) || 0;
  });

  // 5. Break Habits (Clean streak)
  let totalCleanDays = 0;
  const breakStats = (breakHabits || []).map(b => {
    const ref = b.lastBreakDate || b.createdAt;
    let daysClean = 0;
    if (ref) {
      const start = new Date(ref);
      start.setHours(0, 0, 0, 0);
      daysClean = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
    }
    totalCleanDays += daysClean;
    return { name: b.name, daysClean };
  });

  // 6. Habit Health Score (0 - 100)
  // 50% completion rate + 25% streak health + 15% focus + 10% clean habits
  const streakHealth = habits.length > 0
    ? Math.min(100, Math.round((habits.filter(h => h.streak > 0).length / habits.length) * 100))
    : 0;
  const focusScore = Math.min(100, Math.round((totalFocusMinutesLast7Days / 150) * 100)); // 150 mins weekly goal
  const cleanScore = breakHabits.length > 0
    ? Math.min(100, totalCleanDays * 10)
    : 100;

  let habitScore = 0;
  if (habits.length === 0) {
    habitScore = 50;
  } else {
    habitScore = Math.round(
      (weeklyCompletionRate * 0.5) +
      (streakHealth * 0.25) +
      (focusScore * 0.15) +
      (cleanScore * 0.1)
    );
  }
  habitScore = Math.max(10, Math.min(100, habitScore));

  return {
    weeklyCompletionRate,
    powerHabit,
    vulnerableHabit,
    totalFocusMinutesLast7Days,
    breakStats,
    habitScore,
    totalHabits: habits.length,
  };
};

const getLocalHeuristicReport = (metrics, language = 'English', userName = 'Onyx Champion') => {
  const isTr = language === 'Türkçe';
  const { habitScore, powerHabit, vulnerableHabit, totalFocusMinutesLast7Days, weeklyCompletionRate } = metrics;

  // Grade badge & tone
  let scoreBadge = '';
  let coachMood = '';
  if (habitScore >= 85) {
    scoreBadge = isTr ? '🔥 Durdurulamaz Canavar' : '🔥 Unstoppable Beast';
    coachMood = isTr ? 'Mükemmel ivme yakaladın!' : 'Incredible momentum!';
  } else if (habitScore >= 65) {
    scoreBadge = isTr ? '⚡ Yüksek Disiplin' : '⚡ High Discipline';
    coachMood = isTr ? 'İstikrarlı ve dengeli ilerliyorsun.' : 'Solid, steady progress.';
  } else if (habitScore >= 40) {
    scoreBadge = isTr ? '🌱 Gelişme Aşamasında' : '🌱 Building Rhythm';
    coachMood = isTr ? 'Yeniden toparlanma ve zincir kurma zamanı.' : 'Time to refocus and rebuild chains.';
  } else {
    scoreBadge = isTr ? '🎯 Yeniden Başla' : '🎯 Fresh Reset';
    coachMood = isTr ? 'Küçük adımlarla ivmeyi hemen bugün başlat.' : 'Start small today and regain momentum.';
  }

  // Power habit message
  const powerHabitText = powerHabit
    ? (isTr
      ? `"${powerHabit.name}" serin ${powerHabit.streak} güne ulaştı! Bu alışkanlık senin temel taşına dönüştü.`
      : `Your "${powerHabit.name}" streak is at ${powerHabit.streak} days! This is your bedrock anchor habit.`)
    : (isTr ? 'Henüz aktif bir serin yok. Bugün 1 alışkanlığı tamamlayarak kıvılcımı çak!' : 'No active streak yet. Complete 1 habit today to spark the flame!');

  // Vulnerable habit message
  const vulnerableHabitText = vulnerableHabit
    ? (isTr
      ? `"${vulnerableHabit.name}" son 7 günde aksamaya başladı. Yarın sabah ilk iş olarak buna 5 dakika ayır.`
      : `"${vulnerableHabit.name}" slipped recently. Dedicate just 5 friction-free minutes to it tomorrow.`)
    : (isTr ? 'Tüm alışkanlıkların dengede ilerliyor, riskli halka görünmüyor!' : 'All your habits are well-balanced with no critical risks!');

  // 3 Actionable Tips
  const actionableTips = isTr ? [
    {
      icon: 'zap',
      title: 'İki Dakika Kuralı',
      text: vulnerableHabit
        ? `"${vulnerableHabit.name}" için başlama eşiğini düşür. Sadece 2 dakika yapmayı hedefle.`
        : 'Zorlandığın anlarda görevi en küçük parçasına böl ve 2 dakika kuralını uygula.'
    },
    {
      icon: 'clock',
      title: 'Odak Bloklama',
      text: totalFocusMinutesLast7Days > 60
        ? `Haftalık ${totalFocusMinutesLast7Days} dk odak süren harika. Bunu sabah saatlerine kaydırırsan verim %30 artar.`
        : 'Günde sadece 1 seans 25 dk Pomodoro açarak alışkanlıklarını derin odakla bağla.'
    },
    {
      icon: 'shield',
      title: 'Seri Dondurma Kalkanı',
      text: 'Yoğun günlerde zincirini korumak için Seri Dondurma kalkanını hazır tut, moralini yüksek tut.'
    }
  ] : [
    {
      icon: 'zap',
      title: 'The 2-Minute Rule',
      text: vulnerableHabit
        ? `Lower the activation barrier for "${vulnerableHabit.name}". Commit to doing it for just 2 minutes.`
        : 'Whenever you feel resistance, break the task into its micro-step and apply the 2-minute rule.'
    },
    {
      icon: 'clock',
      title: 'Focus Stacking',
      text: totalFocusMinutesLast7Days > 60
        ? `Your weekly ${totalFocusMinutesLast7Days} mins of deep work is solid. Shift it to morning hours for +30% impact.`
        : 'Pair your hardest habit with a single 25-minute Pomodoro focus block.'
    },
    {
      icon: 'shield',
      title: 'Streak Protection',
      text: 'Keep a Streak Freeze shield active on crazy days to protect your identity and momentum.'
    }
  ];

  // Daily punchy Gen-Z / Onyx quote
  const quotesTr = [
    '"Kimse seni kurtarmaya gelmeyecek. Disiplin, kendi kendine verdiğin en büyük hediyedir."',
    '"Motivasyon seni başlatır, alışkanlıklar seni zirveye taşır."',
    '"Yarın değil, şimdi. Karanlık neon enerjini serbest bırak ve zinciri kırma."',
    '"Günün %1\'ini alışkanlıklarına ayırmak hayatını %100 değiştirir."',
  ];

  const quotesEn = [
    '"No one is coming to save you. Daily discipline is your personal superpower."',
    '"Motivation gets you going, but relentless systems keep you growing."',
    '"Not tomorrow. Now. Lock into your zone and keep the flame burning."',
    '"1% improvement every day compounds into unstoppable mastery."',
  ];

  const quoteList = isTr ? quotesTr : quotesEn;
  const dailyQuote = quoteList[Math.floor(Math.random() * quoteList.length)];

  return {
    scoreBadge,
    habitScore,
    coachMood,
    powerHabitTitle: powerHabit?.name || (isTr ? 'Henüz Yok' : 'None yet'),
    powerHabitText,
    vulnerableHabitTitle: vulnerableHabit?.name || (isTr ? 'Yok' : 'None'),
    vulnerableHabitText,
    actionableTips,
    dailyQuote,
    weeklyCompletionRate,
    totalFocusMinutesLast7Days,
    generatedAt: new Date().toISOString(),
    engine: 'onyx-heuristic-ai',
  };
};

export const generateAICoachReport = async ({
  habits = [],
  breakHabits = [],
  focusHistory = {},
  language = 'English',
  userName = 'Champion',
  forceRefresh = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const cacheKey = `${CACHE_KEY_PREFIX}${todayStr}_${language}`;

  if (!forceRefresh) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.log('Error reading AI coach cache:', e);
    }
  }

  const metrics = calculateHabitMetrics(habits, breakHabits, focusHistory);

  // If Gemini API Key is configured, attempt remote AI generation
  if (Config.GEMINI_API_KEY && Config.GEMINI_API_KEY.trim().length > 10) {
    try {
      const prompt = `You are Onyx AI Habit Coach, a sharp, inspiring Gen-Z habit & focus coach.
Analyze this user's data:
- Habit Health Score: ${metrics.habitScore}/100
- Weekly Completion: ${metrics.weeklyCompletionRate}%
- Power Habit: ${metrics.powerHabit ? metrics.powerHabit.name + ' (' + metrics.powerHabit.streak + ' day streak)' : 'None'}
- Vulnerable Habit: ${metrics.vulnerableHabit ? metrics.vulnerableHabit.name : 'None'}
- Deep Focus: ${metrics.totalFocusMinutesLast7Days} minutes in past 7 days.
Respond strictly with valid JSON with fields:
{
  "scoreBadge": "short title badge",
  "coachMood": "1 punchy sentence assessment",
  "powerHabitText": "1 encouraging sentence",
  "vulnerableHabitText": "1 actionable advice sentence",
  "actionableTips": [
    {"icon": "zap", "title": "...", "text": "..."},
    {"icon": "clock", "title": "...", "text": "..."},
    {"icon": "shield", "title": "...", "text": "..."}
  ],
  "dailyQuote": "1 badass motivational quote"
}
Language: ${language}.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Config.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const candidate = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          const finalReport = {
            ...parsed,
            habitScore: metrics.habitScore,
            powerHabitTitle: metrics.powerHabit?.name || 'Power Habit',
            vulnerableHabitTitle: metrics.vulnerableHabit?.name || 'Vulnerable Habit',
            weeklyCompletionRate: metrics.weeklyCompletionRate,
            totalFocusMinutesLast7Days: metrics.totalFocusMinutesLast7Days,
            generatedAt: new Date().toISOString(),
            engine: 'gemini-1.5-flash',
          };
          await AsyncStorage.setItem(cacheKey, JSON.stringify(finalReport));
          return finalReport;
        }
      }
    } catch (err) {
      console.log('Gemini API call failed, falling back to heuristic engine:', err);
    }
  }

  // Fallback / Standalone local AI engine
  const report = getLocalHeuristicReport(metrics, language, userName);
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(report));
  } catch (e) {
    console.log('Error caching report:', e);
  }
  return report;
};
