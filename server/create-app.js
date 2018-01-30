const express = require("express");
const compression = require("compression");
const morgan = require("morgan");

const logger = require("./logger");

function createApp() {
  const app = express.apply(this, arguments);
  app.set("view engine", "ejs");

  app.use(morgan("short", {stream: {write: msg => logger.info(msg)}}))

  app.use(express.static("public"));
  app.use(compression());

  return app;
}

module.exports = createApp;
