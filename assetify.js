var assetifyFunction

function assetify(path) {
  if(assetifyFunction) {
    return assetifyFunction(path);
  } else {
    throw "No Assetify Function Set! Please require either @quintype/framework/assetify/server or @quintype/framework/assetify/client"
  }
}

assetify.setAssetifyFn = function setAssetifyFn(f) {
  if(assetifyFunction) {
    "Assetify Function Already Set! Please require either @quintype/framework/assetify/server or @quintype/framework/assetify/client"
  } else {
    assetifyFunction = f;
  }
}

module.exports = assetify;
