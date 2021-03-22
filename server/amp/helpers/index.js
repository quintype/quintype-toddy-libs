const { setCorsHeaders } = require("./set-cors-headers");
const { optimize } = require("./optimize-amp-html");
const { getDomainSpecificOpts } = require("./get-domain-specific-opts");

module.exports = {
  setCorsHeaders,
  optimize,
  getDomainSpecificOpts,
};
