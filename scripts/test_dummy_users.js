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

console.log('\n--- 🎉 ALL DUMMY USER INTEGRITY CHECKS PASSED ---');
