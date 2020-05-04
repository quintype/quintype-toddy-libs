const { Story, AmpConfig } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { storyToCacheKey } = require("../caching");

// function getSeoInstance(seo, config, pageType = "") {
//   return typeof seo === "function" ? seo(config, pageType) : seo;
// }

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
    cdnProvider,
    ampLibrary = require("@quintype/amp"),
  }
) {
  try {
    const { ampifyStory } = ampLibrary;
    // eslint-disable-next-line no-return-await
    const ampConfig = await config.memoizeAsync(
      "amp-config",
      async () => await AmpConfig.getAmpConfig(client)
    );

    const story = await Story.getStoryBySlug(client, req.params.slug);
    const relatedStories = await story.getRelatedStories(client);
    if (!story) return next();

    if (
      !story["is-amp-supported"] &&
      ampConfig.ampConfig["invalid-elements-strategy"] ===
        "redirect-to-web-version"
    )
      return res.redirect(story.url);

    // const seoInstance = getSeoInstance(seo, config, result.pageType);
    // const seoTags =
    //   seoInstance &&
    //   seoInstance.getMetaTags(
    //     config,
    //     result.pageType || match.pageType,
    //     result,
    //     { url }
    //   );

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      relatedStories,
      client,
      opts: { slots, templates },
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
