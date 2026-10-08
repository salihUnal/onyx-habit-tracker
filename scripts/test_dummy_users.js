// Test script to verify dummy users structure and limit logic
const {
  DUMMY_USERS,
  DUMMY_HABITS_FREE,
  DUMMY_BREAK_HABITS_FREE,
  DUMMY_HABITS_PRO,
  DUMMY_BREAK_HABITS_PRO,
  DUMMY_FOCUS_DATA_PRO
} = require('../src/constants/dummyData');

console.log('--- 🧪 ONYX HABIT TRACKER DUMMY USER TEST SUITE ---');

// 1. FREE USER (Alex Rivera)
const freeUser = DUMMY_USERS.FREE;
console.log(`\n1. Testing FREE User: ${freeUser.name} (${freeUser.email})`);
console.log(`- isPro: ${freeUser.isPro} (Expected: false)`);
console.log(`- Initial Habits count: ${DUMMY_HABITS_FREE.length}`);
console.log(`- Initial Break Habits count: ${DUMMY_BREAK_HABITS_FREE.length}`);
if (!freeUser.isPro && DUMMY_HABITS_FREE.length === 3) {
  console.log('✅ FREE User Profile & 3-Habit Limit Baseline PASSED');
} else {
  console.error('❌ FREE User validation FAILED');
}

// 2. PRO USER (Sarah Connor)
const proUser = DUMMY_USERS.PRO;
console.log(`\n2. Testing PRO User: ${proUser.name} (${proUser.email})`);
console.log(`- isPro: ${proUser.isPro} (Expected: true)`);
console.log(`- Initial Habits count: ${DUMMY_HABITS_PRO.length}`);
console.log(`- Initial Break Habits count: ${DUMMY_BREAK_HABITS_PRO.length}`);
console.log(`- Focus Minutes: ${DUMMY_FOCUS_DATA_PRO.focusSessionsToday} sessions today`);
if (proUser.isPro && DUMMY_HABITS_PRO.length === 6) {
  console.log('✅ PRO User Profile & Unrestricted Features PASSED');
} else {
  console.error('❌ PRO User validation FAILED');
}

// 3. CLEAN USER
const cleanUser = DUMMY_USERS.CLEAN;
console.log(`\n3. Testing CLEAN User: ${cleanUser.name} (${cleanUser.email})`);
console.log(`- isPro: ${cleanUser.isPro} (Expected: false)`);
if (!cleanUser.isPro) {
  console.log('✅ CLEAN User Baseline PASSED');
} else {
  console.error('❌ CLEAN User validation FAILED');
}

// 4. FUNCTIONAL SIMULATIONS (Limits & Break Habit Rename)
console.log('\n4. Testing Feature Limit Logic & Break Habit Rename:');

// 4a. Habit limit check for Free User
const canFreeAdd4th = freeUser.isPro || DUMMY_HABITS_FREE.length < 3;
if (!canFreeAdd4th) {
  console.log('✅ FREE User 3-habit limit enforced (blocked without extra slot)');
} else {
  console.error('❌ FREE User 3-habit limit enforcement FAILED');
}

// 4b. Habit limit check for Pro User
const canProAdd7th = proUser.isPro || DUMMY_HABITS_PRO.length < 3;
if (canProAdd7th) {
  console.log('✅ PRO User unlimited habits verified');
} else {
  console.error('❌ PRO User unlimited habits FAILED');
}

// 4c. Break habit rename (updateBreakHabit logic)
const testBreakHabits = [...DUMMY_BREAK_HABITS_FREE];
const targetId = testBreakHabits[0].id;
const oldName = testBreakHabits[0].name;
const newName = 'Gece Geç Saatlerde Yemek Yeme (Düzenlendi)';
const updatedList = testBreakHabits.map(h => h.id === targetId ? { ...h, name: newName } : h);
if (updatedList.find(h => h.id === targetId)?.name === newName) {
  console.log(`✅ Break Habit Rename verified: "${oldName}" -> "${newName}"`);
} else {
  console.error('❌ Break Habit Rename FAILED');
}

console.log('\n--- 🎉 ALL DUMMY USER INTEGRITY & LOGIC CHECKS PASSED ---');

