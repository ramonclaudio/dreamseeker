const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Config plugin to enable automatic code signing for iOS device builds.
 * This is required because prebuild --clean regenerates the Xcode project
 * with manual signing, causing device builds to fail.
 */
const withAutoSigning = (config) => {
  // Skip on EAS Build — EAS manages code signing with remote credentials
  if (process.env.EAS_BUILD) return config;

  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    // Get the main app target
    const targetName = xcodeProject.getFirstTarget()?.firstTarget?.name;
    if (!targetName) {
      console.warn('[with-auto-signing] Could not find main target');
      return config;
    }

    // Get all build configurations
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();

    for (const key in buildConfigurations) {
      const buildConfig = buildConfigurations[key];

      // Only modify app target configurations (not Pods or other targets)
      if (
        buildConfig.buildSettings &&
        buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER
      ) {
        // Enable automatic signing
        buildConfig.buildSettings.CODE_SIGN_STYLE = 'Automatic';

        // Ensure development team is set
        if (config.ios?.appleTeamId) {
          buildConfig.buildSettings.DEVELOPMENT_TEAM = config.ios.appleTeamId;
        }

        // Remove any manual provisioning profile settings
        delete buildConfig.buildSettings.PROVISIONING_PROFILE;
        delete buildConfig.buildSettings.PROVISIONING_PROFILE_SPECIFIER;
      }
    }

    return config;
  });
};

module.exports = withAutoSigning;
