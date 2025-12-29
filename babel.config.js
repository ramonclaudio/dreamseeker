module.exports = function (api) {
  const platform = api.caller((caller) => (caller ? caller.platform : 'ios'));
  api.cache.invalidate(() => platform);

  return {
    presets: ['babel-preset-expo'],
  };
};
