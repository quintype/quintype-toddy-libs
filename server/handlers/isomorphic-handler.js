const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");
const {ApplicationException, NotFoundException} = require("../exceptions");

const ReactDOMServer = require('react-dom/server');
const React = require("react");

const {createStore} = require("redux");
const {Provider} = require("react-redux");

function fetchData(loadData, loadErrorData = () => Promise.resolve({}), pageType, params, config) {
  return loadData(pageType, params, config)
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

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, {config, renderLayout}) {
  renderLayout(res.status(200), {
    content: '<div class="app-loading"></div>'
  });
}

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, {config, generateRoutes, loadData, loadErrorData}) {
  const url = urlLib.parse(req.query.path || "/");
  const match = matchBestRoute(url.pathname, generateRoutes(config));
  res.setHeader("Content-Type", "application/json");
  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, config)
      .then((result) => res.status(200).json(result))      
  } else {
    res.status(404).json({
      error: {message: "Not Found"}
    });
    return Promise.resolve();
  }
};

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, {config, generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, loadSeoData}) {
  const url = urlLib.parse(req.url);
  const match = matchBestRoute(url.pathname, generateRoutes(config));
  if(match) {
    return fetchData(loadData, loadErrorData, match.pageType, match.params, config)
    .then((result) => {
      const store = createStore((state) => state, {
        qt: {pageType: result.pageType, data: result.data, config: result.config}
      });

      renderLayout(res.status(result.httpStatusCode || 200), {
        metadata: loadSeoData(config, result.pageType, result.data),
        content: ReactDOMServer.renderToString(
          React.createElement(Provider, {store: store},
              React.createElement(IsomorphicComponent, {pickComponent: pickComponent}))
        )
      });
    });
  } else {
    renderLayout(res.status(404), {
      content: "Not Found"
    });
    return new Promise((resolve) => resolve());
  }
};
