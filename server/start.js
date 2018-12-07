// istanbul ignore file
// This is the start file, to be called from your start.js

var cluster = require('cluster');
var process = require("process");
const {initializeAllClients} = require("./api-client");
const logger = require("./logger");

function startMaster({workers = 4}) {
  let terminating = false;

  for (var i = 0; i < workers; i++) {
    cluster.fork();
  }

  process.on("SIGTERM", function() {
    logger.info("Caught a SIGTERM. Terminating All Workers");
    terminating = true;
    for (const worker of Object.values(cluster.workers)) {
      worker.process.kill("SIGTERM");
    }
  });

  process.on("SIGHUP", function() {
    logger.info("Respawning All Workers.");
    for(const worker of Object.values(cluster.workers)) {
      // Create a new worker, then kill the old one when it starts listening
      const newWorker = cluster.fork();
      newWorker.on('listening', function() {
        worker.process.kill("SIGTERM");
      })
    }
  })

  cluster.on('exit', function (worker, code, signal) {
    logger.error('worker ' + worker.process.pid + ' died');
    const aliveWorkers = Object.values(cluster.workers).filter(worker => worker.state !== 'dead')

    if(terminating) {
      if(aliveWorkers.length == 0) {
        logger.info("All Workers Terminated. Gracefully Exiting");
        process.exit()
      }
    } else {
      if(aliveWorkers.length < workers) {
        cluster.fork();
      }
    }
  });
}

async function startWorker(appThunk, opts) {
  if (process.env.NODE_ENV != "production") {
    require("@quintype/build")(opts)
  }
  require("../assetify/server")();

  try {
    const app = appThunk();

    await initializeAllClients();
    const server = app.listen(opts.port || 3000, () => console.log('Example app listening on port 3000!'))

    process.on("SIGTERM", function() {
      server.close(function() {
        cluster.worker.disconnect();
        process.exit();
      })
    });
    process.on("SIGHUP", function() {})

  } catch (e) {
    if (process.env.NODE_ENV != "production") {
      console.log(e.stack)
    }

    e = e || "";
    const sleep = require("sleep-promise");
    logger.error(`Worker died - ${e.message || e}`);
    cluster.worker.disconnect()
    await sleep(opts.sleep || 250)
    process.exit();
  }
}

module.exports.startApp = function(appThunk, opts = {}) {
  if(cluster.isMaster) {
    startMaster(opts)
  } else {
    startWorker(appThunk, opts)
  }
}
