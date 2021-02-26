const urlLib = require("url");
const set = require("lodash/set");
const get = require("lodash/get");
const { Story, AmpConfig } = require("../../impl/api-client-impl");
const {
  getSeoInstance,
  InfiniteScrollAmp,
  optimize,
  getDomainSpecificOpts,
} = require("../helpers");
const { storyToCacheKey } = require("../../caching");
const { addCacheHeadersToResult } = require("../../handlers/cdn-caching");

async function ampStoryPageHandler(req, res, next, staticParams) {
  try {
    const {
      client,
      config,
      domainSlug,
      cdnProvider = null,
      ampLibrary = require("@quintype/amp"),
      seo,
      templates,
      slots,
      render,
      featureConfig,
    } = staticParams;
    const opts = { templates, slots, render, featureConfig };
    const domainSpecificOpts = getDomainSpecificOpts(opts, domainSlug);
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
        domainSpecificOpts,
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
      set(
        domainSpecificOpts,
        ["featureConfig", "relatedStories", "stories"],
        relatedStories
      );
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
        domainSpecificOpts,
        ["featureConfig", "infiniteScroll", "infiniteScrollInlineConfig"],
        infiniteScrollInlineConfig
      );
    }

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      opts: { ...domainSpecificOpts, domainSlug },
      seo: seoTags ? seoTags.toString() : "",
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    const optimizedAmpHtml = await optimize(ampHtml);

    res.set("Content-Type", "text/html");
    addCacheHeadersToResult({
      res,
      cacheKeys: storyToCacheKey(config["publisher-id"], story),
      cdnProvider,
      config,
    });

    return res.send(optimizedAmpHtml);
  } catch (e) {
    return next(e);
  }
}

module.exports = { ampStoryPageHandler };
