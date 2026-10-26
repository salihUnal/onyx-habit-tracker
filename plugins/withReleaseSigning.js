// Release imza ayarını her `expo prebuild` sonrası android/app/build.gradle'a ekler.
// android/ klasörü git'te tutulmadığı ve yeniden üretildiği için imza ayarı elle yazılamaz.
// Şifre ve keystore yolu repoda değil, GRADLE_USER_HOME/gradle.properties içindedir:
//   MYAPP_UPLOAD_STORE_FILE, MYAPP_UPLOAD_KEY_ALIAS, MYAPP_UPLOAD_STORE_PASSWORD, MYAPP_UPLOAD_KEY_PASSWORD
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// onyx-release-signing';

const RELEASE_SIGNING_CONFIG = `
        release { ${MARKER}
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }`;

const addReleaseSigning = (gradle) => {
  if (gradle.includes(MARKER)) return gradle;

  const debugSigningPattern = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/;
  if (!debugSigningPattern.test(gradle)) {
    throw new Error('withReleaseSigning: signingConfigs.debug bloğu bulunamadı, Expo şablonu değişmiş olabilir.');
  }
  let result = gradle.replace(debugSigningPattern, `$1${RELEASE_SIGNING_CONFIG}`);

  // Release build tipinde debug imzası yerine upload anahtarını kullan
  const releaseBuildTypePattern = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
  if (!releaseBuildTypePattern.test(result)) {
    throw new Error('withReleaseSigning: release buildType içinde signingConfig satırı bulunamadı.');
  }
  result = result.replace(
    releaseBuildTypePattern,
    "$1signingConfig project.hasProperty('MYAPP_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug"
  );
  return result;
};

const withReleaseSigning = (config) =>
  withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = addReleaseSigning(cfg.modResults.contents);
    return cfg;
  });

module.exports = withReleaseSigning;
