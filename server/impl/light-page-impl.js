const _ = require("lodash");

async function addLightPageHeaders(result, lightPages, { config, res, client, req }) {
  const isAmpSupported = _.get(
    result,
    ["data", "story", "is-amp-supported"],
    false
  );
  const enableLightPages = await lightPages(config);
  if (typeof lightPages === "function" && !enableLightPages) {
    console.log('---amp')
    return;
  }
  console.log('---amp true')
  isAmpSupported &&
    res.set(
      "X-QT-Light-Pages-Url",
      `${req.protocol}://${req.hostname}/amp/story/${encodeURIComponent(
        req.path
      )}`
    );
}

module.exports = { addLightPageHeaders };
