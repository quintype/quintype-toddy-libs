const flatMap = require('lodash/flatMap');
const uniq = require('lodash/uniq');

class AssetHelperImpl {
  constructor(config, assets, {readFileSync} = {}) {
    this.config = config;
    this.assets = assets;
    this.readFileSync = readFileSync || require("fs").readFileSync;

    this.assetPath = this.assetPath.bind(this);
    this.readAsset = this.readAsset.bind(this);
    this.assetHash = this.assetHash.bind(this);
    this.assetFiles = this.assetFiles.bind(this);
    this.getChunk = this.getChunk.bind(this);
    this.getAllChunks = this.getAllChunks.bind(this);
    this.getFilesForChunks = this.getFilesForChunks.bind(this);
    this.serviceWorkerContents = this.serviceWorkerContents.bind(this);
  }

  assetPath(asset, host = this.config.asset_host) {
    const path = this.assets[asset];
    if (path) {
      return [host, path].join("");
    }
  }

  readAsset(asset) {
    const path = this.assets[asset];
    if (path) {
      return this.readFileSync("public" + path);
    }
  }

  getChunk(chunk) {
    const getDependentFiles = (ext) => {
      const regex = RegExp(`(${chunk}~|~${chunk}).*\.${ext}$`);
      const assets = this.assets[`${chunk}.${ext}`]
        ? [`${chunk}.${ext}`]
        : []

      return assets.concat(Object.keys(this.assets).filter(asset => regex.test(asset)));
    }

    return {
      cssFiles: getDependentFiles('css').map(file => ({
        path: this.assetPath(file),
        content: this.readAsset(file)
      })),
      jsPaths: getDependentFiles('js').map(file => this.assetPath(file))
    };


  }

  getAllChunks() {
    return Array.from(arguments).reduce((acc, arg) => {
      acc[arg] = this.getChunk(arg);
      return acc;
    }, {});
  }

  getFilesForChunks() {
    const chunks = this.getAllChunks.apply(this, arguments);
    return uniq(flatMap(Object.values(chunks), ({ cssFiles, jsPaths }) => jsPaths.concat(cssFiles.map(x => x.path))));
  }

  serviceWorkerContents() {
    this._serviceWorkerContents = this._serviceWorkerContents || this.readAsset("serviceWorkerHelper.js");
    return this._serviceWorkerContents;
  }

  assetHash(asset) {
    const path = this.assets[asset];
    if(path) {
      const match = /\-([0-9a-fA-F]+)\./.exec(path);
      return match ? match[1] : '1';
    }
  }

  assetFiles() {
    return new Set(Object.values(this.assets));
  }
}

exports.AssetHelperImpl = AssetHelperImpl;
