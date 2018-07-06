// istanbul ignore file

const fs = require("fs");
const yaml = require("js-yaml");

module.exports = fs.readdirSync("config")
                   .filter(x => x.match(/\.yml$/))
                   .reduce((acc, x) => {
                     acc[x.replace(/\.yml$/, "")] = yaml.safeLoad(fs.readFileSync(`config/${x}`))
                     return acc;
                   }, {});
