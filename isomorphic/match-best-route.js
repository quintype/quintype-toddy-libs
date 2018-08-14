const {matchPath} = require("react-router");

function matchAllRoutes(path, routes) {
  // Sure there is some construct to do these two lines
  if (!path.startsWith('/')) {
    path = "/" + path;
  }

  // Using foreach instead of filter / map because I don't want to match the same route over and over
  const matchedRoutes = [];
  routes.forEach(route => {
    const match = matchPath(path, route);
    if(match) {
      return matchedRoutes.push({
        pageType: route.pageType,
        params: Object.assign({}, route.params, match.params),
        match: match
      });
    }
  })
  return matchedRoutes;
}

function matchBestRoute(path, routes) {
  return matchAllRoutes(path, routes)[0];
}

exports.matchBestRoute = matchBestRoute;
exports.matchAllRoutes = matchAllRoutes;
