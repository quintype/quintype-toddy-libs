const {generateServiceWorker} = require("./handlers/generate-service-worker");
const {handleIsomorphicShell, handleIsomorphicDataLoad, handleIsomorphicRoute, handleStaticRoute, notFoundHandler} = require("./handlers/isomorphic-handler");
const {oneSignalImport} = require("./handlers/one-signal");
const {handleManifest} = require("./handlers/manifest");
const {redirectStory} = require("./handlers/story-redirect");
const {simpleJsonHandler} = require("./handlers/simple-json-handler");

exports.upstreamQuintypeRoutes = function upstreamQuintypeRoutes(app,
                                                                 {forwardAmp = false,
                                                                  forwardFavicon = false,
                                                                  config = require("./publisher-config"),
                                                                  getClient = require("./api-client").getClient} = {}) {
  const host = config.sketches_host;
  const apiProxy = require("http-proxy").createProxyServer({
    target: host,
    ssl: host.startsWith("https") ? {servername: host.replace(/^https:\/\//, "")} : undefined
  });

  apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Host', getClient(req.hostname).getHostname());
  });

  const sketchesProxy = (req, res) => apiProxy.web(req, res);

  app.get("/ping", function(req, res) {
    getClient(req.hostname)
    .getConfig()
    .then(() => res.send("pong"))
    .catch(() =>
      res
      .status(503)
      .send({error: {message: "Config not loaded"}})
    );
  });

  app.all("/api/*", sketchesProxy);
  app.all("/login", sketchesProxy);
  app.all("/qlitics.js", sketchesProxy);
  app.all("/auth.form", sketchesProxy);
  app.all("/auth.callback", sketchesProxy);
  app.all("/auth", sketchesProxy);
  app.all("/admin/*", sketchesProxy);
  app.all("/sitemap.xml", sketchesProxy);
  app.all("/sitemap/*", sketchesProxy);
  app.all("/feed", sketchesProxy);
  app.all("/rss-feed", sketchesProxy);
  app.all("/stories.rss", sketchesProxy);
  app.all("/news_sitemap.xml", sketchesProxy);

  if(forwardAmp) {
    app.get("/amp/*", sketchesProxy);
  }
  if(forwardFavicon) {
    app.get("/favicon.ico", sketchesProxy);
  }
}

// istanbul ignore next
function renderServiceWorkerFn(res, layout, params, callback) {
  return res.render(layout, params, callback);
}

// istanbul ignore next
function toFunction(value, toRequire) {
  if(value === true) {
    value = require(toRequire);
  }

  if (typeof(value) == 'function') {
    return value;
  } else {
    return () => value;
  }
}

exports.isomorphicRoutes = function isomorphicRoutes(app,
                                                     {generateRoutes,
                                                      renderLayout,
                                                      loadData,
                                                      pickComponent,
                                                      loadErrorData,
                                                      seo,
                                                      manifestFn,

                                                      logError = require("./logger").error,
                                                      oneSignalServiceWorkers = false,
                                                      staticRoutes = [],
                                                      customStaticRoute,
                                                      appVersion = 1,
                                                      preloadJs = false,
                                                      preloadRouteData = false,
                                                      handleNotFound = true,
                                                      redirectRootLevelStories = false,

                                                      // The below are primarily for testing
                                                      assetHelper = require("./asset-helper"),
                                                      getClient = require("./api-client").getClient,
                                                      renderServiceWorker = renderServiceWorkerFn,
                                                      templateOptions = false,
                                                    }) {
  function withConfig(f, staticParams) {
    return function(req, res, next) {
      const client = getClient(req.hostname);
      return client.getConfig()
        .then(c => f(req, res, next, Object.assign({}, staticParams, {config: c, client: client})))
        .catch(logError);
    }
  }

  app.get("/service-worker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, assetHelper, renderServiceWorker}));

  if(oneSignalServiceWorkers) {
    app.get("/OneSignalSDKWorker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
    app.get("/OneSignalSDKUpdaterWorker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
  }

  app.get("/shell.html", withConfig(handleIsomorphicShell, {renderLayout, assetHelper, loadData, loadErrorData, logError, preloadJs}));
  app.get("/route-data.json", withConfig(handleIsomorphicDataLoad, {generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}));

  if(manifestFn) {
    app.get("/manifest.json", withConfig(handleManifest, {manifestFn, logError}))
  }

  if(templateOptions) {
    app.get('/template-options.json', withConfig(simpleJsonHandler, {jsonData: toFunction(templateOptions, "./template-options")}))
  }

  // staticRoutes.forEach(route => {
  //   app.get(route.path, withConfig(handleStaticRoute, Object.assign({logError, loadData, loadErrorData, renderLayout, seo}, route)))
  // });

  app.get("/*", withConfig(handleIsomorphicRoute, {generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError, preloadJs, preloadRouteData, assetHelper}));

  if(redirectRootLevelStories) {
    app.get("/:storySlug", withConfig(redirectStory, {logError}));
  }

  app.get(customStaticRoute.path, withConfig(handleStaticRoute, Object.assign({logError, loadData, loadErrorData, renderLayout, seo}, customStaticRoute)))

  if(handleNotFound) {
    app.get("/*", withConfig(notFoundHandler, {renderLayout, pickComponent, loadErrorData, logError, assetHelper}));
  }
}
