// scripts/sync-translations.js
const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/i18n/translations.js');
const rawContent = fs.readFileSync(targetPath, 'utf8');

const cleanCode = rawContent.replace('export const translations =', 'const translations =') + '; module.exports = translations;';
const translations = eval(cleanCode);

const en = translations.English;
const tr = translations['Türkçe'];
const baseKeys = Object.keys(en);

console.log('Total English Keys to sync:', baseKeys.length);

const languages = ['German', 'Spanish', 'Italian', 'Russian', 'Chinese'];

// Professional dictionary translations for common Onyx keys
const dictionary = {
  German: {
    homeScreenWidgets: 'Startbildschirm-Widgets',
    selectAvatar: 'Avatar auswählen',
    takePhoto: 'Foto aufnehmen',
    chooseFromGallery: 'Aus Galerie wählen',
    remove: 'Entfernen',
    nameCannotBeEmpty: 'Name darf nicht leer sein',
    habitTrackerFocus: 'Gewohnheiten, Fokus & Streak',
    continueWithGoogle: 'Mit Google fortfahren',
    continueWithEmail: 'Mit E-Mail fortfahren',
    continueWithPhone: 'Mit Telefon fortfahren',
    welcomeBack: 'Willkommen zurück!',
    newUser: 'Neu bei Onyx?',
    loginWithGoogle: 'Mit Google anmelden',
    signupWithGoogle: 'Mit Google registrieren',
    loginWithEmail: 'Mit E-Mail anmelden',
    signupWithEmail: 'Mit E-Mail registrieren',
    loginWithPhone: 'Mit Telefon anmelden',
    signupWithPhone: 'Mit Telefon registrieren',
    newHabit: 'Neue Gewohnheit',
    habitNamePlaceholder: 'z.B. 20 Min. lesen',
    comingSoon: 'Demnächst verfügbar',
    focusTime: 'Fokuszeit',
    categoryDistribution: 'Kategorieverteilung',
    totalMinutes: 'Gesamtminuten',
    unlockToSeeAnalysis: 'Auf PRO upgraden für erweiterte Analysen',
    shareToStory: 'In Story teilen',
    enterMinutes: 'Minuten eingeben',
    unlockOnyxPro: 'Onyx Pro freischalten',
    removeAdsDesc: 'Keine Werbung & unbegrenzte Gewohnheiten',
    upgrade: 'Upgraden',
    streakRescue: 'Streak retten',
    freezeUsed: 'Streak Freeze verwendet',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie'
  },
  Spanish: {
    homeScreenWidgets: 'Widgets de pantalla de inicio',
    selectAvatar: 'Seleccionar avatar',
    takePhoto: 'Tomar foto',
    chooseFromGallery: 'Elegir de la galería',
    remove: 'Eliminar',
    nameCannotBeEmpty: 'El nombre no puede estar vacío',
    habitTrackerFocus: 'Rastreador de hábitos, enfoque y racha',
    continueWithGoogle: 'Continuar con Google',
    continueWithEmail: 'Continuar con correo',
    continueWithPhone: 'Continuar con teléfono',
    welcomeBack: '¡Bienvenido de nuevo!',
    newUser: '¿Nuevo en Onyx?',
    loginWithGoogle: 'Iniciar sesión con Google',
    signupWithGoogle: 'Registrarse con Google',
    loginWithEmail: 'Iniciar sesión con correo',
    signupWithEmail: 'Registrarse con correo',
    loginWithPhone: 'Iniciar sesión con teléfono',
    signupWithPhone: 'Registrarse con teléfono',
    newHabit: 'Nuevo hábito',
    habitNamePlaceholder: 'ej. Leer 20 min',
    comingSoon: 'Próximamente',
    focusTime: 'Tiempo de enfoque',
    categoryDistribution: 'Distribución por categoría',
    totalMinutes: 'minutos totales',
    unlockToSeeAnalysis: 'Actualiza a PRO para análisis avanzados',
    shareToStory: 'Compartir en historia',
    enterMinutes: 'Ingresar minutos',
    unlockOnyxPro: 'Desbloquear Onyx Pro',
    removeAdsDesc: 'Sin anuncios y hábitos ilimitados',
    upgrade: 'Mejorar',
    streakRescue: 'Rescatar racha',
    freezeUsed: 'Congelación de racha usada',
    termsOfService: 'Términos de servicio',
    privacyPolicy: 'Política de privacidad'
  },
  Italian: {
    homeScreenWidgets: 'Widget schermata iniziale',
    selectAvatar: 'Seleziona avatar',
    takePhoto: 'Scatta foto',
    chooseFromGallery: 'Scegli dalla galleria',
    remove: 'Rimuovi',
    nameCannotBeEmpty: 'Il nome non può essere vuoto',
    habitTrackerFocus: 'Tracker di abitudini, focus e serie',
    continueWithGoogle: 'Continua con Google',
    continueWithEmail: 'Continua con email',
    continueWithPhone: 'Continua con telefono',
    welcomeBack: 'Bentornato!',
    newUser: 'Nuovo su Onyx?',
    loginWithGoogle: 'Accedi con Google',
    signupWithGoogle: 'Registrati con Google',
    loginWithEmail: 'Accedi con email',
    signupWithEmail: 'Registrati con email',
    newHabit: 'Nuova abitudine',
    enterMinutes: 'Inserisci minuti',
    unlockOnyxPro: 'Sblocca Onyx Pro',
    removeAdsDesc: 'Nessuna pubblicità e abitudini illimitate',
    upgrade: 'Aggiorna',
    termsOfService: 'Termini di servizio',
    privacyPolicy: 'Informativa sulla privacy'
  },
  Russian: {
    homeScreenWidgets: 'Виджеты на главном экране',
    selectAvatar: 'Выбрать аватар',
    takePhoto: 'Сделать фото',
    chooseFromGallery: 'Выбрать из галереи',
    remove: 'Удалить',
    nameCannotBeEmpty: 'Имя не может быть пустым',
    habitTrackerFocus: 'Трекер привычек, фокус и серия',
    continueWithGoogle: 'Продолжить с Google',
    continueWithEmail: 'Продолжить по почте',
    continueWithPhone: 'Продолжить по телефону',
    welcomeBack: 'С возвращением!',
    newUser: 'Впервые в Onyx?',
    loginWithGoogle: 'Войти через Google',
    signupWithGoogle: 'Регистрация через Google',
    loginWithEmail: 'Войти по почте',
    signupWithEmail: 'Регистрация по почте',
    newHabit: 'Новая привычка',
    enterMinutes: 'Введите минуты',
    unlockOnyxPro: 'Разблокировать Onyx Pro',
    removeAdsDesc: 'Без рекламы и без ограничений',
    upgrade: 'Обновить',
    termsOfService: 'Условия использования',
    privacyPolicy: 'Политика конфиденциальности'
  },
  Chinese: {
    homeScreenWidgets: '主屏幕小组件',
    selectAvatar: '选择头像',
    takePhoto: '拍照',
    chooseFromGallery: '从相册选择',
    remove: '删除',
    nameCannotBeEmpty: '名称不能为空',
    habitTrackerFocus: '习惯追踪、专注与连击',
    continueWithGoogle: '使用 Google 继续',
    continueWithEmail: '使用邮箱继续',
    continueWithPhone: '使用手机继续',
    welcomeBack: '欢迎回来！',
    newUser: '初次使用 Onyx？',
    loginWithGoogle: 'Google 登录',
    signupWithGoogle: 'Google 注册',
    loginWithEmail: '邮箱登录',
    signupWithEmail: '邮箱注册',
    newHabit: '新建习惯',
    enterMinutes: '输入分钟数',
    unlockOnyxPro: '解锁 Onyx Pro',
    removeAdsDesc: '无广告且无限制添加习惯',
    upgrade: '立即升级',
    termsOfService: '服务条款',
    privacyPolicy: '隐私政策'
  }
};

languages.forEach(lang => {
  let countFilled = 0;
  baseKeys.forEach(k => {
    if (translations[lang][k] === undefined) {
      // Use dictionary first, then fallback to English
      translations[lang][k] = dictionary[lang]?.[k] || en[k];
      countFilled++;
    }
  });
  console.log(`[${lang}] Filled ${countFilled} missing keys.`);
});

// Output new translations file
const outputCode = 'export const translations = ' + JSON.stringify(translations, null, 2) + ';\n';
fs.writeFileSync(targetPath, outputCode, 'utf8');
console.log('✅ translations.js successfully synced and updated with 100% key coverage!');
