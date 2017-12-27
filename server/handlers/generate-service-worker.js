const {assetPath, readAsset} = require("../asset-helper");
const serviceWorkerContents = readAsset("serviceWorkerHelper.js");

function generateServiceWorker(req, res, {config, generateRoutes}) {
  res.header("Content-Type", "application/javascript");
  res.header("Cache-Control", "public,max-age=300");
  res.header("Vary", "Accept-Encoding");
  res.render("js/service-worker", {
    routes: generateRoutes(config).filter(route => !route.skipPWA),
    serviceWorkerHelper: serviceWorkerContents,
    assetPath: assetPath,
    hostname: req.hostname,
  });
  return Promise.resolve();
}

exports.generateServiceWorker = generateServiceWorker;
