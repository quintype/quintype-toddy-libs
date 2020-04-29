const { Story, AmpConfig } = require("../impl/api-client-impl");

exports.handleAmpRequest = async function handleAmpRequest(
  req,
  res,
  next,
  { client, config, ampOpts, ampLibrary = require("@quintype/amp") }
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

    const ampHtml = ampifyStory({
      story,
      publisherConfig: config.config,
      ampConfig: ampConfig.ampConfig,
      relatedStories,
      client,
      opts: ampOpts,
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    res.set("Content-Type", "text/html");
    return res.send(ampHtml);
  } catch (e) {
    return next(e);
  }
};
