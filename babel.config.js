module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "react-native-css-interop/babel"],
    plugins: [
      "react-native-worklets-core/plugin",
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@": "./"
        }
      }],
      "react-native-reanimated/plugin"
    ],
  };
};