const {generateServiceWorker} = require("./handlers/generate-service-worker");
const {handleIsomorphicShell, handleIsomorphicDataLoad, handleIsomorphicRoute, handleStaticRoute, notFoundHandler } = require("./handlers/isomorphic-handler");
const {oneSignalImport} = require("./handlers/one-signal");
const {customRouteHandler} = require("./handlers/custom-route-handler");
const {handleManifest, handleAssetLink} = require("./handlers/json-manifest-handlers");
const {redirectStory} = require("./handlers/story-redirect");
const {simpleJsonHandler} = require("./handlers/simple-json-handler");
const {makePickComponentSync} = require("../isomorphic/make-pick-component-sync");
const { registerFCMTopic } = require("./handlers/fcm-registration-handler");
const rp = require("request-promise");
const bodyParser = require("body-parser");

exports.upstreamQuintypeRoutes = function upstreamQuintypeRoutes(app,
                                                                 {forwardAmp = false,
                                                                  forwardFavicon = false,
                                                                  config = require("./publisher-config"),
                                                                  extraRoutes = [],
                                                                  getClient = require("./api-client").getClient} = {}) {
  const host = config.sketches_host;
  const apiProxy = require("http-proxy").createProxyServer({
    target: host,
    ssl: host.startsWith("https") ? {servername: host.replace(/^https:\/\//, "")} : undefined
  });

  apiProxy.on('proxyReq', (proxyReq, req, res, options) => {
    proxyReq.setHeader('Host', getClient(req.hostname).getHostname());
  });

  const sketchesProxy = (req, res) => apiProxy.web(req, res);

  app.get("/ping", (req, res) => {
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

  extraRoutes.forEach(route => app.all(route, sketchesProxy));
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

  if (typeof(value) === 'function') {
    return value;
  }
    return () => value;

}

function getDomainSlug(publisherConfig, hostName) {
  if(!publisherConfig.domain_mapping) {
    return undefined;
  }
  return publisherConfig.domain_mapping[hostName] || null;
}

function withConfigPartial(getClient, logError, publisherConfig = require("./publisher-config")) {
  return function withConfig(f, staticParams) {
    return function (req, res, next) {
      const client = getClient(req.hostname);
      return client.getConfig()
        .then(config => f(req, res, next, Object.assign({}, staticParams, { config, client, domainSlug: getDomainSlug(publisherConfig, req.hostname)})))
        .catch(logError);
    }
  }
}

exports.withError = function withError(handler, logError) {
  return async (req, res, next, opts) => {
    try {
      await handler(req, res, next, opts);
    } catch(e) {
      logError(e);
      res.status(500);
      res.end()
    }
  }
}

function wrapLoadDataWithMultiDomain(publisherConfig, f, configPos) {
  return async function loadDataWrapped() {
    const { domainSlug } = arguments[arguments.length - 1];
    const config = arguments[configPos];
    const primaryHostUrl = config['sketches-host'];
    const domain = (config.domains || []).find(d => d.slug === domainSlug) || { 'host-url': primaryHostUrl };
    const result = await f.apply(this, arguments);
    return Object.assign({ domainSlug, currentHostUrl: domain['host-url'], primaryHostUrl }, result);
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
                                                      assetLinkFn,

                                                      logError = require("./logger").error,
                                                      oneSignalServiceWorkers = false,
                                                      staticRoutes = [],
                                                      appVersion = 1,
                                                      preloadJs = false,
                                                      preloadRouteData = false,
                                                      handleCustomRoute = true,
                                                      handleNotFound = true,
                                                      redirectRootLevelStories = false,

                                                      // The below are primarily for testing
                                                      assetHelper = require("./asset-helper"),
                                                      getClient = require("./api-client").getClient,
                                                      renderServiceWorker = renderServiceWorkerFn,
                                                      templateOptions = false,
                                                      publisherConfig = require("./publisher-config"),
                                                    }) {

  const withConfig = withConfigPartial(getClient, logError, publisherConfig);

  pickComponent = makePickComponentSync(pickComponent);
  loadData = wrapLoadDataWithMultiDomain(publisherConfig, loadData, 2);
  loadErrorData = wrapLoadDataWithMultiDomain(publisherConfig, loadErrorData, 1);

  app.get("/service-worker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, assetHelper, renderServiceWorker}));

  if(oneSignalServiceWorkers) {
    app.get("/OneSignalSDKWorker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
    app.get("/OneSignalSDKUpdaterWorker.js", withConfig(generateServiceWorker, {generateRoutes, appVersion, renderServiceWorker, assetHelper, appendFn: oneSignalImport}));
  }

  app.get("/shell.html", withConfig(handleIsomorphicShell, {renderLayout, assetHelper, loadData, loadErrorData, logError, preloadJs}));
  app.get("/route-data.json", withConfig(handleIsomorphicDataLoad, {generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}));

  app.post("/register-fcm-topic", bodyParser.json(), withConfig(registerFCMTopic, {publisherConfig}));


  if(manifestFn) {
    app.get("/manifest.json", withConfig(handleManifest, {manifestFn, logError}))
  }

  if(assetLinkFn) {
    app.get("/.well-known/assetlinks.json", withConfig(handleAssetLink, {assetLinkFn, logError}))
  }

  if(templateOptions) {
    app.get('/template-options.json', withConfig(simpleJsonHandler, {jsonData: toFunction(templateOptions, "./template-options")}))
  }

  staticRoutes.forEach(route => {
    app.get(route.path, withConfig(handleStaticRoute, Object.assign({logError, loadData, loadErrorData, renderLayout, seo}, route)))
  });

  app.get("/*", withConfig(handleIsomorphicRoute, {generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError, preloadJs, preloadRouteData, assetHelper}));

  if(redirectRootLevelStories) {
    app.get("/:storySlug", withConfig(redirectStory, {logError}));
  }

  if(handleCustomRoute) {
    app.get("/*", withConfig(customRouteHandler, {loadData, renderLayout, logError, seo}));
  }

  if(handleNotFound) {
    app.get("/*", withConfig(notFoundHandler, {renderLayout, pickComponent, loadErrorData, logError, assetHelper}));
  }
}

function getWithConfig(app, route, handler, opts = {}) {
  const {
    getClient = require("./api-client").getClient,
    publisherConfig = require("./publisher-config"),
    logError
  } = opts;
  const withConfig = withConfigPartial(getClient, logError, publisherConfig);
  app.get(route, withConfig(handler, opts))
}

exports.getWithConfig = getWithConfig;

exports.proxyGetRequest = function(app, route, handler, opts = {}) {
  const {
    cacheControl = "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=3600"
  } = opts;

  getWithConfig(app, route, proxyHandler, opts);

  async function proxyHandler(req, res, next, {config, client}) {
    try {
      const result = await handler(req.params, {config, client});
      if(typeof result === "string" && result.startsWith("http")) {
        sendResult(await rp(result, {json: true}));
      } else {
        sendResult(result);
      }
    } catch(e) {
      logError(e);
      sendResult(null);
    }

    function sendResult(result) {
      if(result) {
        res.setHeader("Cache-Control", cacheControl);
        res.setHeader("Vary", "Accept-Encoding");
        res.json(result)
      } else {
        res.status(503);
        res.end();
      }
    }
  }
}
