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
  console.log("lightPages --------->", lightPages, lightPages(config), "isAmpSupported --------->", isAmpSupported);
  if (typeof lightPages === "function" && !lightPages(config)) {
    console.log("should't come here ----------------->");
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
