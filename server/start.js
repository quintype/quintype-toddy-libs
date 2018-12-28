// istanbul ignore file
// This is the start file, to be called from your start.js

const cluster = require('cluster');
const process = require("process");
const {initializeAllClients} = require("./api-client");
const logger = require("./logger");

function startMaster({workers = 4}) {
  let terminating = false;

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  process.on("SIGTERM", () => {
    logger.info("Caught a SIGTERM. Terminating All Workers");
    terminating = true;
    for (const worker of Object.values(cluster.workers)) {
      worker.process.kill("SIGTERM");
    }
  });

  process.on("SIGHUP", () => {
    logger.info("Respawning All Workers.");
    Object.values(cluster.workers).forEach((worker, index) => {
      if(index < workers) {
        const newWorker = cluster.fork();
        newWorker.on('listening', () => {
          worker.process.kill("SIGTERM");
        })
      } else {
        worker.process.kill("SIGTERM");
      }
    })
  })

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`worker ${  worker.process.pid  } died`);
    const aliveWorkers = Object.values(cluster.workers).filter(worker => worker.state !== 'dead')

    if(terminating) {
      if(aliveWorkers.length == 0) {
        logger.info("All Workers Terminated. Gracefully Exiting");
        process.exit()
      }
    } else if(aliveWorkers.length < workers) {
        cluster.fork();
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

    process.on("SIGTERM", () => {
      server.close(() => {
        cluster.worker.disconnect();
        process.exit();
      })
    });
    process.on("SIGHUP", () => {})

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
