const urlLib = require("url");
const { Story, AmpConfig } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { storyToCacheKey } = require("../caching");
const { InfiniteScrollData } = require("../amp-helpers");

function getSeoInstance(seo, config, pageType = "") {
  return typeof seo === "function" ? seo(config, pageType) : seo;
}

exports.handleInfiniteScrollRequest = async function handleInfiniteScrollRequest(
  req,
  res,
  next,
  { client, config }
) {
  const ampConfig = await config.memoizeAsync(
    "amp-config",
    async () => await AmpConfig.getAmpConfig(client)
  );
  const { "story-id": storyId } = req.query;
  if (!storyId)
    return next(
      new Error(
        `Please pass "story-id" query parameter while calling amp-infinite-scroll API`
      )
    );
  const infiniteScrollData = new InfiniteScrollData({
    storyId,
    ampConfig,
    publisherConfig: config,
    client,
  });
  const jsonResponse = await infiniteScrollData.getJson();
  if (jsonResponse instanceof Error) return next(jsonResponse);
  res.set("Content-Type", "application/json; charset=utf-8");
  res.set("Access-Control-Allow-Origin", "*");
  return res.send(jsonResponse);
};

exports.handleAmpRequest = async function handleAmpRequest(
  req,
  res,
  next,
  {
    client,
    config,
    slots = {},
    templates = {},
    seo,
    cdnProvider = null,
    ampLibrary = require("@quintype/amp"),
    ...opts
  }
) {
  try {
    const url = urlLib.parse(req.url, true);
    const { ampifyStory } = ampLibrary;
    // eslint-disable-next-line no-return-await
    const ampConfig = await config.memoizeAsync(
      "amp-config",
      async () => await AmpConfig.getAmpConfig(client)
    );
    const slug = String(0);
    const story = await Story.getStoryBySlug(client, req.params[slug]);
    let relatedStoriesCollection;
    let relatedStories = [];

    if (!story) return next();
    if (ampConfig["related-collection-id"])
      relatedStoriesCollection = await client.getCollectionBySlug(
        ampConfig["related-collection-id"]
      );
    if (relatedStoriesCollection) {
      relatedStories = relatedStoriesCollection.items
        .filter(
          (item) =>
            item.type === "story" && item.id !== story["story-content-id"]
        )
        .slice(0, 5)
        .map((item) => item.story);
    }

    if (
      !story["is-amp-supported"] &&
      ampConfig.ampConfig["invalid-elements-strategy"] ===
        "redirect-to-web-version"
    )
      return res.redirect(story.url);

    const seoInstance = getSeoInstance(seo, config, "story-page-amp");
    const seoTags =
      seoInstance &&
      seoInstance.getMetaTags(
        config,
        "story-page-amp",
        { data: story, config },
        { url }
      );

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      relatedStories,
      client,
      opts: { slots, templates, ...opts },
      seo: seoTags ? seoTags.toString() : "",
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    res.set("Content-Type", "text/html");

    addCacheHeadersToResult(
      res,
      storyToCacheKey(config["publisher-id"], story),
      cdnProvider
    );

    return res.send(ampHtml);
  } catch (e) {
    return next(e);
  }
};
