const {assetPath, readAsset} = require("../asset-helper");
const serviceWorkerContents = readAsset("serviceWorkerHelper.js");

function generateServiceWorker(req, res, {config, generateRoutes}) {
  res.header("Content-Type", "application/javascript");
  res.header("Cache-Control", "public,max-age=300");
  res.render("js/service-worker", {
    routes: generateRoutes(config),
    serviceWorkerHelper: serviceWorkerContents,
    assetPath: assetPath
  });
  return Promise.resolve();
}

exports.generateServiceWorker = generateServiceWorker;
