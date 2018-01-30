const {setAssetifyFn} = require("../assetify");

module.exports = function(assetHelper = require("../server/asset-helper")) {
  setAssetifyFn(assetHelper.assetPath)
}
