const url = require("url");

function prepareSlug(urls, req) {
  const destsClone = urls;
  urls.forEach((item) => {
    if (req.params[item]) {
      destsClone.splice(destsClone.indexOf(item), 1, `${req.params[item]}`);
    }
  });
  return `${destsClone.join("/")}`;
}

function getUrlRedirect(app, logError, sourceUrlArray, chunkUrls) {
  app.get(sourceUrlArray, (req, res, next) => {
    const query = url.parse(req.url, true) || {};
    const search = query.search || "";
    if (req.params) {
      chunkUrls.forEach((chunkUrl) => {
        const extractedDestinationUrl =
          (chunkUrl.destinationUrl && chunkUrl.destinationUrl.split("/:")) ||
          "";
        const destinationPrepareUrl = prepareSlug(extractedDestinationUrl, req);
        const extractedSourceUrl =
          (chunkUrl.sourceUrl && chunkUrl.sourceUrl.split("/:")) || "";
        const prepareSourceUrl = prepareSlug(extractedSourceUrl, req);
        logError(
          "Source url ",
          prepareSourceUrl,
          "Destination url",
          destinationPrepareUrl
        );
        if (prepareSourceUrl === req.url) {
          res.redirect(
            chunkUrl.statusCode,
            `${destinationPrepareUrl}${search}`
          );
        }
      });
    }
    const pos = sourceUrlArray.indexOf(url.parse(req.url).pathname);
    if (pos >= 0) {
      logError("Destination url", `${chunkUrls[pos].destinationUrl}${search}`);
      return res.redirect(
        chunkUrls[pos].statusCode,
        `${chunkUrls[pos].destinationUrl}${search}`
      );
    }
    return next();
  });
}

function chunkUrl(app, logError, urls) {
  const chunk = 10;
  while (urls.length) {
    const chunkUrls = urls.splice(0, chunk);
    const sourceUrlArray = chunkUrls.map((redUrl) => redUrl.sourceUrl);
    getUrlRedirect(app, logError, sourceUrlArray, chunkUrls);
  }
}
async function getRedirectUrls(redirectUrlsfun) {
  const returnUrlsData = await redirectUrlsfun;
  return returnUrlsData;
}

exports.getRedirectUrl = function getRedirectUrl(app, logError, redirectUrls) {
  if (typeof redirectUrls === "function") {
    const redirectUrlsdata = getRedirectUrls(redirectUrls);
    if (redirectUrlsdata.length > 0) {
      chunkUrl(app, logError, redirectUrlsdata);
    }
  } else if (redirectUrls && redirectUrls.length > 0) {
    chunkUrl(app, logError, redirectUrls);
  }
};
