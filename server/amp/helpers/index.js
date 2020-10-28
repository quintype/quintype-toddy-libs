const { InfiniteScrollAmp } = require("./infinite-scroll");
const { setCorsHeaders } = require("./set-cors-headers");
const { optimize } = require("./optimize-amp-html");
const { getDomainSpecificOpts } = require("./get-domain-specific-opts");

function getSeoInstance(seo, config, pageType = "") {
  return typeof seo === "function" ? seo(config, pageType) : seo;
}

module.exports = {
  InfiniteScrollAmp,
  setCorsHeaders,
  optimize,
  getSeoInstance,
  getDomainSpecificOpts,
};
