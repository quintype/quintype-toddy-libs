const get = require("lodash/get");

exports.handleManifest = function handleManifest(req, res, {config, logError, manifestFn}) {
  manifestFn(config)
    .then(result => {
      res.setHeader("Cache-Control", "public,max-age=300");
      res.setHeader("Vary", "Accept-Encoding");
      res.json(Object.assign({
        name: get(config, ["publisher-settings", "title"]),
        short_name: get(config, ["publisher-settings", "title"]),
        start_url: "/",
        display: "standalone",
        background_color: "#eee",
      }, result));
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
};
