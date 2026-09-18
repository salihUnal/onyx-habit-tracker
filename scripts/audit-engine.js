// scripts/audit-engine.js
// Onyx Habit Tracker - Comprehensive Multi-Agent Audit Engine
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('=====================================================');
console.log('🔍 ONYX HABIT TRACKER - FULL SYSTEM AUDIT RUNNING...');
console.log('=====================================================\n');

const report = {
  timestamp: new Date().toISOString(),
  i18n: { missingKeys: {}, totalLanguages: 0, totalKeysEn: 0 },
  screens: [],
  contexts: [],
  dummyUsers: { valid: true, issues: [] },
  responsive: [],
  pixelAndTheme: []
};

// 1. AUDIT I18N TRANSLATIONS
try {
  const translationsPath = path.join(SRC_DIR, 'i18n', 'translations.js');
  const translationsContent = fs.readFileSync(translationsPath, 'utf8');

  const languages = ['en', 'tr', 'es', 'de', 'it', 'ru', 'zh'];
  report.i18n.totalLanguages = languages.length;

  const sandbox = { module: {}, exports: {} };
  const cleanCode = translationsContent
    .replace(/export\s+default\s+translations;/g, 'module.exports = translations;')
    .replace(/export\s+const\s+(\w+)\s*=/g, 'const $1 =');

  try {
    const fn = new Function('module', 'exports', cleanCode);
    fn(sandbox.module, sandbox.exports);
    const trans = sandbox.module.exports || sandbox.exports;

    if (trans && trans.en) {
      const enKeys = Object.keys(trans.en);
      report.i18n.totalKeysEn = enKeys.length;

      languages.forEach(lang => {
        if (!trans[lang]) {
          report.i18n.missingKeys[lang] = ['TÜM DİL PAKETİ EKSİK'];
          return;
        }
        const langKeys = new Set(Object.keys(trans[lang]));
        const missing = enKeys.filter(k => !langKeys.has(k));
        if (missing.length > 0) {
          report.i18n.missingKeys[lang] = missing;
        }
      });
    }
  } catch (e) {
    report.i18n.parseError = e.message;
  }
} catch (err) {
  report.i18n.error = err.message;
}

// 2. AUDIT DUMMY USERS AND HABITS
try {
  const dummyDataPath = path.join(SRC_DIR, 'constants', 'dummyData.js');
  const dummyContent = fs.readFileSync(dummyDataPath, 'utf8');
  
  if (!dummyContent.includes('FREE:') || !dummyContent.includes('PRO:') || !dummyContent.includes('CLEAN:')) {
    report.dummyUsers.issues.push('DUMMY_USERS içinde FREE, PRO veya CLEAN eksik.');
  }
  if (!dummyContent.includes('DUMMY_HABITS_FREE')) {
    report.dummyUsers.issues.push('DUMMY_HABITS_FREE eksik.');
  }
  if (!dummyContent.includes('DUMMY_HABITS_PRO')) {
    report.dummyUsers.issues.push('DUMMY_HABITS_PRO eksik.');
  }
  if (report.dummyUsers.issues.length > 0) {
    report.dummyUsers.valid = false;
  }
} catch (err) {
  report.dummyUsers.error = err.message;
}

// 3. AUDIT ALL 12 SCREENS (RESPONSIVE, KEYBOARD, SAFE AREA, THEME)
const screensDir = path.join(SRC_DIR, 'screens');

function scanDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const screenFiles = scanDir(screensDir);

screenFiles.forEach(filePath => {
  const relPath = path.relative(ROOT_DIR, filePath);
  const code = fs.readFileSync(filePath, 'utf8');
  const screenName = path.basename(filePath);

  const screenAudit = {
    screen: screenName,
    path: relPath,
    hasSafeArea: code.includes('SafeAreaView') || code.includes('useSafeAreaInsets'),
    hasKeyboardAvoiding: code.includes('KeyboardAvoidingView'),
    hasTextInput: code.includes('<TextInput'),
    hasScrollView: code.includes('ScrollView') || code.includes('FlatList'),
    usesTheme: code.includes('useTheme') || code.includes('ThemeContext'),
    hardcodedColors: [],
    hardcodedFixedDimensions: []
  };

  if (screenAudit.hasTextInput && !screenAudit.hasKeyboardAvoiding && !screenAudit.hasScrollView) {
    report.responsive.push({
      screen: screenName,
      issue: 'TextInput bulunuyor ancak KeyboardAvoidingView veya ScrollView kullanılmamış. Küçük ekranlarda klavye inputu kapatabilir.'
    });
  }

  if (!screenAudit.hasSafeArea && !screenName.includes('Modal')) {
    report.responsive.push({
      screen: screenName,
      issue: 'SafeAreaView veya useSafeAreaInsets doğrudan kullanılmamış. Çentik ve durum çubuğu taşması riski var.'
    });
  }

  const fixedWidthMatch = code.match(/width:\s*([3-9]\d\d|1\d\d\d)/g);
  if (fixedWidthMatch) {
    screenAudit.hardcodedFixedDimensions = fixedWidthMatch;
    report.pixelAndTheme.push({
      screen: screenName,
      issue: `Sabit piksel genişliği tespit edildi (${fixedWidthMatch.join(', ')}). Küçük ekranlarda (iPhone SE / 375px) yatay taşmaya sebep olabilir.`
    });
  }

  const hardcodedColorMatches = code.match(/color:\s*['"]#(fff|ffffff|000|000000)['"]/gi);
  if (hardcodedColorMatches && !code.includes('useTheme')) {
    report.pixelAndTheme.push({
      screen: screenName,
      issue: `Tema kontrolü olmadan hardcoded renk kullanımı: ${hardcodedColorMatches.slice(0, 2).join(', ')}`
    });
  }

  report.screens.push(screenAudit);
});

// 4. AUDIT CONTEXT FUNCTIONS
const contextDir = path.join(SRC_DIR, 'context');
const contextFiles = scanDir(contextDir);
contextFiles.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf8');
  const contextName = path.basename(filePath);
  const functions = code.match(/const\s+(\w+)\s*=\s*(async\s*)?\([^)]*\)\s*=>/g) || [];
  report.contexts.push({
    context: contextName,
    functionCount: functions.length,
    functions: functions.map(f => f.replace(/const\s+/, '').split('=')[0].trim())
  });
});

console.log('Audit completed.');
const outputPath = path.join(ROOT_DIR, 'for AI', 'audit-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log('Report saved to for AI/audit-report.json');
