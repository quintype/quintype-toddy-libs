const _ = require("lodash");

async function addLightPageHeaders(result, lightPages, { config, res, client, req }) {
  const isAmpSupported = _.get(
    result,
    ["data", "story", "is-amp-supported"],
    false
  );

  const enableLightPages = typeof lightPages === "function" && await lightPages(config);
  console.log(typeof enableLightPages, enableLightPages, 'enableLightPages--->>>>>--')
  if (!enableLightPages) {
    console.log('---amp false')
    return;
  }
  console.log('---amp pages true---')

 isAmpSupported && res.set(
    "X-QT-Light-Pages-Url",
    `${req.protocol}://${req.hostname}/amp/story/${encodeURIComponent(
      req.path
    )}`
  );
  return;
}

module.exports = { addLightPageHeaders };
