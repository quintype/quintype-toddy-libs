// istanbul ignore file
// the jsdoc for this file is found in asset-helper-impl

const { AssetHelper } = require("./impl/asset-helper-impl");
const fs = require("fs");

module.exports = new AssetHelper(require("./publisher-config"), JSON.parse(fs.readFileSync("asset-manifest.json")))
