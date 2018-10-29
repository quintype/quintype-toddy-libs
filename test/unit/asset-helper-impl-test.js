var assert = require('assert');

const { AssetHelperImpl } = require("../../server/impl/asset-helper-impl")

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

    it("overwrites asset path", function() {
      assert.equal("/toddy/assets/app-03e7de595a129bb1ce20.js", assetPath("app.js", ''))
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

    it("returns undefined for any file that doesn't exist", function() {
      assert.equal(undefined, readAsset("unknown.js"));
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

  describe("get all asset files", function() {
    const {assetFiles} = new AssetHelperImpl({asset_host: "//my-cdn"},
                                             {"app.js": "/toddy/assets/app-03e7de595a129bb1ce20.js",
                                              "dev.js": "/toddy/assets/dev.js"});

    it("returns a set of all files", function() {
      const files = assetFiles();
      assert.equal(true, files.has("/toddy/assets/app-03e7de595a129bb1ce20.js"));
      assert.equal(false, files.has("app.js"));
    });
  })

  describe("get files for a chunk", function() {
    const {getChunk, getAllChunks, getFilesForChunks} = new AssetHelperImpl(
      {asset_host: "//my-cdn"},
      {
        "list.css": "/toddy/assets/list-abcd.css",
        "story.css": "/toddy/assets/story-abcd.css",
        "list.js": "/toddy/assets/list-abcd.js",
        "list.js.map": "/toddy/assets/list-abcd.js.map",
        "story.js": "/toddy/assets/story-abcd.js",
        "vendors~list.js": "/toddy/assets/vendors~list-abcd.js",
        "vendors~list~story.js": "/toddy/assets/vendors~list~story-abcd.js",
        "vendors~story~list.js": "/toddy/assets/vendors~story~list-abcd.js",
        "vendors~list.js.map": "/toddy/assets/vendors~list-abcd.js.map",
        "vendors~story.js": "/toddy/assets/vendors~story-abcd.js",
        "list~story.js": "/toddy/assets/list~story-abcd.js",
        "list~story.css": "/toddy/assets/list~story-abcd.css",
      },
      {readFileSync: path => `Contents of ${path}`});

    it("has a css-path and css-content", function() {
      const chunk = getChunk('list');
      assert.equal('//my-cdn/toddy/assets/list-abcd.css', chunk.cssFiles[0].path);
      assert.equal('Contents of public/toddy/assets/list-abcd.css', chunk.cssFiles[0].content);
      assert.equal('//my-cdn/toddy/assets/list~story-abcd.css', chunk.cssFiles[1].path);
    })

    it("has js-paths with related dependencies", function() {
      const { jsPaths } = getChunk('list');
      assert.equal(true, jsPaths.includes("//my-cdn/toddy/assets/list-abcd.js"))
      assert.equal(true, jsPaths.includes("//my-cdn/toddy/assets/vendors~list-abcd.js"))
      assert.equal(true, jsPaths.includes("//my-cdn/toddy/assets/vendors~list~story-abcd.js"))
      assert.equal(true, jsPaths.includes("//my-cdn/toddy/assets/vendors~story~list-abcd.js"))
      assert.equal(true, jsPaths.includes("//my-cdn/toddy/assets/list~story-abcd.js"))
      assert.equal(false, jsPaths.includes("//my-cdn/toddy/assets/list-abcd.js.map")) // Map file
      assert.equal(false, jsPaths.includes("//my-cdn/toddy/assets/story-abcd.js")) // different chunk
      assert.equal(false, jsPaths.includes("//my-cdn/toddy/assets/vendors~story-abcd.js")) // different chunk
      assert.equal(false, jsPaths.includes("//my-cdn/toddy/assets/vendors~list-abcd.js.map")) // Map file
      assert.equal(false, jsPaths.includes("//my-cdn/toddy/assets/list-abcd.css")) // not JS
    });

    it("returns all the chunks", function() {
      const {list, story} = getAllChunks('list', 'story');
      assert.equal('//my-cdn/toddy/assets/list-abcd.css', list.cssFiles[0].path);
      assert.equal('//my-cdn/toddy/assets/story-abcd.css', story.cssFiles[0].path);
    })

    it("returns all the assets", function() {
      const files = getFilesForChunks('app', 'list', 'story');
      assert.equal(true, files.includes("//my-cdn/toddy/assets/list-abcd.js"));
      assert.equal(true, files.includes("//my-cdn/toddy/assets/list-abcd.css"));
      assert.equal(true, files.includes("//my-cdn/toddy/assets/story-abcd.js"));
    })
  })
});
