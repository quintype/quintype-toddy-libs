const _ = require("lodash");

function addLightPageHeaders(result, lightPages, {
  config,
  res,
  client,
  req
}) {
  const isAmpSupported = _.get(
    result,
    ["data", "story", "is-amp-supported"],
    false
  );

  if (typeof lightPages === "function" && !lightPages(config)) {
    return;
  }

  isAmpSupported &&
    res.set(
      "X-QT-Light-Pages-Url",
      `${req.protocol}://${req.hostname}/amp/story/${encodeURIComponent(
        req.path
      )}`
    );
}

module.exports = {
  addLightPageHeaders
};
