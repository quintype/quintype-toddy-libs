const url = require("url");
const logError = require("./logger").error;

function prepareSlug(urls, req) {
  const destsClone = urls;
  urls.forEach((item) => {
    if (req.params[item]) {
      destsClone.splice(destsClone.indexOf(item), 1, `${req.params[item]}`);
    }
  });
  return `${destsClone.join("/")}`;
}

function getUrlRedirect(req, res, next, sourceUrlArray, chunkUrls) {
  const query = url.parse(req.url, true) || {};
  const search = query.search || "";

  if (req.params) {
    chunkUrls.forEach((chunkUrl) => {
      const extractedDestinationUrl =
        (chunkUrl.destinationUrl && chunkUrl.destinationUrl.split("/:")) || "";
      const prepareDestinationUrl = prepareSlug(extractedDestinationUrl, req);
      const extractedSourceUrl =
        (chunkUrl.sourceUrl && chunkUrl.sourceUrl.split("/:")) || "";
      const prepareSourceUrl = prepareSlug(extractedSourceUrl, req);
      logError(
        "Source url",
        prepareSourceUrl,
        "Destination url",
        prepareDestinationUrl
      );
      if (prepareSourceUrl === req.url) {
        return res.redirect(
          chunkUrl.statusCode,
          `${prepareDestinationUrl}${search}`
        );
      }
    });
  }
  const position = sourceUrlArray.indexOf(url.parse(req.url).pathname);
  if (position >= 0) {
    logError(
      "Destination url",
      `${chunkUrls[position].destinationUrl}${search}`
    );
    return res.redirect(
      chunkUrls[position].statusCode,
      `${chunkUrls[position].destinationUrl}${search}`
    );
  }
}

function extractAndProcess(req, res, next, urls) {
  const chunk = 10;
  while (urls.length) {
    const chunkUrls = urls.splice(0, chunk);
    const sourceUrlArray = chunkUrls.map((redUrl) => redUrl.sourceUrl);
    getUrlRedirect(req, res, next, sourceUrlArray, chunkUrls);
  }
}

exports.getRedirectUrl = async function getRedirectUrl(
  req,
  res,
  next,
  { redirectUrls, config }
) {
  if (typeof redirectUrls === "function") {
    const redirectUrlsList = await redirectUrls(config);
    if (redirectUrlsList.length > 0) {
      extractAndProcess(req, res, next, redirectUrlsList);
    }
  } else if (redirectUrls && redirectUrls.length > 0) {
    extractAndProcess(req, res, next, redirectUrls);
  }
};
