async function generateServiceWorker(
  req,
  res,
  next,
  {
    config,
    generateRoutes,
    appendFn,
    assetHelper,
    renderServiceWorker,
    domainSlug,
    maxConfigVersion,
  }
) {
  const configVersion = await maxConfigVersion(config);

  return new Promise((resolve) => {
    renderServiceWorker(
      res,
      "js/service-worker",
      {
        config,
        serviceWorkerHelper: assetHelper.serviceWorkerContents(),
        assetPath: assetHelper.assetPath,
        hostname: req.hostname,
        assetHash: assetHelper.assetHash,
        configVersion,
        getFilesForChunks: assetHelper.getFilesForChunks,
        routes: generateRoutes(config, domainSlug).filter(
          (route) => !route.skipPWA
        ),
      },
      (err, content) => {
        // istanbul ignore if
        if (err) {
          console.error(err);
          res.status(500).end();
        } else {
          res
            .status(200)
            .header("Content-Type", "application/javascript")
            .header("Cache-Control", "public,max-age=300")
            .header("Vary", "Accept-Encoding")
            .header("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
            .header(
              "Cache-Tag",
              `s/${config["publisher-id"]}/service-worker s/${config["publisher-id"]}/config`
            )
            .write(content);
          if (appendFn) appendFn(res);
          res.end();
        }
        resolve();
      }
    );
  });
}

exports.generateServiceWorker = generateServiceWorker;
