function generateServiceWorker(req, res, next, {config, generateRoutes, appVersion, appendFn, assetHelper, renderServiceWorker}) {
  return new Promise(resolve => {
    renderServiceWorker(res, "js/service-worker", {
      serviceWorkerHelper: assetHelper.serviceWorkerContents(),
      assetPath: assetHelper.assetPath,
      hostname: req.hostname,
      assetHash: assetHelper.assetHash,
      routes: generateRoutes(config).filter(route => !route.skipPWA),
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
