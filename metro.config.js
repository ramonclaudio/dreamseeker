const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports for Better Auth
config.resolver.unstable_enablePackageExports = true;

// Production optimizations
config.transformer.minifierConfig = {
  compress: {
    // Remove console logs in production
    drop_console: ['log', 'info'],
  },
};

// Enable inline requires for faster startup (safe with tree shaking)
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

module.exports = withNativewind(config);
