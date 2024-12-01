module.exports = function (api) {
  api.cache(true);
  return {
    "presets": ["module:metro-react-native-babel-preset"],

    presets: [["babel-preset-expo", {
      jsxImportSource: "nativewind"
    }], "nativewind/babel"],
    plugins: [["module-resolver", {
      root: ["./"],

      alias: {
        "@": "./"
      }
    }]],
  };
};
