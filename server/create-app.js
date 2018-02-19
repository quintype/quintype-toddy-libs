const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const session = require("express-session");
const logger = require("./logger");

function createApp({assetHelper = require("./asset-helper"), publicFolder = "public"} = {}) {
  const app = express.apply(this, arguments);
  app.set("view engine", "ejs");

  app.use(morgan("short", {stream: {write: msg => logger.info(msg)}}))

  app.use(session({
    name: 'server-session-cookie-id',
    secret: 'my express secret',
    saveUninitialized: true,
    resave: true
  }));

  app.use((req, res, next) => {
    console.log(req.session, "user session")
    return next();
  });

  const assetFiles = assetHelper.assetFiles();

  app.use(express.static(publicFolder, {
    setHeaders: function (res, path, stat) {
      if(assetFiles.has(res.req.url)) {
        res.set('Cache-Control', 'public,max-age=31104000,s-maxage=31104000');
      }
      res.set('Vary', 'Accept-Encoding');
    }
  }));
  app.use(compression());

  return app;
}

module.exports = createApp;
