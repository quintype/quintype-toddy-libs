require("@babel/register")({
  presets: [
    "@babel/preset-react",
    ["@babel/preset-env", {"targets": {"node": true}}],
  ],
  plugins: [
    "babel-plugin-quintype-assets",
  ]
});
