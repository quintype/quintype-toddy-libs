const {getClient} = require("./api-client");

module.exports = function withConfig(logError, f, staticParams) {
  return function(req, res, opts) {
    const client = getClient(req.hostname);
    return client.getConfig()
      .then(c => f(req, res, Object.assign({}, opts, staticParams, {config: c, client: client})))
      .catch(logError);
  }
}
