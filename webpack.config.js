const path = require("path");
const baseConfig = {
  entry: "/Users/athira/qt/quintype-node-framework/test/data/test-component.js",
  target: "node",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: { extensions: [".js"] },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  plugins: [],
};

module.exports = () => {
  return baseConfig;
};
