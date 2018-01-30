var assert = require('assert');

const assetify = require("../../assetify")
const { AssetHelperImpl } = require("../../server/impl/asset-helper-impl");

describe('assetify', function() {
  const assetHelper = new AssetHelperImpl({asset_host: "//my-cdn"},
                                          {"app.js": "/toddy/assets/app-03e7de595a129bb1ce20.js"})

  require("../../assetify/server")(assetHelper)

  it("returns the asset path", function() {
    assert.equal("//my-cdn/toddy/assets/app-03e7de595a129bb1ce20.js", assetify("app.js"));
  })
});
