// istanbul ignore file

const fs = require("fs");
const yaml = require("js-yaml");

const publisher = yaml.safeLoad(fs.readFileSync("config/publisher.yml"));

module.exports = publisher;
