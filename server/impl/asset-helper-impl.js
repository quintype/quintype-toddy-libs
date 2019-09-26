/**
 * This namespace exposes a single instance of {@link module:asset-helper~AssetHelper AssetHelper}
 * @category Server
 * @module asset-helper
 */

const flatMap = require('lodash/flatMap');
const uniq = require('lodash/uniq');

/**
 * Chunk represents a set of CSS and JS files that have been created due to webpack code splitting.
 * @typedef Chunk
 * @property {Array<string>} jsPaths A list of JS files
 * @property {Array<module:asset-helper~CssFile>} cssFiles The CSS files
 */

/**
* @typedef CssFile
* @property {string} path The path to the css file
* @property {string} content The contents of the file
*/

/**
 * AssetHelper can be used to get paths and contents of various assets, including CSS and client JS.
 * Do note that when reading files from disk, AssetHelper uses `readFileSync`, but then memoizes the result so that
 * future requests are much faster.
 *
 * You cannot use this class directly, but can access it's member functions as if they were static
 *
 * ```javascript
 * import { assetPath } from "@quintype/framework/server/asset-helper";
 * ```
 * @hideconstructor
 */
class AssetHelper {
  constructor(config, assets, {readFileSync} = {}) {
    this.config = config;
    this.assets = assets;
    this.readFileSync = readFileSync || require("fs").readFileSync;
    this.assetsContent = {};

    this.assetPath = this.assetPath.bind(this);
    this.readAsset = this.readAsset.bind(this);
    this.assetHash = this.assetHash.bind(this);
    this.assetFiles = this.assetFiles.bind(this);
    this.getChunk = this.getChunk.bind(this);
    this.getAllChunks = this.getAllChunks.bind(this);
    this.getFilesForChunks = this.getFilesForChunks.bind(this);
    this.serviceWorkerContents = this.serviceWorkerContents.bind(this);
    this.warmupAssetCache = this.warmupAssetCache.bind(this);
  }

  /**
   * Get tha path to an asset
   * @param {string} asset The asset name (ex: *"app.js"*)
   * @param {string} host The asset host (optional, this defaults to values from *publisher.yml*)
   * @returns {string} Fully Qualified URL of the asset
   */
  assetPath(asset, host = this.config.asset_host) {
    const path = this.assets[asset];
    if (path) {
      return [host, path].join("");
    }
  }

  /**
   * Return the contents of an asset as a string. This function will memoize the disk read, so that this
   * function is much faster the next time.
   * @param {string} asset The asset name (ex: *"app.js"*)
   * @returns {string} The content of the asset
   */
  readAsset(asset) {
    const path = this.assets[asset];

    if(!path) {
      return undefined;
    }

    if(!this.assetsContent[path]) {
      this.assetsContent[path] = this.readFileSync(`public${  path}`);
    }

    return this.assetsContent[path];
  }

  /**
   * Read the given chunks into memory. This is a synonym for {@link getAllChunks}
   * @param {...string} chunks The list of chunks
   * @returns {void}
   */
  warmupAssetCache() {
    this.getAllChunks.apply(this, arguments);
  }

  /**
   * Loads a chunk into memory, usually so that it can be embedded onto the page
   * @param {string} chunk The name of the chunk to be fetched (ex: *"list"*)
   * @return {module:asset-helper~Chunk} The loaded chunk
   */
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

  /**
   * Read the given chunks into memory. This is a synonym for {@link warmupAssetCache}
   * @param {...string} chunks The list of chunks
   * @returns {Array<module:asset-helper~Chunk>}
   */
  getAllChunks() {
    return Array.from(arguments).reduce((acc, arg) => {
      acc[arg] = this.getChunk(arg);
      return acc;
    }, {});
  }

  /**
   * Get a list of all JS and CSS files needed for a set of chunks
   * @param {...string} chunks The list of chunks
   * @return {Array<string>} Unique list of JS and CSS files for a set of chunks
   */
  getFilesForChunks() {
    const chunks = this.getAllChunks.apply(this, arguments);
    return uniq(flatMap(Object.values(chunks), ({ cssFiles, jsPaths }) => jsPaths.concat(cssFiles.map(x => x.path))));
  }

  /**
   * Get the contents of the service worker.
   * @returns {string} Service Worker Contents
   */
  serviceWorkerContents() {
    this._serviceWorkerContents = this._serviceWorkerContents || this.readAsset("serviceWorkerHelper.js");
    return this._serviceWorkerContents;
  }

  /**
   * Get the fingerprint that the asset was assigned during compilation phase.
   * @param {string} asset The asset name
   * @returns {string} The asset fingerprint
   */
  assetHash(asset) {
    const path = this.assets[asset];
    if(path) {
      const match = /\-([0-9a-fA-F]+)\./.exec(path);
      return match ? match[1] : '1';
    }
  }

  /**
   * Return a set of all assets
   * @returns {Set<string>} A list of all assets
   */
  assetFiles() {
    return new Set(Object.values(this.assets));
  }
}

exports.AssetHelper = AssetHelper;
