const { Story, AmpConfig } = require("../impl/api-client-impl");

exports.handleAmpRequest = async function handleAmpRequest(
  req,
  res,
  next,
  { client, config, ampOpts, ampifyStory = require("@quintype/amp") }
) {
  try {
    // eslint-disable-next-line no-return-await
    const ampConfig = await config.memoizeAsync(
      "amp-config",
      async () => await AmpConfig.getAmpConfig(client)
    );

    const story = await Story.getStoryBySlug(client, req.params.slug);
    const relatedStories = await story.getRelatedStories(client);
    const invalidElementsStrategy = ampConfig["invalid-elements-strategy"];
    const storyUrl = story.url;

    if (!story) {
      return next();
    }

    const { ampHtml, invalidElementsPresent } = ampifyStory({
      story,
      publisherConfig: config,
      ampConfig,
      relatedStories,
      client,
      opts: ampOpts,
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    if (
      invalidElementsPresent &&
      invalidElementsStrategy === "redirect-to-web-version"
    )
      return res.redirect(storyUrl);
    res.set("Content-Type", "text/html");
    return res.send(ampHtml);
  } catch (e) {
    return next(e);
  }
};
