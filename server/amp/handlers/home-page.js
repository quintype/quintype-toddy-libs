async function ampHomePageHandler(
  req,
  res,
  next,
  {
    client,
    config,
    domainSlug,
    seo,
    // cdnProvider = null,
    ampLibrary = require("@quintype/amp"),
    ...opts
  }
) {
  try {
    const homePageData = await opts.loadData(
      "home-page",
      { collectionSlug: "home" },
      config,
      client,
      { host: req.hostname, domainSlug }
    );
    return res.json(homePageData);
  } catch (e) {
    return next(e);
  }
}

module.exports = { ampHomePageHandler };
