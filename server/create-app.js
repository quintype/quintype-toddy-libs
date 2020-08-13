/**
 * ```javascript
 * import createApp from "@quintype/framework/server/create-app";
 * ```
 *
 * @category Server
 * @module create-app
 */

const express = require("express");
const compression = require("compression");
const morgan = require("morgan");

const logger = require("./logger");
const { mountQuintypeAt } = require("./routes");

/**
 * Create an express app with various common configurations
 * @param {object} opts
 * @param {string | function} opts.mountAt Mount Quintype framework at a subdirectory. See [tutorial](https://developers.quintype.com/malibu/mount-at-a-subdirectory). If mountAt is a function, it must accept the current hostname and return the mount point.
 * @returns {Express} an express app
 */
function createApp({
  assetHelper = require("./asset-helper"),
  publicFolder = "public",
  mountAt,
  app = express(),
} = {}) {
  if (mountAt) {
    mountQuintypeAt(app, mountAt);
  }

  app.set("view engine", "ejs");

  app.use(morgan("short", { stream: { write: (msg) => logger.info(msg) } }));

  const assetFiles = assetHelper.assetFiles();

  app.use(
    express.static(publicFolder, {
      setHeaders(res, path, stat) {
        if (assetFiles.has(res.req.url)) {
          res.set("Cache-Control", "public,max-age=31104000,s-maxage=31104000");
        }
        res.setHeader("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com assets.prothomalo.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
        res.set("Vary", "Accept-Encoding");
      },
      maxAge: "1h",
    })
  );
  app.use(compression());

  return app;
}

module.exports = createApp;
