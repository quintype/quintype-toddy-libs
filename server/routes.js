const {generateServiceWorker} = require("./handlers/generate-service-worker");
const {handleIsomorphicShell, handleIsomorphicDataLoad, handleIsomorphicRoute, handleStaticRoute} = require("./handlers/isomorphic-handler");
const {oneSignalImport} = require("./handlers/one-signal");

exports.upstreamQuintypeRoutes = function upstreamQuintypeRoutes(app, {forwardAmp, config} = {}) {
  config = config || require("./publisher-config");
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
}

exports.isomorphicRoutes = function isomorphicRoutes(app,
                                                     {generateRoutes = () => [],
                                                      logError = (err) => console.error(err),
                                                      renderLayout = (res) => res.end(),
                                                      loadData = () => Promise.resolve({}),
                                                      pickComponent = () => [],
                                                      loadErrorData = () => Promise.resolve({}),
                                                      seo = null,
                                                      oneSignalServiceWorkers = false,
                                                      staticRoutes = [],
                                                      appVersion = 1,
                                                      assetHelper = require("./asset-helper"),
                                                      withConfig = require("./with-config"),
                                                      renderServiceWorker = (res, layout, params, callback) => res.render(layout, params, callback)
                                                    }) {
  app.get("/service-worker.js", withConfig(logError, generateServiceWorker, {generateRoutes, appVersion, assetHelper, renderServiceWorker}));

  if(oneSignalServiceWorkers) {
    app.get("/OneSignalSDKWorker.js", withConfig(logError, generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
    app.get("/OneSignalSDKUpdaterWorker.js", withConfig(logError, generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
  }

  app.get("/shell.html", withConfig(logError, handleIsomorphicShell, {renderLayout, assetHelper}));
  app.get("/route-data.json", withConfig(logError, handleIsomorphicDataLoad, {generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}));

  staticRoutes.forEach(route => {
    app.get(route.path, withConfig(logError, handleStaticRoute, Object.assign({logError, loadData, loadErrorData, renderLayout, seo}, route)))
  });

  app.get("/*", withConfig(logError, handleIsomorphicRoute, {generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError}));
}
