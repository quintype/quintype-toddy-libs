const rp = require("request-promise");

async function getPbConfig() {
  return await rp(`https://pagebuilder.staging.quintype.com/api/v1/accounts/97/config`, {json: true}, function(
    error,
    response,
    body
  ) {
    return body;
  });
}

async function generateServiceWorker(req, res, next, {config, generateRoutes, appVersion, appendFn, assetHelper, renderServiceWorker, domainSlug}) {
  const {'theme-attributes': {'cache-burst': cacheBurst = 0 } = {}} = config || {};
  const {config: {configVersion:pbConfigVersion = 0}} = await getPbConfig();
  const maxConfigVersion = Math.max(cacheBurst, pbConfigVersion);

  console.log('maxConfigVersion -------->', maxConfigVersion);
  return new Promise(resolve => {
    renderServiceWorker(res, "js/service-worker", {
      config,
      serviceWorkerHelper: assetHelper.serviceWorkerContents(),
      assetPath: assetHelper.assetPath,
      hostname: req.hostname,
      assetHash: assetHelper.assetHash,
      configVersion: maxConfigVersion,
      getFilesForChunks: assetHelper.getFilesForChunks,
      routes: generateRoutes(config, domainSlug).filter(route => !route.skipPWA)
    }, (err, content) => {
      // istanbul ignore if
      if(err) {
        console.error(err);
        res.status(500).end();
      } else {
        res.status(200)
          .header("Content-Type", "application/javascript")
          .header("Cache-Control", "public,max-age=300")
          .header("Vary", "Accept-Encoding")
          .write(content);
        if(appendFn) appendFn(res);
        res.end();
      }
      resolve();
    });
  })
}

exports.generateServiceWorker = generateServiceWorker;
