// istanbul ignore file

const { AssetHelperImpl } = require("./impl/asset-helper-impl");
const fs = require("fs");

module.exports = new AssetHelperImpl(require("./publisher-config"), JSON.parse(fs.readFileSync("asset-manifest.json")));
