"use strict";

module.exports = function(api) {
  const env = api.env();
  let envOptions = {};
  let plugins = [];
  
  if (env === 'test') {
    envOptions = {"targets": {"node": true}};
    plugins.push("babel-plugin-quintype-assets");
  }

  let config = {
    presets: [
      "@babel/preset-react",
      [
        "@babel/preset-env", 
        envOptions
      ],
    ],
    plugins: plugins
  };
  
  return config;
}