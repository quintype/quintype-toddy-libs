/**
 * This namespace exports multiple utility functions for setting up routes
 * ```javascript
 * import { upstreamQuintypeRoutes, isomorphicRoutes, getWithConfig, proxyGetRequest } from "@quintype/framework/server/routes";
 * ```
 * @category Server
 * @module routes
 */

const { generateServiceWorker } = require("./handlers/generate-service-worker");
const {
  handleIsomorphicShell,
  handleIsomorphicDataLoad,
  handleIsomorphicRoute,
  handleStaticRoute,
  notFoundHandler,
} = require("./handlers/isomorphic-handler");

const { oneSignalImport } = require("./handlers/one-signal");
const { customRouteHandler } = require("./handlers/custom-route-handler");
const { handleManifest, handleAssetLink } = require("./handlers/json-manifest-handlers");
const { redirectStory } = require("./handlers/story-redirect");
const { simpleJsonHandler } = require("./handlers/simple-json-handler");
const { makePickComponentSync } = require("../isomorphic/impl/make-pick-component-sync");
const { registerFCMTopic } = require("./handlers/fcm-registration-handler");
const rp = require("request-promise");
const bodyParser = require("body-parser");
const get = require("lodash/get");
const { URL } = require("url");
const prerender = require("@quintype/prerender-node");

/**
 * *upstreamQuintypeRoutes* connects various routes directly to the upstream API server.
 *
 * Requests like *&#47;api&#47;&ast;* and *&#47;stories.rss* are directly forwarded, but also it is also possible to forward other routes.
 * @param {Express} app The express app to add the routes to
 * @param {Object} opts Options
 * @param {Array<string>} opts.extraRoutes Additionally forward some routes upstream. This takes an array of express compatible routes, such as ["/foo/*"]
 * @param {boolean} opts.forwardAmp Forward amp story routes upstream (default false)
 * @param {boolean} opts.forwardFavicon Forward favicon requests to the CMS (default false)
 * @param {boolean} opts.isSitemapUrlEnabled To enable /news_sitemap/today and /news_sitemap/yesterday sitemap news url (default /news_sitemap.xml)
 */
exports.upstreamQuintypeRoutes = function upstreamQuintypeRoutes(
  app,
  {
    forwardAmp = false,
    forwardFavicon = false,
    extraRoutes = [],

    config = require("./publisher-config"),
    getClient = require("./api-client").getClient,
    isSitemapUrlEnabled = false,
  } = {}
) {
  const host = config.sketches_host;
  const apiProxy = require("http-proxy").createProxyServer({
    target: host,
    ssl: host.startsWith("https") ? { servername: host.replace(/^https:\/\//, "") } : undefined,
  });

  apiProxy.on("proxyReq", (proxyReq, req, res, options) => {
    proxyReq.setHeader("Host", getClient(req.hostname).getHostname());
  });

  const sketchesProxy = (req, res) => apiProxy.web(req, res);

  app.get("/ping", (req, res) => {
    getClient(req.hostname)
      .getConfig()
      .then(() => res.send("pong"))
      .catch(() => res.status(503).send({ error: { message: "Config not loaded" } }));
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
  app.all("/sso-login", sketchesProxy);
  app.all("/sso-signup", sketchesProxy);
  if (isSitemapUrlEnabled) {
    app.all("/news_sitemap/today.xml", sketchesProxy);
    app.all("/news_sitemap/yesterday.xml", sketchesProxy);
  } else {
    app.all("/news_sitemap.xml", sketchesProxy);
  }
  if (forwardAmp) {
    app.get("/amp/*", sketchesProxy);
  }
  if (forwardFavicon) {
    app.get("/favicon.ico", sketchesProxy);
  }

  extraRoutes.forEach((route) => app.all(route, sketchesProxy));
};

// istanbul ignore next
function renderServiceWorkerFn(res, layout, params, callback) {
  return res.render(layout, params, callback);
}

// istanbul ignore next
function toFunction(value, toRequire) {
  if (value === true) {
    value = require(toRequire);
  }

  if (typeof value === "function") {
    return value;
  }
  return () => value;
}

function getDomainSlug(publisherConfig, hostName) {
  if (!publisherConfig.domain_mapping) {
    return undefined;
  }
  return publisherConfig.domain_mapping[hostName] || null;
}

function withConfigPartial(
  getClient,
  logError,
  publisherConfig = require("./publisher-config"),
  configWrapper = (config) => config
) {
  return function withConfig(f, staticParams) {
    return function (req, res, next) {
      const domainSlug = getDomainSlug(publisherConfig, req.hostname);
      const client = getClient(req.hostname);
      return client
        .getConfig()
        .then((config) => configWrapper(config, domainSlug))
        .then((config) =>
          f(
            req,
            res,
            next,
            Object.assign({}, staticParams, {
              config,
              client,
              domainSlug,
            })
          )
        )
        .catch(logError);
    };
  };
}

exports.withError = function withError(handler, logError) {
  return async (req, res, next, opts) => {
    try {
      await handler(req, res, next, opts);
    } catch (e) {
      logError(e);
      res.status(500);
      res.end();
    }
  };
};

function convertToDomain(path) {
  if (!path) {
    return path;
  }
  return new URL(path).origin;
}

function wrapLoadDataWithMultiDomain(publisherConfig, f, configPos) {
  return async function loadDataWrapped() {
    const { domainSlug } = arguments[arguments.length - 1];
    const config = arguments[configPos];
    const primaryHostUrl = convertToDomain(config["sketches-host"]);
    const domain = (config.domains || []).find((d) => d.slug === domainSlug) || {
      "host-url": primaryHostUrl,
    };
    const result = await f.apply(this, arguments);
    return Object.assign(
      {
        domainSlug,
        currentHostUrl: convertToDomain(domain["host-url"]),
        primaryHostUrl,
      },
      result
    );
  };
}

/**
 * A handler is an extension of an express handler. Handlers are declared with the following arguments
 * ```javascript
 * function handler(req, res, next, { config, client, ...opts }) {
 *  // do something cool
 * }
 * ```
 * @typedef Handler
 */

/**
 * Use *getWithConfig* to handle GET requests. The handle that is accepted is of type {@link module:routes~Handler}, which is similar to an express
 * handler, but already has a *client* initialized, and the *config* fetched from the server.
 *
 * @param {Express} app Express app to add the route to
 * @param {string} route The route to implement
 * @param {module:routes~Handler} handler The Handler to run
 * @param {Object} opts Options that will be passed to the handler. These options will be merged with a *config* and *client*
 */
function getWithConfig(app, route, handler, opts = {}) {
  const {
    getClient = require("./api-client").getClient,
    publisherConfig = require("./publisher-config"),
    logError = require("./logger").error,
  } = opts;
  const withConfig = withConfigPartial(getClient, logError, publisherConfig);
  app.get(route, withConfig(handler, opts));
}

/**
 * *isomorphicRoutes* brings all the moving parts of the [server side rendering](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture) together.
 * It accepts all the pieces needed, and implements all the plumbing to make these pieces work together.
 *
 * Note that *isomorphicRoutes* adds a route that matches *&#47;&ast;*, so it should be near the end of your *app/server/app.js*.
 *
 * @param {Express} app Express app to add the routes to
 * @param {Object} opts Options
 * @param {function} opts.generateRoutes A function that generates routes to be matched given a config. See [routing](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#routing) for more information. This call should be memoized, as it's called on every request
 * @param {function} opts.renderLayout A function that renders the layout given the content injected by *isomorphicRoutes*. See [renderLayout](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#renderlayout)
 * @param {function} opts.loadData An async function that loads data for the page, given the *pageType*. See [loadData](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#loaddata)
 * @param {function} opts.pickComponent An async function that picks the correct component for rendering each *pageType*. See [pickComponent](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#pickcomponent)
 * @param {function} opts.loadErrorData An async function that loads data if there is an error. If *handleNotFound* is set to true, this function is also called to load data for the 404 page
 * @param {SEO} opts.seo An SEO object that will generate html tags for each page. See [@quintype/seo](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#quintypeseo)
 * @param {function} opts.manifestFn An async function that accepts the *config*, and returns content for the *&#47;manifest.json*. Common fields like *name*, *start_url* will be populated by default, but can be owerwritten. If not set, then manifest will not be generated.
 * @param {function} opts.assetLinkFn An async function that accepts *config* and returns *{ packageName, authorizedKeys }* for the Android *&#47;.well-known/assetlinks.json*. If not implemented, then AssetLinks will return a 404.
 * @param {boolean} opts.oneSignalServiceWorkers Deprecated: If set to true, then generate *&#47;OneSignalSKDWorker.js* which combines the Quintype worker as well as OneSignal's worker. (default: false). Please see [https://developers.quintype.com/malibu/tutorial/onesignal](https://developers.quintype.com/malibu/tutorial/onesignal)
 * @param {*} opts.staticRoutes WIP: List of static routes
 * @param {Array<string>} opts.serviceWorkerPaths List of paths to host the service worker on (default: ["/service-worker.js"])s
 * @param {number} opts.appVersion The version of this app. In case there is a version mismatch between server and client, then client will update ServiceWorker in the background. See *app/isomorphic/app-version.js*.
 * @param {boolean} opts.preloadJs Return a *Link* header preloading JS files. In h/2 compatible browsers, this Js will be pushed. (default: false)
 * @param {boolean} opts.preloadRouteData Return a *Link* header preloading *&#47;route-data.json*. In h/2 compatible browsers, this Js will be pushed. (default: false)
 * @param {boolean} opts.handleCustomRoute If the page is not matched as an isomorphic route, then match against a static page or redirect in the CMS, and behave accordingly. Note, this runs after the isomorphic routes, so any live stories or sections will take precedence over a redirection set up in the editor. (default: true)
 * @param {boolean} opts.handleNotFound If set to true, then handle 404 pages with *pageType* set to *"not-found"*. (default: true)
 * @param {boolean} opts.redirectRootLevelStories If set to true, then stories URLs without a section (at *&#47;:storySlug*) will redirect to the canonical url (default: false)
 * @param {boolean} opts.mobileApiEnabled If set to true, then *&#47;mobile-data.json* will respond to mobile API requests. This is primarily used by the React Native starter kit. (default: true)
 * @param {Object} opts.mobileConfigFields List of fields that are needed in the config field of the *&#47;mobile-data.json* API. This is primarily used by the React Native starter kit. (default: {})
 * @param {boolean} opts.templateOptions If set to true, then *&#47;template-options.json* will return a list of available components so that components can be sorted in the CMS. This reads data from *config/template-options.yml*. See [Adding a homepage component](https://developers.quintype.com/malibu/tutorial/adding-a-homepage-component) for more details
 * @param {boolean|function} opts.lightPages If set to true, then all story pages will render amp pages.
 * @param {string | function} opts.cdnProvider The name of the cdn provider. Supported cdn providers are akamai, cloudflare. Default value is cloudflare.
 * @param {function} opts.maxConfigVersion An async function which resolves to a integer version of the config. This defaults to config.theme-attributes.cache-burst
 * @param {Array<object>|function} opts.redirectUrls An array or async function which used to render the redirect url provided in the array of object - >ex- REDIRECT_URLS = [{sourceUrl: "/tag/:tagSlug",destinationUrl: "/topic/:tagSlug",statusCode: 301,}]
 * @param {boolean|function} redirectToLowercaseSlugs If set or evaluates to true, then for every story-page request having capital latin letters in the slug, it responds with a 301 redirect to the lowercase slug URL. (default: true)
 * @param {boolean|function} shouldEncodeAmpUri If set to true, then for every story-page request the slug will be encoded, in case of a vernacular slug this should be set to false. Receives path as param (default: true)
 * @param {string} sMaxAge Overrides the s-maxage value, the default value is set to 900 seconds
 */
exports.isomorphicRoutes = function isomorphicRoutes(
  app,
  {
    generateRoutes,
    renderLayout,
    loadData,
    pickComponent,
    loadErrorData,
    seo,
    manifestFn,
    assetLinkFn,

    oneSignalServiceWorkers = false,
    staticRoutes = [],
    appVersion = 1,
    preloadJs = false,
    preloadRouteData = false,
    handleCustomRoute = true,
    handleNotFound = true,
    redirectRootLevelStories = false,
    mobileApiEnabled = true,
    mobileConfigFields = {},
    templateOptions = false,
    lightPages = false,
    cdnProvider = "cloudflare",
    serviceWorkerPaths = ["/service-worker.js"],
    maxConfigVersion = (config) => get(config, ["theme-attributes", "cache-burst"], 0),
    configWrapper = (config) => config,

    // The below are primarily for testing
    logError = require("./logger").error,
    assetHelper = require("./asset-helper"),
    getClient = require("./api-client").getClient,
    renderServiceWorker = renderServiceWorkerFn,
    publisherConfig = require("./publisher-config"),
    redirectUrls = [],
    prerenderServiceUrl = "",
    redirectToLowercaseSlugs = false,
    shouldEncodeAmpUri,
    sMaxAge = "900",
  }
) {
  const withConfig = withConfigPartial(getClient, logError, publisherConfig, configWrapper);

  pickComponent = makePickComponentSync(pickComponent);
  loadData = wrapLoadDataWithMultiDomain(publisherConfig, loadData, 2);
  loadErrorData = wrapLoadDataWithMultiDomain(publisherConfig, loadErrorData, 1);

  if (prerenderServiceUrl) {
    app.use((req, res, next) => {
      if (req.query.prerender) {
        try {
          // eslint-disable-next-line global-require
          prerender.set("prerenderServiceUrl", prerenderServiceUrl)(req, res, next);
        } catch (e) {
          logError(e);
        }
      } else {
        next();
      }
    });
  }

  if (serviceWorkerPaths.length > 0) {
    app.get(
      serviceWorkerPaths,
      withConfig(generateServiceWorker, {
        generateRoutes,
        assetHelper,
        renderServiceWorker,
        maxConfigVersion,
      })
    );
  }

  if (oneSignalServiceWorkers) {
    app.get(
      "/OneSignalSDKWorker.js",
      withConfig(generateServiceWorker, {
        generateRoutes,
        renderServiceWorker,
        assetHelper,
        appendFn: oneSignalImport,
        maxConfigVersion,
      })
    );
    app.get(
      "/OneSignalSDKUpdaterWorker.js",
      withConfig(generateServiceWorker, {
        generateRoutes,
        renderServiceWorker,
        assetHelper,
        appendFn: oneSignalImport,
        maxConfigVersion,
      })
    );
  }

  app.get(
    "/shell.html",
    withConfig(handleIsomorphicShell, {
      seo,
      renderLayout,
      assetHelper,
      loadData,
      loadErrorData,
      logError,
      preloadJs,
      maxConfigVersion,
    })
  );
  app.get(
    "/route-data.json",
    withConfig(handleIsomorphicDataLoad, {
      generateRoutes,
      loadData,
      loadErrorData,
      logError,
      staticRoutes,
      seo,
      appVersion,
      cdnProvider,
      redirectToLowercaseSlugs,
      sMaxAge,
    })
  );

  app.post("/register-fcm-topic", bodyParser.json(), withConfig(registerFCMTopic, { publisherConfig }));

  if (manifestFn) {
    app.get("/manifest.json", withConfig(handleManifest, { manifestFn, logError }));
  }

  if (mobileApiEnabled) {
    app.get(
      "/mobile-data.json",
      withConfig(handleIsomorphicDataLoad, {
        generateRoutes,
        loadData,
        loadErrorData,
        logError,
        staticRoutes,
        seo,
        appVersion,
        mobileApiEnabled,
        mobileConfigFields,
        cdnProvider,
        redirectToLowercaseSlugs,
        sMaxAge,
      })
    );
  }

  if (assetLinkFn) {
    app.get("/.well-known/assetlinks.json", withConfig(handleAssetLink, { assetLinkFn, logError }));
  }

  if (templateOptions) {
    app.get(
      "/template-options.json",
      withConfig(simpleJsonHandler, {
        jsonData: toFunction(templateOptions, "./impl/template-options"),
      })
    );
  }

  staticRoutes.forEach((route) => {
    app.get(
      route.path,
      withConfig(
        handleStaticRoute,
        Object.assign(
          {
            logError,
            loadData,
            loadErrorData,
            renderLayout,
            seo,
            cdnProvider,
            oneSignalServiceWorkers,
            publisherConfig,
            sMaxAge,
          },
          route
        )
      )
    );
  });

  app.get(
    "/*",
    withConfig(handleIsomorphicRoute, {
      generateRoutes,
      loadData,
      renderLayout,
      pickComponent,
      loadErrorData,
      seo,
      logError,
      preloadJs,
      preloadRouteData,
      assetHelper,
      cdnProvider,
      lightPages,
      redirectUrls,
      redirectToLowercaseSlugs,
      shouldEncodeAmpUri,
      oneSignalServiceWorkers,
      publisherConfig,
      sMaxAge,
    })
  );

  if (redirectRootLevelStories) {
    app.get("/:storySlug", withConfig(redirectStory, { logError, cdnProvider, sMaxAge }));
  }

  if (handleCustomRoute) {
    app.get(
      "/*",
      withConfig(customRouteHandler, {
        loadData,
        renderLayout,
        logError,
        seo,
        cdnProvider,
        sMaxAge,
      })
    );
  }

  if (handleNotFound) {
    app.get(
      "/*",
      withConfig(notFoundHandler, {
        renderLayout,
        pickComponent,
        loadErrorData,
        logError,
        assetHelper,
      })
    );
  }
};

exports.getWithConfig = getWithConfig;

/**
 * *proxyGetRequest* can be used to forward requests to another host, and cache the results on our CDN. This can be done as follows in `app/server/app.js`.
 *
 * ```javascript
 * proxyGetRequest(app, "/path/to/:resource.json", (params) => `https://example.com/${params.resource}.json`, {logError})
 * ```
 *
 * The handler can return the following:
 * * null / undefined - The result will be a 503
 * * any truthy value - The result will be returned as a 200 with the result as content
 * * A url starting with http(s) - The URL will be fetched and content will be returned according to the above two rules
 * @param {Express} app The app to add the route to
 * @param {string} route The new route
 * @param {function} handler A function which takes params and returns a URL to proxy
 * @param opts
 * @param opts.cacheControl The cache control header to set on proxied requests (default: *"public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=3600"*)
 */
exports.proxyGetRequest = function (app, route, handler, opts = {}) {
  const { logError = require("./logger").error } = opts;
  const { cacheControl = "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=3600" } = opts;

  getWithConfig(app, route, proxyHandler, opts);

  async function proxyHandler(req, res, next, { config, client }) {
    try {
      const result = await handler(req.params, { config, client });
      if (typeof result === "string" && result.startsWith("http")) {
        sendResult(await rp(result, { json: true }));
      } else {
        sendResult(result);
      }
    } catch (e) {
      logError(e);
      sendResult(null);
    }

    function sendResult(result) {
      if (result) {
        res.setHeader("Cache-Control", cacheControl);
        res.setHeader("Vary", "Accept-Encoding");
        res.json(result);
      } else {
        res.status(503);
        res.end();
      }
    }
  }
};

// This could also be done using express's mount point, but /ping stops working
exports.mountQuintypeAt = function (app, mountAt) {
  app.use(function (req, res, next) {
    const mountPoint = typeof mountAt === "function" ? mountAt(req.hostname) : mountAt;

    if (mountPoint && req.url.startsWith(mountPoint)) {
      req.url = req.url.slice(mountPoint.length) || "/";
      next();
    } else if (mountPoint && req.url !== "/ping") {
      res.status(404).send(`Not Found: Quintype has been mounted at ${mountPoint}`);
    } else {
      next();
    }
  });
};

/**
 * *ampRoutes* handles all the amp page routes using the *[@quintype/amp](https://developers.quintype.com/quintype-node-amp)* library
 * routes matched:
 * GET - "/amp/story/:slug"* returns amp story page
 * GET - "/amp/api/v1/amp-infinite-scroll" returns the infinite scroll config JSON. Passed to <amp-next-page> component's `src` attribute
 *
 * @param {Express} app Express app to add the routes to
 * @param {Object} opts Options object used to configure amp. Passing this is optional
 * @param {Object} opts.templates An object that's used to pass custom templates. Each key corresponds to the template name and corresponding value is the template
 * @param {Object} opts.slots An object used to pass slot data.
 * @param {SEO} opts.seo An SEO object that will generate html tags for each page. See [@quintype/seo](https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#quintypeseo)
 * @param {function} opts.headerCardRender Render prop for story headerCard. If passed, the headerCard in default stories will be replaced with this
 * @param {function} opts.relatedStoriesRender Render prop for relatedStories in a story page. If passed, this will replace the related stories
 *
 */
exports.ampRoutes = (app, opts = {}) => {
  const { ampStoryPageHandler, storyPageInfiniteScrollHandler, bookendHandler } = require("./amp/handlers");

  getWithConfig(app, "/amp/story/*", ampStoryPageHandler, opts);
  getWithConfig(app, "/amp/api/v1/amp-infinite-scroll", storyPageInfiniteScrollHandler, opts);
  getWithConfig(app, "/amp/api/v1/bookend.json", bookendHandler, opts);
  getWithConfig(app, "/ampstories/*", ampStoryPageHandler, opts);
};
