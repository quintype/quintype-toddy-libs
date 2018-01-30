const {getClient} = require("./api-client");

module.exports = function withConfig(logError, f, staticParams) {
  return function(req, res, opts) {
    opts = Object.assign({}, opts, staticParams);
    const client = getClient(req.hostname);
    return client.getConfig()
      .then(c => f(req, res, Object.assign({}, opts, {config: c, client: client})))
      .catch(logError);
  }
}
