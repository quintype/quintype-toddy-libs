// istanbul ignore file

const urlLib = require("url");
const {setAssetifyFn} = require("../assetify");

function getAssetCdn() {
  const script = global.document.getElementById("app-js");
  if(script && script.src)
    return urlLib.parse(script.src).host;
}

const assetCdn = `//${getAssetCdn() || "fea.assettype.com"}`;

function appendCDN(path) {
  if(path.startsWith("/"))
    return `${assetCdn}${path}`;
  else
    return path;
}

module.exports = function() {
  setAssetifyFn(appendCDN);
}
