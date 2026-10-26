const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs', 'cjs');
// SDK 53+ varsayılan olarak package "exports" kullanıyor; Firebase JS SDK bu modda
// @firebase/auth'u iki kez yükleyip "Component auth has not been registered yet" ile çöküyor.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
