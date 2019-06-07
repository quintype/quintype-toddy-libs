// FIMXE: Convert this entire thing to async await / or even Typescript

const _ = require("lodash");

const urlLib = require("url");
const {matchBestRoute, matchAllRoutes} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {addCacheHeadersToResult} = require("./cdn-caching");
const {ApplicationException, NotFoundException} = require("../exceptions");
const {renderReduxComponent} = require("../render");
const {createStore} = require("redux");
const Promise = require("bluebird");
const { getDefaultState, createBasicStore } = require("./create-store");
const { customUrlToCacheKey } = require("../caching");

const ABORT_HANDLER = "__ABORT__";
function abortHandler() {
  return Promise.resolve({pageType: ABORT_HANDLER, [ABORT_HANDLER]: true});
}

function loadDataForIsomorphicRoute(loadData, loadErrorData, url, routes, {otherParams, config, client, host, logError, domainSlug}) {
  return loadDataForEachRoute()
    .catch(error => {
      logError(error);
      return loadErrorData(error, config, client, {host, domainSlug})
    });


  // Using async because this for loop reads really really well
  async function loadDataForEachRoute() {
    for(const match of matchAllRoutes(url.pathname, routes)) {
      const params = Object.assign({}, url.query, otherParams, match.params);
      const result = await loadData(match.pageType, params, config, client, {host, next: abortHandler, domainSlug});

      if(result && result[ABORT_HANDLER])
        continue;

      if(result && result.data && result.data[ABORT_HANDLER])
        continue;

      return result;
    }
  }
}




function loadDataForPageType(loadData, loadErrorData = () => Promise.resolve({httpStatusCode: 500}), pageType, params, {config, client, logError, host, domainSlug}) {
  return new Promise((resolve) => resolve(loadData(pageType, params, config, client, {host, next: abortHandler, domainSlug})))
    .then(result => {
      if(result && result.data && result.data[ABORT_HANDLER]) {
        return null;
      }
      return result;
    })
    .catch(error => {
      logError(error);
      return loadErrorData(error, config, client, {host, domainSlug})
    });
}

function getSeoInstance(seo, config, pageType="") {
  return (typeof seo === 'function') ? seo(config, pageType) : seo;
}

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, next, {config, renderLayout, assetHelper, client, loadData, loadErrorData, logError, preloadJs, domainSlug}) {
  if(req.query["_workbox-precaching"] && req.query["_workbox-precaching"] != assetHelper.assetHash("app.js"))
    return res.status(503)
              .send("Requested Shell Is Not Current");


  loadDataForPageType(loadData, loadErrorData, "shell", {}, {config, client, logError, host: req.hostname, domainSlug})
    .then(result => {
      res.status(200);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "public,max-age=900");
      res.setHeader("Vary", "Accept-Encoding");

      if(preloadJs) {
        res.append("Link", `<${assetHelper.assetPath("app.js")}>; rel=preload; as=script;`);
      }

      return renderLayout(res, {
        config,
        content: '<div class="app-loading"><script type="text/javascript">window.qtLoadedFromShell = true</script></div>',
        store: createStore((state) => state, getDefaultState(result)),
        shell: true,
      });
    })
}

function createStoreFromResult(url, result, opts = {}) {
  const qt = {
    pageType: result.pageType || opts.defaultPageType,
    data: result.data,
    currentPath: `${url.pathname}${url.search || ""}`,
    currentHostUrl: result.currentHostUrl,
    primaryHostUrl: result.primaryHostUrl,
  };
  return createBasicStore(result, qt, opts);
}

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, next, {config, client, generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion, domainSlug}) {
  const url = urlLib.parse(req.query.path || "/", true);
  const dataLoader = staticDataLoader() || isomorphicDataLoader();

  return dataLoader
    .then(result => {
      if(!result) {
        return returnNotFound();
      }
      return returnJson(result);
    }, handleException);

  function staticDataLoader() {
    const match = matchBestRoute(url.pathname, staticRoutes);

    if(match) {
      const params = Object.assign({}, url.query, req.query, match.params)
      const pageType = match.pageType || "static-page";
      return loadDataForPageType(loadData, loadErrorData, pageType, params, {config, client, logError, host: req.hostname, domainSlug})
        .then(result => Object.assign({pageType, disableIsomorphicComponent: true}, result))
    }
  }

  function allRoutes() {
    try {
      return generateRoutes(config, domainSlug)
    } catch(e) {
      return [];
    }
  }

  function isomorphicDataLoader() {
    return loadDataForIsomorphicRoute(loadData, loadErrorData, url, allRoutes(), {config, client, logError, host: req.hostname, logError, otherParams: req.query, domainSlug})
      .catch(e => {
        logError(e);
        return {httpStatusCode: 500, pageType: "error"}
      });
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
      addCacheHeadersToResult(res, _.get(result, ["data", "cacheKeys"]));
      const seoInstance = getSeoInstance(seo, config, result.pageType);
      res.json(Object.assign({}, result, {
        appVersion,
        data: _.omit(result.data, ["cacheKeys"]),
        title: seoInstance ? seoInstance.getTitle(config, result.pageType, result) : result.title,
      }));
    }).catch(handleException).finally(() => res.end());
  }

  function returnNotFound() {
    return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config, client, {host: req.hostname, domainSlug})))
      .catch(e => console.log("Exception", e))
      .then(result => {
        res.status(result.httpStatusCode || 404);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "public,max-age=15,s-maxage=120");
        res.setHeader("Vary", "Accept-Encoding");
        res.json(result)
      }).catch(handleException).finally(() => res.end());
  }
};

exports.notFoundHandler = function notFoundHandler(req, res, next, {config, client, loadErrorData, renderLayout, pickComponent, logError, domainSlug}) {
  const url = urlLib.parse(req.url, true);

  return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config, client, {host: req.hostname, domainSlug})))
    .catch(e => {
      logError(e);
      return {pageType: "error"}
    })
    .then(result => {
      const statusCode = result.httpStatusCode || 404;

      const store = createStoreFromResult(url, result, {
        disableIsomorphicComponent: false,
        defaultPageType: 'not-found',
      });

      res.status(statusCode);
      res.setHeader("Cache-Control", "public,max-age=15,s-maxage=60, stale-while-revalidate=150,stale-if-error=3600");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      return pickComponent.preloadComponent(store.getState().qt.pageType)
        .then(() =>
          renderLayout(res, {
            config,
            title: result.title,
            content: renderReduxComponent(IsomorphicComponent, store, {pickComponent}),
            store,
            pageType: store.getState().qt.pageType,
          })
        );
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
}

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, next, {config, client, generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError, assetHelper, preloadJs, preloadRouteData, domainSlug}) {
  const url = urlLib.parse(req.url, true);

  return loadDataForIsomorphicRoute(loadData, loadErrorData, url, generateRoutes(config, domainSlug), {config, client, logError, host: req.hostname, domainSlug})
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
      addCacheHeadersToResult(res, [customUrlToCacheKey(config["publisher-id"], "redirect")]);
      return res.redirect(301, result.data.location);
    }
    const seoInstance = getSeoInstance(seo, config, result.pageType);
    const seoTags = seoInstance && seoInstance.getMetaTags(config, result.pageType || match.pageType, result, {url});
    const store = createStoreFromResult(url, result, {
      disableIsomorphicComponent: statusCode != 200,
    });

    res.status(statusCode)
    addCacheHeadersToResult(res, _.get(result, ["data", "cacheKeys"]));

    if(preloadJs) {
      res.append("Link", `<${assetHelper.assetPath("app.js")}>; rel=preload; as=script;`);
    }

    if(preloadRouteData) {
      res.append("Link", `</route-data.json?path=${encodeURIComponent(url.pathname)}${url.search ? `&${url.search.substr(1)}` : ""}>; rel=preload; as=fetch;`);
    }

    return pickComponent.preloadComponent(store.getState().qt.pageType)
      .then(() =>
        renderLayout(res, {
          config,
          title: result.title,
          content: renderReduxComponent(IsomorphicComponent, store, {pickComponent}),
          store,
          seoTags,
          pageType: store.getState().qt.pageType,
        })
      );
  };
};

exports.handleStaticRoute = function handleStaticRoute(req, res, next, {path, config, client, logError, loadData, loadErrorData, renderLayout, pageType, seo, renderParams, disableIsomorphicComponent, domainSlug}) {
  const url = urlLib.parse(path);
  pageType = pageType || 'static-page';
  return loadDataForPageType(loadData, loadErrorData, pageType, renderParams, {config, client, logError, host: req.hostname, domainSlug})
    .then(result => {
      if(!result) {
        return next();
      }

      const statusCode = result.httpStatusCode || 200;

      if(statusCode == 301 && result.data && result.data.location) {
        return res.redirect(301, result.data.location);
      }

      const seoInstance = getSeoInstance(seo, config, result.pageType);
      const seoTags = seoInstance && seoInstance.getMetaTags(config, result.pageType || pageType, result, {url});
      const store = createStoreFromResult(url, result, {
        disableIsomorphicComponent: disableIsomorphicComponent === undefined ? true : disableIsomorphicComponent,
      });

      res.status(statusCode)
      addCacheHeadersToResult(res, _.get(result, ["data", "cacheKeys"],['static']));

      return renderLayout(res, Object.assign({
        config,
        title: seoInstance ? seoInstance.getTitle(config, result.pageType || match.pageType, result, {url}) : result.title,
        store,
        disableAjaxNavigation: true,
        seoTags
      }, renderParams));
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    });
}
