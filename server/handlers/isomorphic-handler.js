const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');
const {IsomorphicComponent} = require("../../isomorphic/component");

const ReactDOMServer = require('react-dom/server');
const React = require("react");

const {createStore} = require("redux");
const {Provider} = require("react-redux");

exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, {config, renderLayout}) {
  renderLayout(res.status(200), {
    content: '<div class="app-loading"></div>'
  });
}

exports.handleIsomorphicDataLoad = function handleIsomorphicDataLoad(req, res, {config, generateRoutes, loadData}) {
  const url = urlLib.parse(req.query.path || "/");
  const match = matchBestRoute(url.pathname, generateRoutes(config));
  res.setHeader("Content-Type", "application/json");
  if(match) {
    return loadData(match.pageType, match.params, config)
      .then((result) => res.status(200).json(result));
  } else {
    res.status(404).json({
      error: {message: "Not Found"}
    });
    return Promise.resolve();
  }
};

exports.handleIsomorphicRoute = function handleIsomorphicRoute(req, res, {config, generateRoutes, loadData, renderLayout, pickComponent}) {
  const url = urlLib.parse(req.url);
  const match = matchBestRoute(url.pathname, generateRoutes(config));
  if(match) {
    return loadData(match.pageType, match.params, config)
      .then((result) => {
        const context = {};
        const store = createStore((state) => state, result);
        renderLayout(res.status(result.httpStatusCode || 200), {
          content: ReactDOMServer.renderToString(
            React.createElement(Provider, {store: store},
                React.createElement(IsomorphicComponent, {pickComponent: pickComponent})))
        });
      });
  } else {
    renderLayout(res.status(404), {
      content: "Not Found"
    });
    return new Promise((resolve) => resolve());
  }
};
