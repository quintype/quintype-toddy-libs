exports.handleVisualStoryRoute = function bookendHandler(req, res, next, {config, bookendFn}) {
  return new Promise(resolve => resolve(bookendFn(config)))
    .then(result => {
      res.setHeader("Cache-Control", "public,max-age=900");
      res.setHeader("Vary", "Accept-Encoding");
      res.json(Object.assign({}, {
        "bookendVersion": "v1.0",
        "shareProviders": [
          "facebook",
          "twitter",
          "email"
        ],
        "components": [{
          "type": "heading",
          "text": "More to read"
        }]
      }, result));
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
};