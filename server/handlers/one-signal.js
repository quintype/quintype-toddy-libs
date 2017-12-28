exports.oneSignalImport = function(res) {
  res.write(`\nimportScripts('https://cdn.onesignal.com/sdks/OneSignalSDK.js');`);
}
