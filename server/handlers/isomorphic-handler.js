const urlLib = require("url");
const {matchBestRoute} = require('../../isomorphic/match-best-route');

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
