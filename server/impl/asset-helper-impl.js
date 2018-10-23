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
    const regex = RegExp(`vendors~${chunk}.*`);
    const dependantAssets = Object.keys(this.assets).filter(asset => regex.test(asset)).map(asset => this.assetPath(asset));
    return {
      cssPath: this.assetPath(`${chunk}.css`),
      cssContent: this.readAsset(`${chunk}.css`),
      jsPaths: [this.assetPath(`${chunk}.js`), ...dependantAssets]
    };
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
