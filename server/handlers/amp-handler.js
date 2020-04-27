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
    const invalidElementsStrategy = ampConfig["invalid-elements-strategy"];
    const storyUrl = story.url;

    if (!story) {
      return next();
    }

    const ampifiedStory = ampifyStory({
      story,
      publisherConfig: config.config, // FIX THIS
      ampConfig: ampConfig.ampConfig, // FIX THIS
      relatedStories,
      client,
      opts: ampOpts,
    });
    if (ampifiedStory instanceof Error) return next(ampifiedStory);
    const { ampHtml, invalidElementsPresent } = ampifiedStory;
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
