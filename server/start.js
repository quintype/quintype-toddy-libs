var cluster = require('cluster');
var process = require("process");
const {initializeAllClients} = require("./api-client");
const logger = require("./logger");

module.exports.startApp = function(appThunk, opts = {}) {
  if(cluster.isMaster) {
    var os = require('os');
    for (var i = 0; i < (opts.workers || 4); i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      logger.error('worker ' + worker.process.pid + ' died');
      cluster.fork();
    });
  } else {
    if(process.env.NODE_ENV != "production") {
      require("@quintype/build")(opts)
    }
    require("../assetify/server");
    const app = appThunk();
    initializeAllClients()
      .then(() => app.listen(opts.port || 3000, () => console.log('Example app listening on port 3000!')))
      .catch(function(e) {
        var sleep = require("sleep-promise");
        logger.error("Worker died - Aborting", {stack: e.stack});
        return new Promise((resolve) => resolve(cluster.worker.disconnect()))
          .then(() => sleep(opts.sleep || 250))
          .then(() => process.exit());
      });
  }
}
