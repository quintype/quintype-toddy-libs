var cluster = require('cluster');
var process = require("process");
const {initializeAllClients} = require("./api-client");

module.exports.startApp = function(appThunk, opts = {}) {
  if(cluster.isMaster) {
    var os = require('os');
    for (var i = 0; i < (opts.workers || 4); i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
      cluster.fork();
    });
  } else {
    if(process.env.NODE_ENV != "production") {
      require("babel-register")(Object.assign({
        presets: ["react"],
        plugins: ["transform-es2015-modules-commonjs"]
      }, opts.babelOpts))
    }
    const app = appThunk();
    initializeAllClients()
      .then(app.listen(opts.port || 3000, () => console.log('Example app listening on port 3000!')))
      .catch(function(e) {
        var sleep = require("sleep-promise");
        console.error("Worker died - Aborting");
        console.error(e.stack);
        return new Promise((resolve) => resolve(cluster.worker.disconnect()))
          .then(() => sleep(opts.sleep || 250))
          .then(() => process.exit());
      });
  }
}
