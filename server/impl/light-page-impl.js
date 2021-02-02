const _ = require("lodash");

function addLightPageHeaders(result, lightPages, {
  config,
  res,
  client,
  req,
  shouldEncodeURI
}) {
  const isAmpSupported = _.get(
    result,
    ["data", "story", "is-amp-supported"],
    false
  );

  if (typeof lightPages === "function" && !lightPages(config)) {
    return;
  }

  if(isAmpSupported){
    let {path} = req || "";

    path = shouldEncodeURI ? encodeURIComponent(path) : path;

    res.set(
        "X-QT-Light-Pages-Url",
        `${req.protocol}://${req.hostname}/amp/story/${path}`
    );
  }

}

module.exports = {
  addLightPageHeaders
};
