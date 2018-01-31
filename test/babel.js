const ROOT_PATH = require("path").resolve(__dirname, '..');

require("babel-register")({
  presets: ["react"],
  plugins: [
    "transform-es2015-modules-commonjs",
    "quintype-assets",
  ],
  ignore(file) {
    if (file.startsWith(ROOT_PATH + '/node_modules/@quintype/components/store')) {
      return false;
    }
    return file.startsWith(ROOT_PATH + '/node_modules');
  }
});
