const urlLib = require("url");
const set = require("lodash/set");
const AmpOptimizer = require("@ampproject/toolbox-optimizer");
const { Story, AmpConfig } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { storyToCacheKey } = require("../caching");
const { InfiniteScrollAmp, setCorsHeaders } = require("../amp-helpers");

const ampOptimizer = AmpOptimizer.create();

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

  const infiniteScrollAmp = new InfiniteScrollAmp({
    ampConfig,
    publisherConfig: config,
    client,
    queryParams: req.query,
  });
  const jsonResponse = await infiniteScrollAmp.getResponse({ itemsTaken: 5 }); // itemsTaken has to match with itemsToTake in getInitialInlineConfig method
  if (jsonResponse instanceof Error) return next(jsonResponse);
  res.set("Content-Type", "application/json; charset=utf-8");
  setCorsHeaders({ req, res, next, publisherConfig: config });
  if (!res.headersSent) return res.send(jsonResponse);
};

exports.handleAmpRequest = async function handleAmpRequest(
  req,
  res,
  next,
  {
    client,
    config,
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
    if (relatedStories.length) {
      set(opts, ["featureConfig", "relatedStories", "stories"], relatedStories);
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

    const infiniteScrollAmp = new InfiniteScrollAmp({
      ampConfig,
      publisherConfig: config,
      client,
    });
    const infiniteScrollInlineConfig = await infiniteScrollAmp.getInitialInlineConfig(
      {
        itemsToTake: 5,
        storyId: story["story-content-id"],
      }
    );
    if (infiniteScrollInlineConfig instanceof Error)
      return next(infiniteScrollInlineConfig);
    if (infiniteScrollInlineConfig) {
      set(
        opts,
        ["featureConfig", "infiniteScroll", "infiniteScrollInlineConfig"],
        infiniteScrollInlineConfig
      );
    }

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      relatedStories,
      client,
      opts,
      seo: seoTags ? seoTags.toString() : "",
      infiniteScrollInlineConfig,
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    const optimizedAmpHtml = await ampOptimizer.transformHtml(ampHtml);

    res.set("Content-Type", "text/html");
    addCacheHeadersToResult(
      res,
      storyToCacheKey(config["publisher-id"], story),
      cdnProvider
    );

    return res.send(optimizedAmpHtml);
  } catch (e) {
    return next(e);
  }
};
