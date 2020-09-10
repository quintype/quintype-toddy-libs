const urlLib = require("url");
const set = require("lodash/set");
const get = require("lodash/get");
const { Story, AmpConfig } = require("../../server/impl/api-client-impl");
const { getSeoInstance, InfiniteScrollAmp, optimize } = require("../helpers");
const { storyToCacheKey } = require("../../server/caching");
const {
  addCacheHeadersToResult,
} = require("../../server/handlers/cdn-caching");

async function ampStoryPageHandler(
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
      const storiesToTake = get(
        opts,
        ["featureConfig", "relatedStories", "storiesToTake"],
        5
      );
      relatedStories = relatedStoriesCollection.items
        .filter(
          (item) =>
            item.type === "story" && item.id !== story["story-content-id"]
        )
        .slice(0, storiesToTake)
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
    const optimizedAmpHtml = await optimize(ampHtml);

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
}

module.exports = { ampStoryPageHandler };
