const _ = require("lodash");

const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {ApplicationException, NotFoundException} = require("../exceptions");
const {renderReduxComponent} = require("../render");
const {createStore} = require("redux");
const Promise = require("bluebird");

function fetchData(loadData, loadErrorData = () => Promise.resolve({httpStatusCode: 500}), pageType, params, {config, client, logError}) {
  return new Promise((resolve) => resolve(loadData(pageType, params, config, client)))
    .catch(error => {
      logError(error);
      return loadErrorData(error, config)
    });
}

function matchRouteWithParams(url, routes, otherParams = {}) {
  const match = matchBestRoute(url.pathname, routes);
  if(match)
    match.params = Object.assign({}, url.query, otherParams, match.params);
  return match;
}

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, next, {config, renderLayout, assetHelper, client, loadData, loadErrorData, logError, preloadJs}) {
  if(req.query["_workbox-precaching"] && req.query["_workbox-precaching"] != assetHelper.assetHash("app.js"))
    return res.status(503)
              .send("Requested Shell Is Not Current");


  fetchData(loadData, loadErrorData, "shell", {}, {config, client, logError})
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
        content: '<div class="app-loading"></div>',
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

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, next, {config, client, generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}) {
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

  const url = urlLib.parse(req.query.path || "/", true);
  const match = matchStaticOrIsomorphicRoute(url)

  res.setHeader("Content-Type", "application/json");

  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, {config, client, logError})
      .then((result) => {
        const statusCode = result.httpStatusCode || 200;
        res.status(statusCode < 500 ? 200 : 500);
        addCacheHeaders(res, result);
        res.json(Object.assign({}, result, {
          appVersion: appVersion,
          data: _.omit(result.data, ["cacheKeys"]),
          title: seo ? seo.getTitle(config, result.pageType || match.pageType, result) : result.title,
        }, match.jsonParams));
      }).catch(e => {
        logError(e);
        res.status(500);
        res.json({error: {message: e.message}});
      }).finally(() => res.end());
  } else {
    return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config)))
      .then(result => {
        res.setHeader("Cache-Control", "public,max-age=15");
        res.setHeader("Vary", "Accept-Encoding");
        res.status(result.httpStatusCode || 404);
        res.json(result)
      }).catch(e => {
        logError(e);
        res.status(500);
        res.json({error: {message: e.message}});
      }).finally(() => res.end());;
  }
};

exports.notFoundHandler = function notFoundHandler(req, res, next, {config, client, loadErrorData, renderLayout, pickComponent, logError}) {
  const url = urlLib.parse(req.url, true);

  return new Promise(resolve => resolve(loadErrorData(new NotFoundException(), config)))
    .catch(e => {
      logError(e);
      return {pageType: "error"}
    })
    .then(result => {
      const statusCode = result.httpStatusCode || 404;

      const store = createStore((state) => state, {
        qt: {
          pageType: result.pageType || 'not-found',
          data: result.data,
          config: result.config,
          currentPath: `${url.pathname}${url.search || ""}`,
          disableIsomorphicComponent: true,
        }
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
  const match = matchRouteWithParams(url, generateRoutes(config));

  if (!match) {
    return next();
  }

  return fetchData(loadData, loadErrorData, match.pageType, match.params, {config, client, logError})
    .catch(e => {
      logError(e);
      return {httpStatusCode: 500, pageType: "error"}
    })
    .then(result => {
      const statusCode = result.httpStatusCode || 200;

      if(statusCode == 301 && result.data && result.data.location) {
        return res.redirect(301, result.data.location);
      }

      const seoTags = seo && seo.getMetaTags(config, result.pageType || match.pageType, result, {url});
      const store = createStore((state) => state, {
        qt: {
          pageType: result.pageType,
          data: result.data,
          config: result.config,
          currentPath: `${url.pathname}${url.search || ""}`,
          disableIsomorphicComponent: statusCode != 200
        }
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
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
};

exports.handleStaticRoute = function handleStaticRoute(req, res, next, {path, config, client, logError, loadData, loadErrorData, renderLayout, pageType, seo, renderParams, disableIsomorphicComponent}) {
  const url = urlLib.parse(path);
  pageType = pageType || 'static-page';
  return fetchData(loadData, loadErrorData, pageType, renderParams, {config, client, logError})
    .then(result => {
      const statusCode = result.httpStatusCode || 200;

      if(statusCode == 301 && result.data && result.data.location) {
        return res.redirect(301, result.data.location);
      }

      const seoTags = seo && seo.getMetaTags(config, result.pageType || pageType, result, {url});
      const store = createStore((state) => state, {
        qt: {
          pageType: result.pageType,
          data: result.data,
          config: result.config,
          currentPath: path,
          disableIsomorphicComponent: disableIsomorphicComponent === undefined ? true : disableIsomorphicComponent
        }
      });

      res.status(statusCode)
      addCacheHeaders(res, result);

      return renderLayout(res, Object.assign({
        config: config,
        title: seo ? seo.getTitle(config, result.pageType || match.pageType, result, {url}) : result.title,
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
