const _ = require("lodash");

const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {ApplicationException, NotFoundException} = require("../exceptions");
const {renderReduxComponent} = require("../render");
const {createStore} = require("redux");
const Promise = require("bluebird");

function fetchData(loadData, loadErrorData = () => Promise.resolve({}), pageType, params, config, client) {
  return Promise.resolve(loadData(pageType, params, config, client))
    .catch(error => {
      if (error instanceof NotFoundException) {
        return loadErrorData(error)
                .then(data => Object.assign({httpStatusCode : error.httpStatusCode, pageType: "not-found"}, data))
                .catch((error) => Promise.resolve({}));
      } else if (error instanceof ApplicationException) {
        return Promise.resolve({httpStatusCode: error.httpStatusCode || 500, pageType: "error"});
      } else {
        throw error;
      }
    })
}

function matchRouteWithParams(url, routes) {
  const match = matchBestRoute(url.pathname, routes);
  if(match)
    match.params = Object.assign({}, url.query, match.params);
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

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, {config, client, generateRoutes, loadData, loadErrorData, logError, staticRoutes}) {
  const url = urlLib.parse(req.query.path || "/", true);
  const match = matchRouteWithParams(url, staticRoutes.concat(generateRoutes(config)));
  res.setHeader("Content-Type", "application/json");
  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, config, client)
      .then((result) => {
        res.status(200);
        addCacheHeaders(res, result);
        res.json(Object.assign({}, result, {data: _.omit(result.data, ["cacheKeys"])}));
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

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, {config, client, generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, loadSeoData, logError}) {
  const url = urlLib.parse(req.url, true);
  const match = matchRouteWithParams(url, generateRoutes(config));
  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, config, client)
      .then((result) => {
        const store = createStore((state) => state, {
          qt: {
            pageType: result.pageType,
            data: result.data,
            config: result.config,
            currentPath: `${url.pathname}${url.search || ""}`
          }
        });

        res.status(result.httpStatusCode || 200)
        addCacheHeaders(res, result);
        renderLayout(res, {
          metadata: loadSeoData(config, result.pageType, result.data),
          content: renderReduxComponent(IsomorphicComponent, store, {pickComponent: pickComponent}),
          store: store
        });
      }).catch(e => {
        logError(e);
        res.status(500);
        res.send(e.message);
      }).finally(() => res.end());
  } else {
    renderLayout(res.status(404), {
      content: "Not Found",
      store: createStore((state) => state, {
        qt: {config: config}
      })
    });
    return new Promise((resolve) => resolve());
  }
};

exports.handleStaticRoute = function handleStaticRoute(req, res, {path, config, client, logError, loadData, loadErrorData, renderLayout, pageType, loadSeoData, renderParams}) {
  pageType = pageType || 'static-page';
  return fetchData(loadData, loadErrorData, pageType, renderParams, config, client)
    .then(result => {
      const store = createStore((state) => state, {
        qt: {
          pageType: result.pageType,
          data: result.data,
          config: result.config,
          currentPath: path
        }
      });
      res.status(result.httpStatusCode || 200)
      addCacheHeaders(res, result);
      renderLayout(res, Object.assign({
        store: store,
        metadata: loadSeoData(config, pageType, result.data),
        disableIsomorphicComponent: true,
        disableAjaxNavigation: true
      }, renderParams));
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
}
