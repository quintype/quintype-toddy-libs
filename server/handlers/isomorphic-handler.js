const _ = require("lodash");

const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {ApplicationException, NotFoundException} = require("../exceptions");
const {renderReduxComponent} = require("../render");
const {createStore} = require("redux");
const Promise = require("bluebird");

function fetchData(loadData, loadErrorData = () => Promise.resolve({}), pageType, params, {config, client, logError}) {
  return Promise.resolve(loadData(pageType, params, config, client))
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

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, {config, renderLayout}) {
  renderLayout(res.status(200), {
    content: '<div class="app-loading"></div>',
    store: createStore((state) => state, {
      qt: {config: config}
    })
  });
}

function addCacheHeaders(res, result) {
  const cacheKeys = _.get(result, ["data", "cacheKeys"]);
  if(cacheKeys) {
    res.setHeader('Cache-Control', "public,max-age=15");
    res.setHeader('Vary', "Accept-Encoding");
    res.setHeader('Surrogate-Control', "public,max-age=240,stale-while-revalidate=300,stale-if-error=14400");
    res.setHeader('Surrogate-Key', _(cacheKeys).uniq().join(" "));
  }
  return res;
}

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, {config, client, generateRoutes, loadData, loadErrorData, logError, staticRoutes, seo, appVersion}) {
  function matchStaticOrIsomorphicRoute(url) {
    var match;
    if(match = matchRouteWithParams(url, staticRoutes, req.query)) {
      return Object.assign({jsonParams: {disableIsomorphicComponent: true}}, match)
    } else {
      return matchRouteWithParams(url, generateRoutes(config), req.query);
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
    res.status(404).json({
      error: {message: "Not Found"}
    });
    return Promise.resolve();
  }
};

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, {config, client, generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, seo, logError}) {
  const url = urlLib.parse(req.url, true);
  const match = matchRouteWithParams(url, generateRoutes(config));

  const dataPromise = match
                        ? fetchData(loadData, loadErrorData, match.pageType, match.params, {config, client, logError})
                        : loadErrorData(new NotFoundException(), config);

  return Promise.resolve(dataPromise)
    .catch(e => {
      logError(e);
      return {httpStatusCode: 500, pageType: "error"}
    })
    .then(result => {
      const statusCode = result.httpStatusCode || 200;
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
      renderLayout(res, {
        title: result.title,
        content: renderReduxComponent(IsomorphicComponent, store, {pickComponent: pickComponent}),
        store: store,
        seoTags: seoTags
      });
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
};

exports.handleStaticRoute = function handleStaticRoute(req, res, {path, config, client, logError, loadData, loadErrorData, renderLayout, pageType, seo, renderParams}) {
  const url = urlLib.parse(path);
  pageType = pageType || 'static-page';
  return fetchData(loadData, loadErrorData, pageType, renderParams, {config, client, logError})
    .then(result => {
      const seoTags = seo && seo.getMetaTags(config, result.pageType || pageType, result, {url});
      const store = createStore((state) => state, {
        qt: {
          pageType: result.pageType,
          data: result.data,
          config: result.config,
          currentPath: path,
          disableIsomorphicComponent: true
        }
      });
      res.status(result.httpStatusCode || 200)
      addCacheHeaders(res, result);
      renderLayout(res, Object.assign({
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
