function generateServiceWorker(req, res, next, {config, generateRoutes, appendFn, assetHelper, renderServiceWorker, domainSlug, pbConfigVersion}) {
  const {'theme-attributes': {'cache-burst': cacheBurst = 0 } = {}} = config || {};
  const maxConfigVersion = Math.max(cacheBurst, pbConfigVersion);
  
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
          .header('Cache-Tag', 'pb/97/shell')
          .write(content);
        if(appendFn) appendFn(res);
        res.end();
      }
      resolve();
    });
  })
}

exports.generateServiceWorker = generateServiceWorker;
