const _ = require("lodash");

async function addLightPageHeaders(result, lightPages, { config, res, client, req }) {
  const isAmpSupported = _.get(
    result,
    ["data", "story", "is-amp-supported"],
    false
  );
  try {
    const enableLightPages = typeof lightPages === "function" && await lightPages(config);
    if (typeof lightPages === "function" && !enableLightPages) {
      return;
    }
  }
  catch (error) {
    console.log(error)
    return;
  }

  return isAmpSupported && res.set(
    "X-QT-Light-Pages-Url",
    `${req.protocol}://${req.hostname}/amp/story/${encodeURIComponent(
      req.path
    )}`
  );

}

module.exports = { addLightPageHeaders };
