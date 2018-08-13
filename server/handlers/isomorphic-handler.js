const _ = require("lodash");

const urlLib = require("url");
const {matchBestRoute, matchAllRoutes} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {ApplicationException, NotFoundException} = require("../exceptions");
const {renderReduxComponent} = require("../render");
const {createStore} = require("redux");
const Promise = require("bluebird");

const ABORT_HANDLER = "__ABORT__";
function abortHandler() {
  return Promise.resolve({pageType: ABORT_HANDLER, [ABORT_HANDLER]: true});
}

function loadDataForIsomorphicRoute(loadData, loadErrorData, url, routes, {config, client, host, logError}) {
  return loadDataForEachRoute()
    .catch(error => {
      logError(error);
      return loadErrorData(error, config, client, {host})
    });


  // Using async because this for loop reads really really well
  async function loadDataForEachRoute() {
    for(const match of matchAllRoutes(url.pathname, routes)) {
      const params = Object.assign({}, url.query, match.params)
      const result = await loadData(match.pageType, params, config, client, {host, next: abortHandler});

      if(result && result[ABORT_HANDLER])
        continue;

      if(result && result.data && result.data[ABORT_HANDLER])
        continue;

      return result;
    }
  }
}

function fetchData(loadData, loadErrorData = () => Promise.resolve({httpStatusCode: 500}), pageType, params, {config, client, logError, host}) {
  return new Promise((resolve) => resolve(loadData(pageType, params, config, client, {host, next: abortHandler})))
    .catch(error => {
      logError(error);
      return loadErrorData(error, config, client, {host})
    });
}

function matchRouteWithParams(url, routes, otherParams = {}) {
  const match = matchBestRoute(url.pathname, routes);
  if(match)
    match.params = Object.assign({}, url.query, otherParams, match.params);
  return match;
}

function getSeoInstance(seo, config) {
  return (typeof seo == 'function') ? seo(config) : seo;
}

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, next, {config, renderLayout, assetHelper, client, loadData, loadErrorData, logError, preloadJs}) {
  if(req.query["_workbox-precaching"] && req.query["_workbox-precaching"] != assetHelper.assetHash("app.js"))
    return res.status(503)
              .send("Requested Shell Is Not Current");


  fetchData(loadData, loadErrorData, "shell", {}, {config, client, logError, host: req.hostname})
    .then(result => {
      res.status(200);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "public,max-age=900");
      res.setHeader("Vary", "Accept-Encoding");

      if(preloadJs) {
        res.append("Link", `<${assetHelper.assetPath("app.js")}>; rel=preload; as=script;`);
      }

      return renderLayout(res, {
        config: config,
        content: '<div class="app-loading"><script type="text/javascript">window.qtLoadedFromShell = true</script></div>',
        store: createStore((state) => state, {
          qt: {config: result.config}
        }),
        shell: true,
      });
    })
}

function addCacheHeaders(res, result) {
  const cacheKeys = _.get(result, ["data", "cacheKeys"]);
  if(cacheKeys) {
    res.setHeader('Cache-Control', "public,max-age=15,must-revalidate");
    res.setHeader('Vary', "Accept-Encoding");
    res.setHeader('Surrogate-Control', "public,max-age=240,stale-while-revalidate=300,stale-if-error=14400");
    res.setHeader('Surrogate-Key', _(cacheKeys).uniq().join(" "));
  }
  return res;
}

function createStoreFromResult(url, result, opts = {}) {
  return createStore((state) => state, {
    qt: Object.assign({}, opts, {
      pageType: result.pageType || opts.defaultPageType,
      data: result.data,
      config: result.config,
      currentPath: `${url.pathname}${url.search || ""}`,
    })
  });
}

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, next, {config, client, generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}) {
  const url = urlLib.parse(req.query.path || "/", true);
  const match = matchStaticOrIsomorphicRoute(url)

  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, {config, client, logError, host: req.hostname})
      .then((result) => {
        if(result && result[ABORT_HANDLER]) {
          return returnNotFound();
        }

        if(result && result.data && result.data[ABORT_HANDLER]) {
          return returnNotFound();
        }

        return returnJson(result)
      }, handleException)
  } else {
    return returnNotFound();
  }

  function matchStaticOrIsomorphicRoute(url) {
    try {
      var match;
      if(match = matchRouteWithParams(url, staticRoutes, req.query)) {
        return Object.assign({}, match, {pageType: match.pageType || "static-page", jsonParams: {disableIsomorphicComponent: true}})
      } else {
        return matchRouteWithParams(url, generateRoutes(config), req.query);
      }
    } catch(e) {
      logError(e);
    }
  }


  function handleException(e) {
    logError(e);
    res.status(500);
    return res.json({error: {message: e.message}});
  }

  function returnJson(result) {
    return new Promise(() => {
      const statusCode = result.httpStatusCode || 200;
      res.status(statusCode < 500 ? 200 : 500);
      res.setHeader("Content-Type", "application/json");
      addCacheHeaders(res, result);
      const seoInstance = getSeoInstance(seo, config);
      res.json(Object.assign({}, result, {
        appVersion: appVersion,
        data: _.omit(result.data, ["cacheKeys"]),
        title: seoInstance ? seoInstance.getTitle(config, result.pageType || match.pageType, result) : result.title,
      }, match.jsonParams));
    }).catch(handleException).finally(() => res.end());
  }

  function returnNotFound() {
    return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config)))
      .catch(e => console.log("Exception", e))
      .then(result => {
        res.status(result.httpStatusCode || 404);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "public,max-age=15,s-maxage=120");
        res.setHeader("Vary", "Accept-Encoding");
        res.json(result)
      }).catch(handleException).finally(() => res.end());;
  }
};

exports.notFoundHandler = function notFoundHandler(req, res, next, {config, client, loadErrorData, renderLayout, pickComponent, logError}) {
  const url = urlLib.parse(req.url, true);

  return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config, client, {host: req.hostname})))
    .catch(e => {
      logError(e);
      return {pageType: "error"}
    })
    .then(result => {
      const statusCode = result.httpStatusCode || 404;

      const store = createStoreFromResult(url, result, {
        disableIsomorphicComponent: true,
        defaultPageType: 'not-found',
      });

      res.status(statusCode)

      return renderLayout(res, {
        config: config,
        title: result.title,
        content: renderReduxComponent(IsomorphicComponent, store, {pickComponent: pickComponent}),
        store: store,
      });
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
}

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, next, {config, client, generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError, assetHelper, preloadJs, preloadRouteData}) {
  const url = urlLib.parse(req.url, true);

  return loadDataForIsomorphicRoute(loadData, loadErrorData, url, generateRoutes(config), {config, client, logError, host: req.hostname, logError})
    .catch(e => {
      logError(e);
      return {httpStatusCode: 500, pageType: "error"}
    })
    .then(result => {
      if(!result) {
        return next();
      }

      return new Promise(resolve => resolve(writeResponse(result)))
        .catch(e => {
          logError(e);
          res.status(500);
          res.send(e.message);
        }).finally(() => res.end())
    });


  function writeResponse(result) {
    const statusCode = result.httpStatusCode || 200;

    if(statusCode == 301 && result.data && result.data.location) {
      return res.redirect(301, result.data.location);
    }

    const seoInstance = getSeoInstance(seo, config);
    const seoTags = seoInstance && seoInstance.getMetaTags(config, result.pageType || match.pageType, result, {url});
    const store = createStoreFromResult(url, result, {
      disableIsomorphicComponent: statusCode != 200,
    });

    res.status(statusCode)
    addCacheHeaders(res, result);

    if(preloadJs) {
      res.append("Link", `<${assetHelper.assetPath("app.js")}>; rel=preload; as=script;`);
    }

    if(preloadRouteData) {
      res.append("Link", `</route-data.json?path=${encodeURIComponent(url.pathname)}${url.search ? `&${url.search.substr(1)}` : ""}>; rel=preload; as=fetch;`);
    }

    return renderLayout(res, {
      config: config,
      title: result.title,
      content: renderReduxComponent(IsomorphicComponent, store, {pickComponent: pickComponent}),
      store: store,
      seoTags: seoTags,
    });
  };
};

exports.handleStaticRoute = function handleStaticRoute(req, res, next, {path, config, client, logError, loadData, loadErrorData, renderLayout, pageType, seo, renderParams, disableIsomorphicComponent}) {
  const url = urlLib.parse(path);
  pageType = pageType || 'static-page';
  return fetchData(loadData, loadErrorData, pageType, renderParams, {config, client, logError, host: req.hostname})
    .then(result => {
      const statusCode = result.httpStatusCode || 200;

      if(statusCode == 301 && result.data && result.data.location) {
        return res.redirect(301, result.data.location);
      }

      const seoInstance = getSeoInstance(seo, config);
      const seoTags = seoInstance && seoInstance.getMetaTags(config, result.pageType || pageType, result, {url});
      const store = createStoreFromResult(url, result, {
        disableIsomorphicComponent: disableIsomorphicComponent === undefined ? true : disableIsomorphicComponent,
      });

      res.status(statusCode)
      addCacheHeaders(res, result);

      return renderLayout(res, Object.assign({
        config: config,
        title: seoInstance ? seoInstance.getTitle(config, result.pageType || match.pageType, result, {url}) : result.title,
        store: store,
        disableAjaxNavigation: true,
        seoTags: seoTags
      }, renderParams));
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
}
