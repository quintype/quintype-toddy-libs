const urlLib = require("url");
const { Story, AmpConfig } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { storyToCacheKey } = require("../caching");

function getSeoInstance(seo, config, pageType = "") {
  return typeof seo === "function" ? seo(config, pageType) : seo;
}

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

    const story = await Story.getStoryBySlug(client, req.params.slug);
    if (!story) return next();
    const relatedStories = await story.getRelatedStories(client);

    if (
      !story["is-amp-supported"] &&
      ampConfig.ampConfig["invalid-elements-strategy"] ===
        "redirect-to-web-version"
    )
      return res.redirect(story.url);

    const seoInstance = getSeoInstance(seo, config, "story-page");
    const seoTags =
      seoInstance &&
      seoInstance.getMetaTags(config, "story-page", { data: story }, { url });

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      relatedStories,
      client,
      opts: { slots, templates },
      seoTags,
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
