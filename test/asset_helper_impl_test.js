var assert = require('assert');

const { AssetHelperImpl } = require("../server/impl/asset-helper-impl")

describe('AssetHelperImpl', function() {
  describe('assetPath', function() {
    const {assetPath} = new AssetHelperImpl({asset_host: "//my-cdn"},
                                            {"app.js": "/toddy/assets/app-03e7de595a129bb1ce20.js"})

    it("returns the asset path of known assets", function() {
      assert.equal("//my-cdn/toddy/assets/app-03e7de595a129bb1ce20.js", assetPath("app.js"));
    });

    it("returns nil for unknown assets", function() {
      assert.equal(null, assetPath("unknown.js"));
    })
  });

  describe("readAsset", function() {
    const {readAsset, serviceWorkerContents} = new AssetHelperImpl({asset_host: "//my-cdn"},
                                            {"app.js": "/app.js",
                                             "serviceWorkerHelper.js": "/serviceWorkerHelper.js"},
                                            {readFileSync: path => `Contents of ${path}`})

    it("can read assets from the disk", function() {
      assert.equal("Contents of public/app.js", readAsset("app.js"));
    })

    it("can read assets from the disk", function() {
      assert.equal("Contents of public/serviceWorkerHelper.js", serviceWorkerContents());
      assert.equal("Contents of public/serviceWorkerHelper.js", serviceWorkerContents());
    })
  });

  describe("get asset hash", function() {
    const {assetHash} = new AssetHelperImpl({asset_host: "//my-cdn"},
                                            {"app.js": "/toddy/assets/app-03e7de595a129bb1ce20.js",
                                             "dev.js": "/toddy/assets/dev.js"})

    it("returns null if the asset is not found", function() {
      assert.equal(null, assetHash("unknown.js"));
    })

    it("gets the asset hash for a particular asset", function() {
      assert.equal("03e7de595a129bb1ce20", assetHash("app.js"));
    })

    it("returns 1 if the asset has no hash", function() {
      assert.equal('1', assetHash("dev.js"));
    })
  })
});
