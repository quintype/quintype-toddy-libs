class AssetHelperImpl {
  constructor(config, assets, {readFileSync} = {}) {
    this.config = config;
    this.assets = assets;
    this.readFileSync = readFileSync || require("fs").readFileSync;

    this.assetPath = this.assetPath.bind(this);
    this.readAsset = this.readAsset.bind(this);
    this.assetHash = this.assetHash.bind(this)
  }

  assetPath(asset) {
    const path = this.assets[asset];
    if (path) {
      return [this.config.asset_host, path].join("");
    }
  }

  readAsset(asset) {
    return this.readFileSync("public" + this.assets[asset]);
  }

  assetHash(asset) {
    const path = this.assets[asset];
    if(path) {
      const match = /\-([0-9a-fA-F]+)\./.exec(path);
      return match && match[1];
    }
  }
}

exports.AssetHelperImpl = AssetHelperImpl;
